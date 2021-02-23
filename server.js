const chalk = require('chalk');
const figlet = require('figlet');
const dotenv = require('dotenv');
dotenv.config();
var express  = require('express')
  , session  = require('express-session')
  , passport = require('passport')
  , Strategy = require('./lib').Strategy
  , path     = require('path')
  , ejs      = require('ejs')
  , req      = require('request')
  , https    = require("https")
  , app      = express();

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'email', 'guilds'];

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: scopes
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

app.use(session({
    secret:  process.env.APP_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views',__dirname+'/views');
app.get('/', checkAuth, function(req, res) {
  var i, x = "";
    var d = req.user;
   req.session.name = d;
    res.render(`./index.ejs`,{user:req, res, d:req.session.name});
});

app.get('/error', function(req, res) {
    res.render(`./error.ejs`);
});
app.get('/login', passport.authenticate('discord', { scope: scopes }), function(req, res) {});
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/fail' }), function(req, res) { res.redirect('/') } 
);
app.get('/discord', function(req, res) {
    res.redirect(process.env.LINK_SERVIDOR_DISCORD);
});
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
app.get('/perfil', checkAuth, function(req, res) {
    var i, x = "";
    var d = req.user;
    var guild = d.guilds;
    var myguild = process.env.ID_SERVIDOR_DISCORD;
    var uname = (d.username + "#" + d.discriminator);
    var uid = d.id;
    var email = d.email;
    var avatar = d.avatar;
    for (i in guild) {
        if (guild[i].id == myguild) {
            x = d.guilds[i].id;
        }
    }
    if (x == myguild) { 
        req.session.name = uname;
        req.session.email = email;
        req.session.uid = uid;
        req.session.avatar = avatar;
        res.render(`./perfil.ejs`,{uname:req.session.name, uid:req.session.uid, email:req.session.email, avatar:req.session.avatar}); 
    } else {
        res.redirect(process.env.LINK_SERVIDOR_DISCORD);
    }
});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
            res.redirect('/login');  
}


app.listen(process.env.PUERTO, function (err) {
    if (err) return console.log(err)
    console.log(chalk.blue(`-------------------------------------------------------`));
    console.log(chalk.green('Web Iniciada en el Puerto: ' + process.env.PUERTO));
    console.log(chalk.red(`----WEB EN----`));
    console.log(chalk.yellow(`http://localhost:${process.env.PUERTO}/`));
    console.log(chalk.yellow(`o`));
    console.log(chalk.yellow(`${process.env.DOMINIO}`));
    console.log(chalk.blue(`-------------------------------------------------------`));
})
