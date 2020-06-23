// https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#oauth-2.0-endpoints
'use strict';

const fs = require('fs').promises;
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = require('./scopes');
const TOKEN_PATH = 'token.json';

//let oAuth2Client;

const initOAuth2 = async () => {
  try {
    const credentials = await fs.readFile('credentials.json');
    await authorize(JSON.parse(credentials));
    console.log(`[SUCCESS] OAuth2 initialized.`);
  } catch (error) {
    console.log('initOAuth2 error: ', error);
  }
};

/**
 * Crea un cliente OAuth2 con las credenciales
 * @param {Object} credentials Credenciales de autorización del cliente
 */
const authorize = async (credentials) => {
  let oAuth2Client;
  try {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const token = await fs.readFile(TOKEN_PATH); // comprueba si se ha almacenado un token
    oAuth2Client.setCredentials(JSON.parse(token)); // establece las credenciales
    listLabels(oAuth2Client);
    return oAuth2Client;
  } catch (error) {
    await getNewToken(oAuth2Client);
    listLabels(oAuth2Client);
    //getUserDetails(oAuth2Client);
  }
};

/**
 * Obtiene y almacena un nuevo token después de solicitar la autorización de usuario,
 * luego ejecuta el callback con el cliente OAuth2 autorizado
 * @param {google.auth.OAuth2} oAuth2Client Cliente de OAuth al que hay que darle el token
 */
const getNewToken = async (oAuth2Client) => {
  try {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await question('Enter the code from that page here: ', rl);
    rl.close();
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens)); // almacena el token en 'token.json'
    console.log('Token stored to', TOKEN_PATH);
  } catch (err) {
    console.log('getNewToken error: ', err);
  }
};

/**
 * Enlista los labels de la cuenta de usuario
 * @param {google.auth.OAuth2} auth Cliente OAuth autorizado
 */
const listLabels = async (auth) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.labels.list({ userId: 'me' });

    const labels = res.data.labels;
    if (labels.length) {
      labels.forEach((label) => console.log(`- ${label.name}`));
    } else console.log('No labels found.');
  } catch (error) {
    console.log('listLabels error: ' + error);
  }
};

const getUserDetails = async (auth) => {
  try {
    const oauth2 = google.oauth2({
      auth,
      version: 'v2',
    });
    const usr_info = await oauth2.userinfo.get({ auth });
    return usr_info;
  } catch (error) {
    console.log('getUserDetails error: ', error);
  }
};

const question = (questionText, rl) => {
  return new Promise((resolve) => {
    rl.question(questionText, (input) => resolve(input));
  });
};

module.exports = {
  initOAuth2,
};
