// https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#oauth-2.0-endpoints
"use strict";

const fs = require("fs").promises;
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = require("./scopes");
const TOKEN_PATH = "token.json";
const gmail = google.gmail({ version: "v1", auth });

const initOAuth2 = async () => {
  try {
    const credentials = await fs.readFile("credentials.json");
    console.log("crendetials: ", credentials);
    const oAuth2Client = await authorize(JSON.parse(credentials));
    //console.log("oAuth2Client: ", oAuth2Client);
    console.log(`[SUCCESS] OAuth2 initialized.`);
    listLabels(oAuth2Client);
  } catch (error) {
    console.log("xx: ", error);
    return console.log("Error loading client secret file:", error);
  }
};

/**
 * Crea un cliente OAuth2 con las credenciales
 * @param {Object} credentials Credenciales de autorización del cliente
 */
const authorize = async (credentials) => {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  try {
    // Comprueba si se ha almacenado un token
    const token = await fs.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (error) {
    await getNewToken(oAuth2Client);
    console.log("yy: ", error);
  }
};

/**
 * Obtiene y almacena un nuevo token después de solicitar la autorización de usuario,
 * luego ejecuta el callback con el cliente OAuth2 autorizado
 * @param {google.auth.OAuth2} oAuth2Client Cliente de OAuth al que hay que darle el token
 */
const getNewToken = async (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline", // para obtener un refresh_token?
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const code = await question("Enter the code from that page here: ", rl);
    rl.close();
    const token = await oAuth2Client.getToken(code); // access_token dura 1 hora?
    oAuth2Client.setCredentials(token);
    // Almacena el token en 'token.json'
    await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log("Token stored to", TOKEN_PATH);
  } catch (err) {
    console.log("zz: ", err);
  }

  /*
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();

    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Almacena el token en disco para posteriores ejecuciones del programa
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });*/
};

/**
 * Enlista los labels de la cuenta de usuario
 * @param {google.auth.OAuth2} auth Cliente OAuth autorizado
 */
async function listLabels(auth) {
  try {
    console.log("auth: ", auth);
    const res = await gmail.users.labels.list({ userId: "me" }); // aqui muere
    console.log("cague.....");
    const labels = res.data.labels;
    if (labels.length) {
      labels.forEach((label) => console.log(`- ${label.name}`));
    } else {
      console.log("No labels found.");
    }
  } catch (error) {
    console.log("The API returned an error: " + error);
  }
}

const question = (questionText, rl) => {
  return new Promise((resolve) => {
    rl.question(questionText, (input) => resolve(input));
  });
};

module.exports = {
  initOAuth2,
};
