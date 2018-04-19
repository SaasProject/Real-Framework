var config = require('config.json');
var express = require('express');
var router = express.Router();
var uploadService = require('services/uploadFile.service');
 
// routes
router.post('/uploadFile', uploadFile);
router.put('/deleteFile/:_id', deleteFile);
router.get('/readFile', readFile);
 
module.exports = router;

/*
    Function name: Upload File Controller Read File
    Author(s): Flamiano, Glenn
    Date Modified: 2018/04/03
    Update Date: 2018/04/03
    Description: current user parameters is received and sends it to backend service
    Parameter(s): request, response
    Return: response.status
*/
function readFile(req, res) {
    uploadService.readFile(req, res)
        .then(function (url) {
            if (url) {
                res.send(url);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

/*
    Function name: Upload File Controller Delete File
    Author(s): Flamiano, Glenn
    Date Modified: 2018/04/03
    Update Date: 2018/04/03
    Description: current user parameters is received and sends it to backend service
    Parameter(s): request, response
    Return: response.status
*/
function deleteFile(req, res) {
    uploadService.deleteFile(req, res)
       .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

/*
    Function name: Upload File Controller Upload File
    Author(s): Flamiano, Glenn
    Date Modified: 2018/03/01
    Update Date: 2018/04/04
    Description: input file is received as req and uploadPic function from services/user.service.js
        is called to begin the upload using multer
    Parameter(s): request, response
    Return: response.status
*/
function uploadFile(req, res) {
    uploadService.uploadFile(req, res)
       .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}