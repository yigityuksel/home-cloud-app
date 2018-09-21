require('dotenv').config()
const googlePhotoHandler = require('./google-api/googlePhotoHandler');

googlePhotoHandler.initalSyncDriveFiles();

//googlePhotoHandler.getStartPageToken(1);

//googlePhotoHandler.getFile();