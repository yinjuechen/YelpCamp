var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/userSchema');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('landing');
});

//==========
//AUTH ROUTES
//Show register form
router.get('/register', function (req, res) {
    res.render('register/register');
});
router.post('/register', function (req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect('back');
        }
        passport.authenticate('local')(req, res, function () {
            req.flash("success", "Welcome, " + user.username);
            res.redirect('/campgrounds');
        });
    });
});
//Login Routes
router.get('/login', function (req, res) {
    res.render('login');
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    successFlash:'Welcome back!' ,
    failureFlash: true
}), function (req, res) {
    req.flash('success', 'Welcome back, ' + req.user.username);
});

//Logout Route
router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "You have been logged out.");
    res.redirect('/campgrounds');
});

module.exports = router;