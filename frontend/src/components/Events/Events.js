import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import './events.css';

let backendUrl = 'http://localhost:8000/api/';

function Events() {
    let [events, setEvents] = useState([]);
    
    useEffect(() => {
        const fetchEvents = async() => {
            try {
                const response = await axios.get(`${backendUrl}event`);
                setEvents(response.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);
        

    return(
        <Container fluid className="event_container">
            <h1>Events</h1>
            <div className="event-list">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div key={event.id} className="event-item">
                            <h3>{event.title}</h3>
                            <img src={event.image_url} alt={event.title} />
                        </div>
                    ))
                ) : (
                    <p>No events available</p>
                )}
            </div>
        </Container>
    )
}

export default Events;