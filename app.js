require('dotenv').config()
const googlePhotoHandler = require('./google-api/googlePhotoHandler');

googlePhotoHandler.initalSyncDriveFiles();
