const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

let isOnline = true;

//
app.use('/api/greeting', (request, response) => {
  if (!isOnline) {
    return response.sendStatus(400);
  }

  const name = request.query ? request.query.name : undefined;
  return response.send({content: `Hello, ${name || 'World'}`});
});

app.use('/api/killme', (request, response) => {
  isOnline = false;
  return response.send('Stopping HTTP server, Bye bye world !');
});

app.use('/api/health/readiness', (request, response) => {
  return response.send('OK');
});

app.use('/api/health/liveness', (request, response) => {
  return isOnline ? response.send('OK') : response.sendStatus(500);
});

module.exports = app;