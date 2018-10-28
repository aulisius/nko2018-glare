const path = require("path");
const express = require('express');
const app = express();
let { PORT = 3000 } = process.env;

app.use('/', express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => console.log(`http://localhost:${PORT}/`));