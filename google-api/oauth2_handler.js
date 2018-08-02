const fs = require('fs')
const { google } = require('googleapis')

const CREDENTIALS = JSON.parse(fs.readFileSync('./google-api/credentials.json', 'utf8'));
const SCOPES = ['https://www.googleapis.com/auth/drive']

module.exports = (app, express) => {
    app.use((req, res, next) => {
        google.auth.getClient({
            credentials: CREDENTIALS,
            scopes: SCOPES
        }).then((auth) => {
            google.auth.getDefaultProjectId().then(project => {
                console.log("User Authenticated")
                req.oauth2 = auth
                req.oauth2_project = project
                next();
            }).catch(err => {
                console.error('Error occured while trying to fetch default project id.', err)
                req.oauth2 = auth
                req.oauth2_project = CREDENTIALS.project_id
                next()
            })
        }).catch(err => {
            console.log('Error occured while trying to create oauth client.', err)
            next()
        })
    })
}