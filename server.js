/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
moviedb = require('./moviedb')();
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    if (req.query != null) {
        json.query = req.query;
    }

    return json;
}

router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
});

router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/movies')
    .get((req, res) => { //get movies
        res = res.status(200);
        var o = getJSONObjectForMovieRequirement(req);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        console.log(req.body);
        if (req.body.title) {
            let movie = moviedb.findOne(req.body.title);
            if (movie === undefined) {
                o.body = {success: false, msg: 'Entry not found'};
            } else {
                o.body = {success: true, msg: 'Found movie.', movies: [movie]};
            }
        } else {
            let movie = moviedb.findOne(); //if no title given, returns whole list of movies
            o.body = {success: true, msg: 'Displaying movies.', movies: movie};
        }
        res.json(o);
    })
    .post((req, res) => { //save movie
        res = res.status(200);
        var o = getJSONObjectForMovieRequirement(req);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        if (!req.body.title || !req.body.director || !req.body.runtime) {
            o.body = {success: false, msg: 'Please include title, director, and runtime to save entry.'};
        } else {
            var newMovie = {
                title: req.body.title,
                director: req.body.director,
                runtime: req.body.runtime
            };
            let savedMovie = moviedb.save(newMovie); //no duplicate checking
            o.body = {success: true, msg: 'Successfully entered new movie.', movie: savedMovie};
        }
        res.json(o);
    })
    .delete(authController.isAuthenticated, (req, res) => { //delete movie
        console.log(req.body);
        res = res.status(200);
        var o = getJSONObjectForMovieRequirement(req);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        if (req.body.title) {
            let movie = moviedb.findOne(req.body.title);
            if (movie !== undefined) {
                moviedb.remove(movie.id);
                o.body = {success: true, msg: 'Movie deleted.'};
            } else {
                o.body = {success: false, msg: 'Movie not found.'};
            }
        }
        res.json(o);
    })
    .put(authJwtController.isAuthenticated, (req, res) => { //update movie
        console.log(req.body);
        res = res.status(200);
        var o = getJSONObjectForMovieRequirement(req);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        if (req.body.id) {
            let movieValid = moviedb.update(req.body.id, req.body);
            if (movieValid) {
                o.body = {success: true, msg: 'Updated movie.'};
            } else {
                o.body = {success: false, msg: 'Invalid ID. Movie not updated.'};
            }
        } else {
            o.body = {success: false, msg: 'No ID given. Movie not updated.'};
        }
        res.json(o);
    })
    .all((req, res) => {
        // Any other HTTP Method
        // Returns a message stating that the HTTP method is unsupported.
        res.status(405).send({ message: 'HTTP method not supported.' });
    });
    
app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


