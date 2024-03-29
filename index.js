const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

let urlDatabase = [];
let count = 0;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;

  const urlPattern = /^(https?):\/\/(?:www\.)?[\w\-.]+\.[a-z]{2,}(?:\/\S*)?$/i;
  if (!urlPattern.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  const domain = new URL(url).hostname;
  dns.lookup(domain, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    count++;
    const shortUrl = count.toString();
    urlDatabase.push({ original_url: url, short_url: shortUrl });

    res.json({ original_url: url, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:short_url', function (req, res) {
  const { short_url } = req.params;
  const entry = urlDatabase.find((entry) => entry.short_url === short_url);

  if (!entry) {
    return res.json({ error: 'invalid url' });
  }

  res.redirect(entry.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
