var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var methodOverride = require('method-override');
var express_session = require('express-session');
var User = require('./model/userSchema');
var index = require('./routes/index');
var campgrounds = require('./routes/campgrouds');
var comments = require('./routes/comments');
var app = express();
var seedDB = require('./seed');
var mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASEURL, {useMongoClient: true});

//seedDB();//seed the database
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(flash());
//PASSPORT CONFIGURATIONS
app.use(express_session({
    secret:'jiaying',
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Configure Routes
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})
app.use('/', index);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/comments', comments);
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT, process.env.IP, function () {
    console.log("YelpCamp server has started!");
});

module.exports = app;
