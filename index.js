/*
App structure
|-controller
|--database.js
|-node_modules
|-public
|--css
|---master.css
|-views
|--layouts
|---main.hbs
|--index.hbs
|-index.js
|-package.json
*/
require('dotenv').config()
var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var sessions = require('express-session')
var hbs = require('express-handlebars')
var db = require('./database/firebase-data')
var async = require('async')
var morgan = require('morgan')
var _ = require('lodash')

var app = express()
var router = express.Router()

// Template engine setup, default: hbs
app.engine('hbs', hbs({extname: '.hbs', defaultLayout: 'main', layoutDir: path.join(__dirname, '/views/layouts')}))
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', '.hbs')

// Logging
app.use(morgan('dev'))

// Access Control configuration
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
});

// bodyParser configuration,
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: false }))

// cookieParser configuration,
app.use(cookieParser('secret'))

// Session configuration
app.use(sessions({
    secret: 'rahasya',
    resave: false,
    saveUninitialized: true
}));

// Save all session
var session

// Static folder setup
app.use(express.static(path.join(__dirname, '/views')))
app.use('/css', express.static(path.join(__dirname, '/public/css/')))
app.use('/fonts', express.static(path.join(__dirname, '/public/fonts/')))
app.use('/images', express.static(path.join(__dirname, '/public/images/')))
app.use('/js', express.static(path.join(__dirname, '/public/js/')))

// All routes goes here
app.get('/', function(req, res){

    var data = {}
    var message = {}

    async.parallel([
        function(done){
            db.getProducts(function(rows){
                var size = Object.keys(rows).length
                if(size > 0){
                    data.products = rows
                    message.products = "There are " + size + " product(s) available."
                    done()
                } else {
                    message.products = "No product available."
                    done()
                }
            })
        }
    ], function(err,results){
        res.json({
            msg: message.products,
            data: data.products
        })
    })
})

app.get('/auth/basic/:email/:pass', function(req, res) {

    session = req.session

    var email = req.params.email
    var pass = req.params.pass

    var data = {}
    var message = {}

    async.parallel([
        function(done){
            db.signIn(email,pass,function(authData){
                session.userData = authData
                res.json(authData)
            })
        }
    ], function(err,results){
        res.json({msg: message.auth, err: err})
    })
});

app.get('/logout', function(req, res){
    db.logout(function(err){
        req.session.destroy(function(err){
            if(err){
                res.json(err)
            } else {
                res.json("logged out")
            }
        })
    })
})

app.get('/products/create', function(req, res){
    session = req.session
    console.log(session)
    if(!session.userData){
        res.json('not allowed')
    } else {
        res.render('products/create')
    }
})

app.post('/products/create', function(req, res){
    // Do Something...
})

// listen to a certain port
var port = process.env.PORT || 3000
app.listen(port, function(req, res){
    console.log('Listening at port 3000')
})