// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();

// Try to use environment-specified port or fallback to 3000
const defaultPort = 3001;
const port = process.env.PORT || defaultPort;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read data from db.json
function readData() {
  const data = fs.readJsonSync('db.json', { throws: false }) || { patients: {}, examinations: [] };
  return data;
}

// Helper function to write data to db.json
function writeData(data) {
  fs.writeJsonSync('db.json', data, { spaces: 2 });
}

// API endpoint to get patient data
app.get('/api/patients/:rm', (req, res) => {
  const rm = req.params.rm;
  const data = readData();
  const patient = data.patients[rm];
  if (patient) {
    res.json(patient);
  } else {
    res.status(404).json({ error: 'Patient not found' });
  }
});

// API endpoint to add or update a patient
app.post('/api/patients', (req, res) => {
  const patientData = req.body;
  const data = readData();
  data.patients[patientData.rm] = patientData;
  writeData(data);
  res.json({ message: 'Patient data saved' });
});

// API endpoint to get all examinations
app.get('/api/examinations', (req, res) => {
  const data = readData();
  res.json(data.examinations);
});

// API endpoint to add a new examination
app.post('/api/examinations', (req, res) => {
  const examinationData = req.body;
  const data = readData();
  data.examinations.unshift(examinationData); // Add to the beginning
  writeData(data);
  res.json({ message: 'Examination data saved' });
});

// Attempt to start the server on the specified port
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle port conflict error and switch to an available port
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Trying a different port...`);
    server.close();
    const newPort = defaultPort + 1; // Change the port to 3001 if 3000 is unavailable
    app.listen(newPort, () => {
      console.log(`Server is now running at http://localhost:${newPort}`);
    });
  } else {
    console.error('Error starting the server:', err);
  }
});
