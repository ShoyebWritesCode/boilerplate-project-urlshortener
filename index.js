const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlLinks = [];
let shortUrlId = 0;

app.post('/api/generate', (req, res) => {
  const { url: originalUrl } = req.body;

  if (!originalUrl) {
    return res.json({ error: 'Invalid URL' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'Invalid URL' });
  }

  const modifiedUrl = parsedUrl.hostname.replace(/^www\./, '');

  dns.lookup(modifiedUrl, (err) => {
    if (err) {
      return res.json({ error: 'Invalid URL' });
    }

    const existingLink = urlLinks.find(
      (link) => link.originalUrl === originalUrl
    );

    if (existingLink) {
      return res.json({
        original_url: originalUrl,
        short_url: existingLink.shortUrl,
      });
    }

    ++shortUrlId;
    const urlObject = {
      originalUrl: originalUrl,
      shortUrl: shortUrlId,
    };
    urlLinks.push(urlObject);

    return res.json({ original_url: originalUrl, short_url: shortUrlId });
  });
});

app.get('/api/redirect/:shortId', (req, res) => {
  const { shortId } = req.params;

  const urlLink = urlLinks.find((link) => link.shortUrl == shortId);

  if (urlLink) {
    return res.redirect(urlLink.originalUrl);
  } else {
    return res.json({ error: 'Invalid Short URL' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
