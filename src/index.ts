import express from 'express';
import axios from 'axios';
import WebSocket from 'ws';
import { getCountries } from './countries';
import { getCountryByIssLocation } from './iss';
import { getIssLocationInUtm } from './utm';
import cors from 'cors'; 

const app = express();
const port = process.env.PORT || 3000;

// Use the cors middleware
app.use(cors());

// Load countries GeoJSON
const countries = getCountries();

// Route to get the list of countries
app.get('/countries', (req, res) => {
  res.json(countries);
});

// Route to get the country that the ISS is currently above
app.get('/iss', async (req, res) => {
  const country = await getCountryByIssLocation();
  res.json({ country });
});

// Route to get the current location of the ISS in UTM
app.get('/utm', async (req, res) => {
  const location = await getIssLocationInUtm();
  res.json(location);
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// WebSocket setup
const wss = new WebSocket.Server({ server });

let currentCountry = 'Ocean'; // Default value

// Send ISS data every 10 seconds
setInterval(async () => {
  const { latitude, longitude } = (await axios.get('http://api.open-notify.org/iss-now.json')).data.iss_position;
  const country = await getCountryByIssLocation();
  if (country !== currentCountry) {
    currentCountry = country;
    // Broadcast the new country to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ latitude, longitude, country }));
      }
    });
  }
}, 10000);

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ country: currentCountry }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
