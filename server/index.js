// + Refresh_token solo se devuelve en la primera autorización
"use strict";

const express = require("express");
const http = require("http");
const oauth2 = require("./app/utils/oauth");
//const fs = require("fs").promises;
//const readline = require("readline");
//const { google } = require("googleapis");

const app = express();
const httpServer = http.Server(app);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use("/api/v1", require("./app/routes/v1"));

(async () => {
  try {
    oauth2.initOAuth2();
    const server = await httpServer.listen(8080);
    console.log(`[SUCCESS] webserver is running on ${server.address().port}.`);
  } catch (err) {
    console.log(err);
    process.exit(0);
  }
})();

//const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// El 'token.json' almacena el access y refresh token del usuario,
// y es creado automáticamente cuando el flujo de autorización se completa por primera vez
//const TOKEN_PATH = "token.json"; // no necesario
/*
const loadCredentials = async () => {
  try {
    const content = await fs.readFile("credentials.json");
    // Autoriza a un cliente credenciales, luego llama a la api de gmail
    authorize(JSON.parse(content), listLabels);
  } catch (error) {
    return console.log("Error loading client secret file:", error);
  }
};*/

/**
 * Crea un cliente OAuth2 con las credenciales dadas, y luego ejecuta el callback
 * @param {Object} credentials Credenciales de autorización del cliente
 * @param {function} callback Callback para llamar al cliente autorizado
 */
/*
async function authorize(credentials, callback) {
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
    callback(oAuth2Client);
  } catch (error) {
    getNewToken(oAuth2Client, callback);
  }
}*/

/**
 * Obtiene y almacena un nuevo token después de solicitar la autorización de usuario,
 * luego ejecuta el callback con el cliente OAuth2 autorizado
 * @param {google.auth.OAuth2} oAuth2Client Cliente de OAuth al que hay que darle el token
 * @param {getEventsCallback} callback Callback para el cliente autorizado
 */
/*function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline", // para obtener un refresh_token?
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();

    //const {tokens} = await oauth2Client.getToken(code);
    //oauth2Client.setCredentials(tokens);

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
  });
}
*/
/**
 * Enlista los labels de la cuenta de usuario
 * @param {google.auth.OAuth2} auth Cliente OAuth autorizado
 */
/*async function listLabels(auth) {
  try {
    const gmail = google.gmail({ version: "v1", auth: auth });
    const res = await gmail.users.labels.list({ userId: "me" });
    const labels = res.data.labels;
    if (labels.length) {
      labels.forEach((label) => console.log(`- ${label.name}`));
    } else {
      console.log("No labels found.");
    }
  } catch (error) {
    console.log("The API returned an error: " + err);
  }
}*/
