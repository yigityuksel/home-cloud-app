require('dotenv').config()
const googlePhotoHandler = require('./google-api/google-photos-handler');


googlePhotoHandler.getDriveFiles();