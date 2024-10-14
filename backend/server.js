const express = require('express')
const app = express();
const port = 8000;
const cors = require('cors');
const bodyParser = require('body-parser');

//const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes.js');
const spotifyRoutes = require('./routes/spotifyRoutes.js');
const songRoutes = require('./routes/songsRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api/event', eventRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/songs', songRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})