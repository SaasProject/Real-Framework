var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser: true});
db.bind('language');
var userService = require('services/user.service');
var emailService = require('services/email.service');
var fs=require('fs');

function getLanguage(language){
    try{
        var file=fs.readFileSync(__dirname + '/../languages/'+language+'.json', 'utf8');
    }catch(err){
        //if default language matched filename not found. get english
        var file=fs.readFileSync(__dirname + '/../languages/english.json', 'utf8');
    }
    var languages=JSON.parse(file);
    return languages;
}
 
router.get('/', function (req, res) {
    db.language.findOne({ name: 'defaultLanguage' }, function (err, results) {
        if (err) res.json({message: err});

        if (results) {
            // log user out
            delete req.session.token;
            delete req.session.user;

            var selectedLanguage = getLanguage(results.value);
            selectedLanguage = selectedLanguage[Object.keys(selectedLanguage)[0]];
         
            // move success message into local variable so it only appears once (single read)
            var viewData = { success: req.session.success, languages: selectedLanguage};
            delete req.session.success;
            req.session.lang = selectedLanguage;
            
            
            if(req.query.expired){
                return res.render('login', {error: 'Your session has expired'});
            }
            else{
                return res.render('login', viewData);
            }
        } else {
            //not found
            res.json({message: 'Error no default language is found'});
        }
    });
});
 
router.post('/', function (req, res) {
            //start
            if (req.body.formType == 'login'){
                // authenticate using api to maintain clean separation between layers
                userService.authenticate(req.body.email, req.body.password)
                .then(function (token) {
                    if (token) {
                        // authentication successful
                        // save JWT token in the session to make it available to the angular app
                        req.session.token = token.token;
                        req.session.user = token.user;
                        // redirect to returnUrl
                        var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
                        res.redirect(returnUrl);
                    } else {
                        // authentication failed
                        return res.render('login', { error: req.session.lang.loginPage.flash.wrongEmailPass, email: req.body.email, forgotPassEmail: req.body.email, languages: req.session.lang});
                    }
                })
                .catch(function (err) {
                    return res.render('login', { error: 'An error occurred' });
                });
            }
            else {
                // check email using api to maintain clean separation between layers
                userService.resetPass(req.body.email)
                .then(function (newPass) {
                    if (newPass){
                            const output = `
                            <p>This mail is sent to recover your account</p>
                            <h3> Account Details</h3>
                            <ul>
                                <li>Email: ${req.body.email}</li>
                                <li>New Password: ${newPass}</li>
                            </ul>
                            <h3>Message</h3>
                            <p>Please change your password to your convenience.</p>
                            `;

                            var mailInfos = {};
                            mailInfos.to = req.body.email;
                            mailInfos.subject = "Recover Account";
                            mailInfos.text = "Your Password Request Recovery";
                            mailInfos.html = output;
                    
                        emailService.sendMail(mailInfos).then(function(){
                            // return to login page with success message
                                req.session.success = req.session.lang.loginPage.flash.emailSent;
                        
                                // redirect to returnUrl
                                var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
                                res.redirect(returnUrl);
                        })
                        .catch(function (err) {
                                return res.render('login', { error: req.session.lang.loginPage.flash.emailInvalid, email: req.body.email, modal: true, languages: req.session.lang });
                            });
                    } else {
                        return res.render('login', { error: req.session.lang.loginPage.flash.emailNotReg, email: req.body.email, modal: true, languages: req.session.lang });
                    }
                })
                .catch(function (err) {
                    return res.render('login', { error: 'An error occurred' });
                });
            }
            //end
});

 
module.exports = router;