const fs = require('fs')
const { google } = require('googleapis')

const CREDENTIALS = JSON.parse(fs.readFileSync('./google-api/credentials.json', 'utf8'));
const SCOPES = ['https://www.googleapis.com/auth/drive']

function authClient(callback) {

    google.auth.getClient({
        credentials: CREDENTIALS,
        scopes: SCOPES
    }).then((auth) => {
        google.auth.getDefaultProjectId().then(project => {
            console.log("User Authenticated");          
            callback(null, auth);

        }).catch(err => {
            console.error('Error occured while trying to fetch default project id.', err)
            callback(err);
        })
    }).catch(err => {
        console.log('Error occured while trying to create oauth client.', err)
        callback(err);
    });

}

module.exports = {
    authClient
}