const path = require("path");
const express = require('express');
const app = express();
const port = 3000;

app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/calibrate', (req, res) => res.sendFile(path.join(__dirname, 'capture.html')));
app.listen(port, () => console.log(`Glare running at ${port}!`));