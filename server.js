/*Main Server of the Saas Team Project*/
require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
 
//added by dyan0 --socket.io for realtime
var http = require('http').Server(app);
var io = require('socket.io')(http);

//macku
var net = require('net'),
    JsonSocket = require('json-socket');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://192.168.223.65:27017/";
var ObjectID = require('mongodb').ObjectID
;var fs = require('fs');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/profile_pictures'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true, cookie: {maxAge: 1000 * 60 * 60 * 9}})); //equvalent of 9h (same as jwt)
 
// use JWT auth to secure the api   // edited by dyan0: added '/api/users/emailOn'
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register', '/api/users/emailOn'] }));
 
// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/languages',require('./controllers/api/language.controller'));
app.use('/api/modules', require('./controllers/api/modules.controller'));
app.use('/api/uploadFile', require('./controllers/api/uploadFile.controller'));

//added by dyan0
io.on('connection', function(socket){
    
    //for asset changes in realtime
    socket.on('userChange', function(){
        io.emit('userChange');
    });
    /* socket.on('fieldsChange', function(){
        io.emit('fieldsChange');
    }); */
    socket.on('languageChange', function(option){
        io.emit('languageChange', option);
    });

    //console.log('a user is connected');
    socket.on('disconnect', function(){
        //console.log('a user has disconnected');
    })
});

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});


 
// start server --edited by dyan0 from app.listen to http.listen
var server = http.listen(5000, function () {
    console.log('HTTP PORT listening at ' + server.address().port);

    var server1 = net.createServer();
    server1.listen(5001);
    console.log('TCP PORT listening at ' + server1.address().port);
    /*
        Function name: Data Receiver From Dummy/RFID Function
        Author(s): Sanchez, Macku
        Date Modified: February 2018
        Description: Receives Data Through network
    */
    server1.on('connection', function(socket) { 
        socket = new JsonSocket(socket); 
        socket.on('message', function(message) {
            socket.on('error', ()=> {});

            var displayDate;
            var start = new Date();
            var year = start.getFullYear();
            var month = ''+(start.getMonth()+1);
            var date = ''+start.getDate();
            var hour = ''+start.getHours();
            var minutes = ''+start.getMinutes();
            var seconds = ''+start.getSeconds();

            if (month.length < 2) month = '0' + month;
            if (date.length < 2) date = '0' + date;
            if (hour.length < 2) hour = '0' + hour;
            if (minutes.length < 2) minutes = '0' + minutes;
            if (seconds.length < 2) seconds = '0' + seconds;

            displayDate = year+"-"+month+"-"+date+" "+hour+":"+minutes+":"+seconds;
       
            message.created_date=displayDate;
            message.updated_date=displayDate;
            
            var assetParam = message;
            var set;
            var assettg;
            //console.log(assetParam);

            /*
                Function name: Device Check Function
                Author(s): Sanchez, Macku
                Date Modified: January 2018
                Description: Checks for Registered Devices
            */
            MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabase");
                    dbo.collection("devices").findOne({device_id: assetParam.device_id}, 
                        function(err, result) {
                            if (err) throw err;
                            if(result===null){
                                
                                //console.log(assetParam.device_id+" isn't registered") 
                            }else{
                                searchForAssets();
                                
                            }   
                            
                            db.close();
                          });
                });
            
            /*
                Function name: Asset Check Function
                Author(s): Sanchez, Macku
                Date Modified: January 2018
                Description: Checks for existing Assets
            */

            function searchForAssets(){
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabase");
                    dbo.collection("assets").findOne({asset_tag: assetParam.asset_tag}, 
                        function(err, result) {
                            if (err) throw err;
                            if(result===null){
                                checkAssetforAdd(); 
                            }else{
                                assettg = result.location;
                                checkAssetforUpdate();
                            }   
                            
                            db.close();
                          });
                });
            }

            /*
                Function name: Warehouse Limit Check Function for Adding Assets
                Author(s): Sanchez, Macku
                Date Modified: January 2018
                Description: Checks If the Assets inside the Warehouse are over the Warhouse's capacity
            */
            function checkAssetforAdd(){
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabase");

                    dbo.collection("devices").findOne({device_id: assetParam.device_id}, 
                            function(err, deviceResult) {
                                if (err) throw err;
                                dbo.collection("assets").find({location: deviceResult.location}).toArray(function(err, assetResult) {
                                    if (err) throw err;
                                    dbo.collection("warehouses").findOne({name: deviceResult.location}, 
                                        function(err, warehouseResult) {
                                            if (err) throw err;
                                            var wQ = assetResult.length;
                                            var wC = parseInt(warehouseResult.capacity);
                                            if(wQ>=wC){
                                                createDB();
                                            }else{
                                                createDB();
                                            }
                                    });
                                });
                            });
                });
            }
            /*
                Function name: Warehouse Limit Check Function for Updating Assets
                Author(s): Sanchez, Macku
                Date Modified: January 2018
                Description: Checks If the Assets inside the Warehouse are over the Warhouse's capacity
            */
            function checkAssetforUpdate(){
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabase");
                    dbo.collection("devices").findOne({device_id: assetParam.device_id}, 
                            function(err, deviceResult) {
                                if (err) throw err;
                                dbo.collection("assets").find({location: deviceResult.location}).toArray(function(err, assetResult) {
                                    if (err) throw err;
                                    dbo.collection("warehouses").findOne({name: deviceResult.location}, 
                                        function(err, warehouseResult) {
                                        if (err) throw err;
                                        var wQ = assetResult.length;
                                        var wC = parseInt(warehouseResult.capacity);

                                        if(deviceResult.location===assettg){
                                            
                                            set={location: "",
                                                Status:  assetParam.status,
                                                updated_date: assetParam.updated_date
                                                };
                                                updateDB();
                                                 
                                        }else{
                                            if(wQ>=wC){
                                                
                                                set={location: deviceResult.location,
                                                     //Status:  assetParam.status,
                                                     updated_date: assetParam.updated_date
                                                };
                                                updateDB();
                                            }else{
                                               
                                                set={location: deviceResult.location,
                                                    // Status:  assetParam.status,
                                                     updated_date: assetParam.updated_date
                                                };
                                                updateDB();
                                                 
                                            }
                                        }
                                        db.close();
                                });

                        });

                        
                    });
                });
            }

            /*
                Function name: Add Asset Function
                Author(s): Sanchez, Macku
                Date Modified: January 2018
                Description: Adds New Assets in the Database
            */
            function createDB(){

                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabase");
                    dbo.collection("devices").findOne({device_id: assetParam.device_id}, 
                            function(err, deviceResult) {
                                if (err) throw err;
                                assetParam.location=deviceResult.location;
                                delete assetParam.device_id;
                                dbo.collection("assets").insertOne(assetParam, function(err, res) {
                                    if (err) throw err;
                                    var log={
                                        performedBy:"RFID",
                                        event:"insert",
                                        date:displayDate,
                                        details:""+assetParam.asset_tag+" added by "+deviceResult.device_id
                                    }
                                    dbo.collection("logs").insertOne(log, function(err,res){
                                        if (err) throw err;
                                        io.emit('assetChange');
                                        db.close();
                                    });
                                });
                    });
                });

            }
            /*
                Function name: Update Asset Function
                Author(s): Sanchez, Macku
                Date Modified: January 2018
                Description: Updates Assets in the Database
            */
            function updateDB(){
                
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabase");
                    dbo.collection("assets").findOne({asset_tag: assetParam.asset_tag},function(err,assetResultfind){
                        if(err) throw err;
                        var fromWarehouse = assetResultfind.location
                        dbo.collection("assets").updateOne(
                                { asset_tag: assetParam.asset_tag }, 
                                { $set: set },
                                function(err, res) {
                                    if (err) throw err;
                                    var log={
                                        performedBy:"RFID",
                                        event:"update",
                                        date:displayDate,
                                        details:""+assetParam.asset_tag+" moved to "+set.location+" from "+fromWarehouse
                                    }
                                    dbo.collection("logs").insertOne(log, function(err,res){
                                        if (err) throw err;
                                        io.emit('assetChange');
                                        db.close();
                                    });
                        });
                    });
                });
            }
        });
    });
});