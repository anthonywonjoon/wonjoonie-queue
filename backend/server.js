const express = require('express')
const axios = require('axios');
const stringSimilarity = require('string-similarity');
const app = express()
const port = 8000
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public'));

let spotifyToken = null;
let tokenExpirationTime = null;

const pool = new Pool({
    user: `${process.env.PG_USER}`,
    host: `${process.env.PG_HOST}`,
    database: `${process.env.PG_DB}`,
    password: `${process.env.PG_PASS}`,
    port: 5432,
});

const verifyCredentials = (username, password) => {
    return process.env.ADMIN_USER === username && process.env.ADMIN_PASS === password;
}

// retrieve and save Spotify bearer token
const fetchSpotifyToken = async () => {
    try {
        const res = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        spotifyToken = res.data.access_token;
        tokenExpirationTime = Date.now() + res.data.expires_in * 1000;
    } catch (error) {
        console.error('Error fetching Spotify token: ', error);
    }
}

// check if token exists and/or is expired
const checkToken = async (req, res, next) => {
    if (!spotifyToken || Date.now() >= tokenExpirationTime) {
        await fetchSpotifyToken();
    }
    next();
}

const normalize = (str) => str.toLowerCase().trim();

app.get('/api/spotify/search', checkToken, async (req, res) => {
    let { song_name, song_artist } = req.query;
    let data_found = false;

    try {
        const response = await axios.get(`https://api.spotify.com/v1/search`, {
            headers: {
                'Authorization': `Bearer ${spotifyToken}`
            },
            params: {
                q: song_name,
                type: 'track',
                limit: 10
            }
        });
        data_found = true;
        
        let tracks = response.data.tracks.items;

        let bestMatch = null;
        let highestScore = 0;
        const scoreThreshold = 0.6; // Set a threshold for similarity (0 to 1)

        let requestTrack = normalize(song_name);
        let requestArtist = normalize(song_artist);

        tracks.forEach(track => {

            let trackName = normalize(track.name);
            let artistName = normalize(track.artists[0].name);

            let trackNameScore = stringSimilarity.compareTwoStrings(trackName, requestTrack);
            let trackArtistScore = stringSimilarity.compareTwoStrings(artistName, requestArtist);

            let combinedScore = (trackNameScore * 0.2) + (trackArtistScore * 0.8);

            if (combinedScore > highestScore) {
                highestScore = combinedScore;
                bestMatch = track;
            }
        });

        if (bestMatch && highestScore >= scoreThreshold) {
            console.log(`Best match: ${bestMatch.name} by ${bestMatch.artists.map(artist => artist.name).join(', ')}`);
            res.status(200).json(bestMatch);
        } else {
            console.log('No suitable match found');
            res.status(204).send("No suitable match found");
        }
    } catch (error) {
        console.error('Error making Spotify API request: ', error);
    }
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

let songQueue = [];

app.get('/api/songs', (req, res) => {
    res.json(songQueue);
})

app.post('/api/songs', async (req, res) => {
    let { id, title, artist } = req.body;
    
    if (typeof id !== 'number' || !title || !artist) {
        return res.status(400).json({ message: 'Invalid song data' });
    }

    const spotifyData = await axios.get('http://localhost:8000/api/spotify/search', {
        params: { song_name: title, song_artist: artist }
    });

    let trackData = spotifyData.data;
    let img = "";

    console.log(trackData.name);

    if (spotifyData.status === 200) {
        title = trackData.name;
        artist = '';
        for (let i = 0; i < trackData.artists.length; i++) {
            if (i == trackData.artists.length - 1) { artist += `${trackData.artists[i].name} `; break; }
            artist += `${trackData.artists[i].name}, `;
        }
        img = trackData.album.images[2].url;
        console.log(img);
    }

    songQueue.push({ id, title, artist });
    res.status(201).json({ id, title, artist, img });
})

app.delete('/api/songs/pop', (req, res) => {
    if (songQueue.length > 0) {
        let removedSong = songQueue.shift();
        res.status(200).json({ message: "First song removed", song: removedSong});
    } else {
        res.status(400).json({ message: "No songs in queue" });
    }
})

app.get('/api/event/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY date DESC');

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events: ', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
})

app.post('/api/event/add', async (req, res) => {
    const { username, password, title, description, image_url, date } = req.body;
    console.log(/^\d{4}-\d{2}-\d{2}$/.test(date));

    if (!verifyCredentials(username, password)) {
        return res.status(401).send('Invalid credentials');
    }

    try {
        let formattedDate;
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            formattedDate = date; // If it's already in the correct format
            
        } else {
            return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
        }

        const query = `INSERT INTO events (title, description, image_url, date) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(query, [title, description, image_url, formattedDate]);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding event');
    }
})

// Remove selected events
app.post('/api/event/remove', async (req, res) => {
    const { event_ids } = req.body;

    if (!event_ids || event_ids.length === 0) {
        return res.status(400).json({ error: 'No event IDs provided' });
    }

    try {
        const query = 'DELETE FROM events WHERE id = ANY($1::int[])';
        await pool.query(query, [event_ids]);
        res.json({ message: 'Events removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove events' });
    }
});

app.get('/admin', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public/adminpanel.html'));
});

// Get all events
app.get('/api/event/list', async (req, res) => {
    try {
        console.log(1);
        const events = await pool.query('SELECT id, title, date FROM events');  // Adjust this query to your schema
        
        res.json(events.rows);  // Ensure you're returning an array of event objects
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})