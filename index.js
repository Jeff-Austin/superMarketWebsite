const express = require('express');
const path = require('path');

const app = express();

/* serves main page */
app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: path.join(__dirname, 'dist')
  });
});

// app.post('/user/add', function(req, res) {
// /* some server side logic */
// res.send('OK');
// });

/* serves all the static files */
app.get(/^(.+)$/, (req, res) => {
  console.log('static file request : ' + req.params);
  res.sendFile(req.params[0], {
    root: path.join(__dirname, 'dist')
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log('Listening on ' + port);
});
