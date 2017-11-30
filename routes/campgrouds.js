var express = require('express');
var router = express.Router();
var Campground = require('../model/campgroundSchema');
var middlewareObj = require('../middleware/index');
var geocoder = require('geocoder');
// ========================
// Campground Routes
// ========================
router.get('/', function (req, res) {
    Campground.find({}, function (err, campgrounds) {
        if (err) {
            console.log(err);
        } else {
            console.log(campgrounds);
            res.render("campgrounds/index", {campgrounds: campgrounds});
        }
    });
});
router.post("/", middlewareObj.loginCheck, function (req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newCamp = {name: name, image: image, description: description, author: author, price: price, location: location, lat: lat, lng: lng};
        console.log(newCamp);
        Campground.create(newCamp, function (err, campground) {
            if (err)
                console.log(err);
            else {
                console.log("add a new camp");
                console.log(campground);
                res.redirect("/campgrounds");
            }
        })
    });
});

/*Get add new camp page*/
router.get("/new", middlewareObj.loginCheck, function (req, res) {
    res.render("campgrounds/new");
});

// show a campground
router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate('comments').exec(function (err, foundCampground) {
        if (err){
            console.log(err);
            req.flash("error", "item not found.");
            res.redirect('back');
        }
        else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//Edit campground route
router.get('/:id/edit', middlewareObj.checkCampgroundPermission, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        res.render('campgrounds/edit', {campground: foundCampground});
    });
});

//Update campground route
router.put('/:id', middlewareObj.checkCampgroundPermission, function (req, res) {
    //find an update the correct campground
    //redirect somewhere
    geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newData = {name: req.body.name, image: req.body.image, description: req.body.description, price: req.body.price, location: location, lat: lat, lng: lng};
        Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
    });
});

//Destroy campground route
router.delete('/:id', middlewareObj.checkCampgroundPermission, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        res.redirect('/campgrounds');
    });
});

module.exports = router;