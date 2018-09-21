require('dotenv').config()
const googleDriveHandler = require('./google-api/googleDriveHandler');

googleDriveHandler.InitialDriveSync();
