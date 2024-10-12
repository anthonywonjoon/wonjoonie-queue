// Node Dependencies
const axios = require('axios');
require('dotenv').config();

let songQueue = [];

exports.getSongQueue = async (req, res) => {
    res.json(songQueue);
}

exports.addSongToQueue = async (req, res) => {
    let { id, title, artist } = req.body;
    
    if (typeof id !== 'number' || !title || !artist) {
        return res.status(400).json({ message: 'Invalid song data' });
    }

    const spotifyData = await axios.get('http://localhost:8000/api/spotify/search', {
        params: { song_name: title, song_artist: artist }
    });

    let trackData = spotifyData.data;
    let img = "";

    if (spotifyData.status === 200) {
        title = trackData.name;
        artist = '';
        for (let i = 0; i < trackData.artists.length; i++) {
            if (i == trackData.artists.length - 1) { artist += `${trackData.artists[i].name} `; break; }
            artist += `${trackData.artists[i].name}, `;
        }
        img = trackData.album.images[2].url;
    }

    songQueue.push({ id, title, artist });
    res.status(201).json({ id, title, artist, img });
}

exports.removeSongFromQueue = async (req, res) => {
    if (songQueue.length > 0) {
        let removedSong = songQueue.shift();
        res.status(200).json({ message: "First song removed", song: removedSong});
    } else {
        res.status(400).json({ message: "No songs in queue" });
    }
}