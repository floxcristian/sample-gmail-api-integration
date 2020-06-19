const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// Si se modifican estos 'scopes', eliminar el 'token.json'
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
// El 'token.json' almacena el access y refresh token del usuario,
// y es creado automáticamente cuando el flujo de autorización se completa por primera vez
const TOKEN_PATH = "token.json";

// Carga el 'client_secret' desde 'credentials.json'
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Autoriza a un cliente credenciales, luego llama a la gmail api
  console.log("content: ", content);
  console.log("listLabels: ", listLabels);
  authorize(JSON.parse(content), listLabels);
});

/**
 * Crea un cliente OAuth2 con las credenciales dadas, y luego ejecuta el callback
 * @param {Object} credentials Credenciales de autorización del cliente
 * @param {function} callback Callback para llamar al cliente autorizado
 */
function authorize(credentials, callback) {
  console.log("credentials: ", credentials);
  const { client_secret, client_id, redirect_uris } = credentials.web;
  console.log("client_secret: ", client_secret);
  console.log("client_id: ", client_id);
  console.log("redirect_uris: ", redirect_uris);
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Comprueba si se ha almacenado un token
  fs.readFile(TOKEN_PATH, (err, token) => {
    console.log("token: ", token);
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Obtiene y almacena un nuevo token después de solicitar la autorización de usuario,
 * luego ejecuta el callback con el cliente OAuth2 autorizado
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
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
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  gmail.users.labels.list(
    {
      userId: "me",
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const labels = res.data.labels;
      if (labels.length) {
        console.log("Labels:");
        labels.forEach((label) => {
          console.log(`- ${label.name}`);
        });
      } else {
        console.log("No labels found.");
      }
    }
  );
}
