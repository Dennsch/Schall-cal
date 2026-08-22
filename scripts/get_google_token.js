const { google } = require('googleapis');
const http = require('http');
const { URL } = require('url');
const open = require('open');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/calendar.readonly',
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);

  if (url.pathname !== '/oauth2callback') {
    res.writeHead(404);
    res.end();
    return;
  }

  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    res.end('No authorization code received.');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log('\n========================================');
    console.log('GOOGLE REFRESH TOKEN');
    console.log('========================================\n');

    console.log(tokens.refresh_token);

    console.log('\n========================================');
    console.log('Copy this into Vercel as:');
    console.log('GOOGLE_REFRESH_TOKEN');
    console.log('========================================\n');

    res.writeHead(200, {
      'Content-Type': 'text/html',
    });

    res.end(`
      <h1>Success!</h1>
      <p>You can close this window.</p>
      <p>The refresh token has been printed in your terminal.</p>
    `);

    setTimeout(() => {
      server.close();
    }, 1000);

  } catch (error) {
    console.error(error);

    res.writeHead(500);
    res.end('Failed to exchange authorization code.');
  }
});

server.listen(3000, async () => {
  console.log('Waiting for Google authorization...');
  console.log('');
  console.log(authorizationUrl);
  console.log('');

  await open(authorizationUrl);
});