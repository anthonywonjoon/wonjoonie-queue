const { Pool } = require('pg');
require('dotenv').config();

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

exports.getAllEvents = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY date DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events: ', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

exports.addEvent = async (req, res) => {
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
};

exports.removeEvents = async (req, res) => {
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
}

exports.listEvents = async (req, res) => {
    try {
        console.log(1);
        const events = await pool.query('SELECT id, title, date FROM events');  // Adjust this query to your schema
        
        res.json(events.rows);  // Ensure you're returning an array of event objects
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}