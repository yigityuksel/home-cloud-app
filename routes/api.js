const express = require('express');
const router = express.Router();

const googlePhotoHandler = require('./../google-api/google-photos-handler');


router.get('/', function (req, res, next) {

    googlePhotoHandler.getDriveFiles(req.oauth2, function (err, data) {

        res.json(data);
        res.send();

    });

});

router.get('/download', function (req, res, next) {

    googlePhotoHandler.downloadDriveFile('1zEI-JoeB-u-SGK0_3UhbDLBHX6Z0M9H22A', '054.JPG', req.oauth2);

});

module.exports = router;
