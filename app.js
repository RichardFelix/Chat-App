//SET NODE_ENV=production
//SET NODE_ENV=development

var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config.js'),
    connectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose').connect(config.dbURL),
    passport = require('passport'),
    FacebookStragety = require('passport-facebook').Strategy,
    rooms = [];

app.set('views', path.join(__dirname, 'views')); 
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
var env = process.env.NODE_ENV || 'development';
if(env === 'development'){
    //dev settings
    app.use(session({secret:config.sessionSecret, saveUninitialized:true, resave:true}));
}else{
    //production settings
    app.use(session({secret:config.sessionSecret, 
                     store: new connectMongo({                        mongooseConnection:mongoose.connections[0],
                         stringify:true}), 
                     saveUninitialized:true, 
                     resave:true
    }));
}

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport, FacebookStragety, config, mongoose);

require('./routes/routes.js')(express, app, passport, config, rooms);

app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket.io/socket.io.js')(io, rooms);

server.listen(app.get('port'), function(){
    console.log('Running on port : ' + app.get('port'));
})
                 
//app.listen(3000, function(){
//    console.log('greta working on port 3000');
//    console.log('Mode:' + env);
//})  

////////////////////////////////////////////////////
//     Testing MongooseJS connection 
///////////////////////////////////////////////////
//var userSchema = mongoose.Schema({ username: String,
//                                  password: String,
//                                  fullname: String
//                                 });
//
//var Person = mongoose.model('users', userSchema);
//
//var John = new Person({ username:'John',
//                        password:'john123',
//                        fullname:'John Doe'
//                      });
//
//John.save(function(err){
//    console.log('Done!');
//})
