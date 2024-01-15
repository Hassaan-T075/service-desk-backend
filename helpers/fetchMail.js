const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const Mail = require('../models/mail')

async function readMailBox() {

  async function extractGmailAddress(inputString) {

    var match = inputString.match(/<([^>]+)>/);

    if (match) {
      var gmailAddress = match[1];
      return gmailAddress;
    } else {
      return inputString;
    }
  }

  let mbox = [];
  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = path.join(process.cwd(), 'token.json');
  const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

  /**
   * Reads previously authorized credentials from the save file.
   *
   * @return {Promise<OAuth2Client|null>}
   */
  async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  /**
   * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
  async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  /**
   * Load or request or authorization to call APIs.
   *
   */
  async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  }

  /**
   * Lists the labels in the user's account.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  async function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
      userId: 'me',
    });

    const messages = res.data.messages || [];
    //mbox = messages
    for (const message of messages) {
      const emailId = message.id;

      const emailResponse = await gmail.users.messages.get({
        userId: 'me',
        id: emailId,
      });

      const emailData = await emailResponse.data;
      console.log(emailData.payload.headers[25])
      
      const sender = await extractGmailAddress(emailData.payload.headers[16].value);

      
      obj = {
        "ID": emailData.id,
        "From": sender,
        "Subject": emailData.payload.headers[19].value,
        "Body": emailData.payload.parts[0].body.data,
        "Status": "pending",
      }

      //console.log(emailData)

      mbox.push(obj)

      // Process the emailData to extract information
      const mail = new Mail(obj);

      // before fetching mails from mail box, check if it is already present in database
      Mail.findOne({ ID: emailData.id })
        .then(res => {
          if (res === null) {
            // save the mail if it is not present 
            mail.save()
              .then(result => {
              })
              .catch(err => {
                console.log(err);
              });
          }
        })
        .catch(err => {
          console.log(err)
        })

    }

    //console.log(mbox)
    return mbox
  }

  //authorize().then(() => { const data = listLabels; return data }).catch(console.error);
  return authorize().then(listLabels).catch(console.error);

}

module.exports = readMailBox