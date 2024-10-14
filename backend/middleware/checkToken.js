const axios = require('axios');

let spotifyToken = null;
let tokenExpirationTime = null;

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

    req.spotifyToken = spotifyToken;
    next();
}

module.exports = checkToken;