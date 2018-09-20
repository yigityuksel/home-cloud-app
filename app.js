require('dotenv').config()
const googlePhotoHandler = require('./google-api/googleDriveHandler');

//googlePhotoHandler.InitialDriveSync();

googlePhotoHandler.getStartPageToken(1);