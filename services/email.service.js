var Q = require('q');
var nodemailer = require('nodemailer');

var service = {};

service.sendMail = sendMail;

module.exports = service;

function sendMail(mailInfos){

    var deferred = Q.defer();


    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saasteamaws@gmail.com', // generated ethereal user
            pass: '12angDum^^y'  // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"SaaS Team 👻" <saasteamaws@gmail.com>', // sender address
        to: mailInfos.to, // list of receivers
        subject: mailInfos.subject, // Subject line
        text: mailInfos.text, // plain text body
        html: mailInfos.html // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            deferred.reject(error);
        }
            deferred.resolve();
    });

    return deferred.promise;
}