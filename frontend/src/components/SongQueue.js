import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:8000/api'

function SongQueue() {
    const [songs, setSongs] = useState([]);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [img, setImg] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API_BASE_URL}/songs`)
            .then(res => {
                setSongs(res.data);
            })
            .catch(error => console.error('Error getting songs: ', error));
    }, []);

    const addSong = () => {
        const newSong = {
            id: songs.length + 1,
            title: title,
            artist: artist,
            img: img
        };

        axios.post(`${API_BASE_URL}/songs`, newSong)
            .then(res => {
                setSongs([...songs, res.data]);
                setTitle('');
                setArtist('');
                setImg('');
                setError('');
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 400) {
                        setError(error.response.data.message);
                    } else {
                        setError('An unexpected error has occured.');
                    }
                } else {
                    setError('Network error. Please try again later.');
                }
            });
    };

    return(
        <div>
            <h1>Song Requests</h1>
            <ul>
                {songs.map(song => (
                    <li key={song.id}>
                        <img src={song.img} alt=''></img>
                        {song.title} by {song.artist}
                    </li>
                ))}
            </ul>
            
            <div>
                {/* Input for song title */}
                <input
                    type="text"
                    placeholder="Song Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />  
            </div>
            
            <div>
                {/* Input for artist name */}
                <input
                    type="text"
                    placeholder="Artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                />  
            </div>

            {/* Show error message if validation fails */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={addSong}>Add New Song</button>
        </div>
    )
}

export default SongQueue;