var express = require('express');
var router = express.Router();
var Campground = require('../model/campgroundSchema');
var middlewareObj = require('../middleware/index');
var geocoder = require('geocoder');
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
//Upload image configuration
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({
    storage: storage,
    fileFilter: imageFilter
});
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const escapeRegexp = require('escape-string-regexp');
// ========================
// Campground Routes
// ========================
router.get('/', function (req, res) {
    if (req.query.search) {
        const escaptedString = escapeRegexp(req.query.search);
        const regex = new RegExp(escaptedString, 'gi');
        Campground.find({name: regex}, function (err, campgrounds) {
            if (err) {
                console.log(err);
            } else {
                console.log(campgrounds);
                if (campgrounds.length < 1) {
                    // req.flash('error', "Can't find campground: " + regex + ", please try search other campgrounds or add a new one");
                    res.redirect('campgrounds/index');
                } else {
                    res.render("campgrounds/index", {campgrounds: campgrounds});
                }
            }
        });
    } else {
        Campground.find({}, function (err, campgrounds) {
            if (err) {
                console.log(err);
            } else {
                console.log(campgrounds);
                res.render("campgrounds/index", {campgrounds: campgrounds});
            }
        });
    }
});
router.post("/", middlewareObj.loginCheck, upload.single('local_image'), function (req, res) {
    var name = req.body.name;
    var description = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var image;
    var image_public_id;
    cloudinary.uploader.upload(req.file.path, function (result) {
        image = result.secure_url;
        image_public_id = result.public_id;
        console.log(result.public_id);
    }).then(function () {
        console.log(image);
        geocoder.geocode(req.body.location, function (err, data) {
            console.log("data:" + data);
            if (data && data.results[0]) {

                var lat = data.results[0].geometry.location.lat;
                var lng = data.results[0].geometry.location.lng;
                var location = data.results[0].formatted_address;
                var newCamp = {
                    name: name,
                    image: image,
                    image_public_id: image_public_id,
                    description: description,
                    author: author,
                    price: price,
                    location: location,
                    lat: lat,
                    lng: lng
                };
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
            } else {
                req.flash("error", "invalid location");
                res.redirect('back');
            }
        });
    });
});

/*Get add new camp page*/
router.get("/new", middlewareObj.loginCheck, function (req, res) {
    res.render("campgrounds/new");
});

// show a campground
router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate('comments').exec(function (err, foundCampground) {
        if (err) {
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
    var image;
    var image_public_id;
    if(req.file){
        cloudinary.uploader.upload(req.file.path, function (result) {
            image = result.secure_url;
            image_public_id = result.public_id;
            console.log(result.public_id);
        }).then(function () {
            geocoder.geocode(req.body.campground.location, function (err, data) {
                console.log(data);
                if (data && data.results) {
                    var lat = data.results[0].geometry.location.lat;
                    var lng = data.results[0].geometry.location.lng;
                    var location = data.results[0].formatted_address;
                    var newData = {
                        name: req.body.campground.name,
                        image: image,
                        image_public_id: image_public_id,
                        description: req.body.campground.description,
                        price: req.body.campground.price,
                        location: location,
                        lat: lat,
                        lng: lng
                    };
                    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function (err, campground) {
                        if (err) {
                            req.flash("error", err.message);
                            res.redirect("back");
                        } else {
                            req.flash("success", "Successfully Updated!");
                            res.redirect("/campgrounds/" + campground._id);
                        }
                    });
                } else {
                    req.flash("error", "Invalid location");
                    res.redirect('back');
                }
            });
        });
    }else{
        geocoder.geocode(req.body.campground.location, function (err, data) {
            console.log(data);
            if (data && data.results) {
                var lat = data.results[0].geometry.location.lat;
                var lng = data.results[0].geometry.location.lng;
                var location = data.results[0].formatted_address;
                var newData = {
                    name: req.body.campground.name,
                    description: req.body.campground.description,
                    price: req.body.campground.price,
                    location: location,
                    lat: lat,
                    lng: lng
                };
                Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function (err, campground) {
                    if (err) {
                        req.flash("error", err.message);
                        res.redirect("back");
                    } else {
                        req.flash("success", "Successfully Updated!");
                        res.redirect("/campgrounds/" + campground._id);
                    }
                });
            } else {
                req.flash("error", "Invalid location");
                res.redirect('back');
            }
        });
    }
});

//Destroy campground route
router.delete('/:id', middlewareObj.checkCampgroundPermission, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err, foundCampground) {
        cloudinary.uploader.destroy(foundCampground.image_public_id, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
        res.redirect('/campgrounds');
    });
});

module.exports = router;