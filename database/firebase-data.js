var firebase = require('firebase')
require('firebase/auth')
require('firebase/database')

// firebase setup
var config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    storageBucket: process.env.STORAGE_URL
}
firebase.initializeApp(config)

module.exports.getProducts = function(callback){
    firebase.database().ref('/products').once('value', function(snapshot){
        callback(snapshot.val())
    })
}

module.exports.listenAll = function(array, callback){
    firebase.database().ref('/'+array+'').once('child_changed', function(snapshot){
        callback(snapshot.val())
    })
}

module.exports.signIn = function(email,pass,callback){
    firebase.auth().signInWithEmailAndPassword(email,pass).then(function(authData){
        callback(authData)
    }).catch(function(err){
        callback(err)
    })
}

module.exports.logout = function(callback){
    firebase.auth().signOut().then(function(){
        callback()
    }).catch(function(err){
        callback(err)
    })
}

module.exports.getCurrentUser = function(callback){
    firebase.auth().onAuthStateChanged(function(user){
        callback(user)
    })
}