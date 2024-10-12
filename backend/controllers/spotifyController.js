// Node dependencies
require('dotenv').config();
const axios = require('axios');
const stringSimilarity = require('string-similarity');

const normalize = (str) => str.toLowerCase().trim();

exports.searchSpotify = async (req, res) => {
    let { song_name, song_artist } = req.query;
    let data_found = false;

    try {
        const spotifyToken = req.spotifyToken;

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
}