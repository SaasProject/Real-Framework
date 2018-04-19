var express = require('express');
var router = express.Router();
var emailService = require('services/email.service');
 
// routes
router.post('/sendMail', sendMail);
 
module.exports = router;

/*
    Function name: Send Mail
    Author(s): Omugtong, Jano
    Date Modified: 2018/04/13
    Update Date: 2018/04/13
    Description: used to send an email
    Parameter(s): request, response
    Return: response.status
*/
function sendMail(req, res) {
    emailService.sendMail(req.body).then(function(){    // req.body is an object which includes (to, subject, text and html)
        res.status(200).send();
    }).catch(function(err){
        res.status(400).send();
    });
}
