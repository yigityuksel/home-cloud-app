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

function getGoogleApi(callback) {

    authClient(function (error, auth) {

        if (error) {
            logger.error(error);
            callback(error);
        }

        callback(null, google.drive({
            version: 'v3',
            auth: auth
        }));

    });
}

module.exports = {
    getGoogleApi
}