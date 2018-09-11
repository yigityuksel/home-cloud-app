const fs = require('fs')
const { google } = require('googleapis')

const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const SCOPES = [process.env.SCOPES]

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