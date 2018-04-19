var express = require('express');
var router = express.Router();

/*
        Function name: route restrictions
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: redirects the user to the login page (not angular, but ejs) when session expires
        Parameter(s): 
        Return: none
    */
// use session auth to secure the angular app files
router.use('/', function (req, res, next) {
    if (req.path !== '/login' && !req.session.token) {
        return res.redirect('/login?returnUrl=' + encodeURIComponent('/app' + req.path));
    }
 
    //put next() to execute other middleware in case of no redirects
    next();
});
/*
        Function name: get token
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: gets the token stored in req parameter (token is set upon login)
        Parameter(s): 
        Return: none
    */
// make JWT token available to angular app
router.get('/token', function (req, res) {
    res.send(req.session.token);
});

/*
        Function name: rename route & directory
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: when user accesses '/' link, the 'app' directory is used
        Parameter(s): 
        Return: none
    */
// serve angular app files from the '/app' route
router.use('/', express.static('app'));
 
module.exports = router;