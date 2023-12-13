// Imports the modules needed
var express = require ('express')
var ejs = require('ejs')
var mysql = require('mysql');
const bodyParser = require('body-parser');

// For login/logout authentication:
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Creates the express application object
const app = express()
const port = 8000
app.use(bodyParser.urlencoded({ extended: true }));

// Defines the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'appuser',
    password: 'app2027',
    database: 'schoolNet'
});

// Connects to the database
db.connect((err) => {
    if(err) {
        throw err;
        console.log("Error!", err.message);
    }
    console.log('Connected to the schoolNet database');
})
global.db = db;

// Static Files - sets up css
app.use(express.static(__dirname + '/public'));

// Defines website metadata
var websiteData = {websiteName: "School Net"}

// Sets the directory where Express will pick up html files
app.set('views', __dirname + '/views');

// Tells Express to use EJS as the templating engine
app.set('view engine', 'ejs');

// Tells Express to process html files using EJS's rendering engine
app.engine('html', ejs.renderFile);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy setup
passport.use(new LocalStrategy((username, password, done) => {
    // Check username and password in the database
    let sqlquery = `SELECT * FROM users WHERE user_name = ?`;
    
    db.query(sqlquery, [req.body.user_name], (err, result) => {
        if(err) {
            return console.log.error(err);
        }    

        if(result.length==0) {
            return done(null, false, {message: "Incorrect username."});
        }

        let user = result[0];

        // Compare passwords with database
        if(password == user.password) {
            return done(null, user);

        }
        else {
            return done(null, false, {message: "Incorrect password."});
        }
    });
}));

// Serialise and desearialise user (as per Brown (2020) p.243)
passport.serializeUser((user, done) => {
    done(null, user.user_id);

})

passport.deserializeUser((user_id, done) => {
    let sqlquery = `SELECT * FROM users WHERE user_id = ?`;
    
    db.query(sqlquery, [user_id], (err, result) => {
        if(err) throw err;
        let user = result[0];
        done(null, user);
    });
});

// Requires the main.js file inside the routes folder passing in the Express app
// and data as arguments.  All the routes are found in this file
require('./routes/main')(app, websiteData);


// Starts the web app listening
app.listen(port, () => console.log(`SchoolNet app listening on port ${port}!`))