import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

let backendUrl = 'http://localhost:8000/api/';

function AdminPanel() {
    const searchParams = new URLSearchParams(window.location.search);
    const secret = searchParams.get('secret');
    const navigate = useNavigate();

    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');
    let [title, setTitle] = useState('');
    let [description, setDescription] = useState('');
    let [image_url, setImage_url] = useState('');
    let [date, setDate] = useState('');

    if (secret !== '123') {
        alert('Access Denied');
        return navigate('/events', { replace: true });
    }
    

    const handleSubmit= (action) => {
        let data = { username, password, title, description, image_url, date };

        axios.post(`${backendUrl}${action}`, data)
            .then(response => {
                console.log('Response: ', response.data);
                alert(`Item ${action === 'event/add' ? 'added' : 'removed'} successfully`);
            })
            .catch(error => {
                console.error('There was an error: ', error);
                alert('Invalid credentials or request failed');
            });
    };

    return(
        <div>
            <h1>Login and Manage Events</h1>
            <form onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Event Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>Image URL:</label>
                    <input
                        type="text"
                        value={image_url}
                        onChange={(e) => setImage_url(e.target.value)}
                    />
                </div>
                <div>
                    <label>Date (YYYY-MM-DD):</label>
                    <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <button type="button" onClick={() => handleSubmit('event/add')}>Add Event</button>
                <button type="button" onClick={() => handleSubmit('event/remove')}>Remove Event</button>
            </form>
        </div>
    );
}

export default AdminPanel;