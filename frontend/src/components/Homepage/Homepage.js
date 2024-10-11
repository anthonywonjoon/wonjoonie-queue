import React, { useState, useEffect } from 'react';
import Events from '../Events/Events';
import SongQueue from '../SongQueue';

import { Container, Row, Col, Image, Tabs, Tab } from 'react-bootstrap';
import './homepage.css';
import logo from '../../images/logo.PNG';

function Homepage() {

    return(
        <Container fluid className="hp_banner_container">
            <Row>
                <div>
                    <Image src={logo} className="hp_logo"></Image>
                </div>
                <div>
                    <a href="https://instagram.com/wonjoonmusic" className="hp_social_logo" target="__blank"><i class="bi bi-instagram"></i></a>
                </div>
            </Row>
            <Row>
                <h1>Wonjoonie</h1>
            </Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                <Tabs defaultActiveKey="events" id="app-tabs" className="mb-3">
                    {/* Events Tab */}
                    <Tab eventKey="events" title="Events">
                        <div>
                        <Events />
                        </div>
                    </Tab>

                    {/* Song Requests Tab */}
                    <Tab eventKey="song-requests" title="Song Requests">
                        <div>
                        <SongQueue />
                        </div>
                    </Tab>

                    {/* Contact Info Tab */}
                    <Tab eventKey="contact-info" title="Contact Info">
                        <div>
                        <h2>Contact Info</h2>
                        <p>Get in touch through our social links or email.</p>
                        </div>
                    </Tab>
                    {/* <Tab eventKey="admin" title="Admin">
                        <div>
                        <AdminPanel />
                        </div>
                    </Tab> */}
                    </Tabs>
                </Col>
            </Row>
        </Container>
        

    )
}

export default Homepage;