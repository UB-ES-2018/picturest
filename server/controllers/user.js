var User = require('../models/user')
var Image = require('../models/image')
var Collection = require('../models/collection')
var CollectionController = require('./collection')
var jwt = require('jsonwebtoken')


// registers new user
exports.signup = function (req, res) {
    // get body
    let email = req.body.email
    let password = req.body.password
    let age = req.body.age
    let username = email.substring(0, email.lastIndexOf("@"))
    
    // new user object
    let user = new User ({
        email: email,
        age: age,
        password: password,
        username: username,
        gender: "",
        country: "",
        language: "",
        interests: [],
        profile_img: ""

    })

    // saving into db
    user.save(function (err, saved) {
        if (err) {
            res.json({
                success: false,
                error: "Someone already has this email address."
            })
        }
        if (saved) {
            // if OK sends true
            res.json({
                success: true,
                id: user._id,
            })
        }
    })
}

// login for the user
exports.login = function (req, res) {
    // find the user
    User.findOne({ email: req.body.email }).then(function (user, err) {
        if (err) {
            res.json({
                success: false,
                error: "Database error"
            })
        }
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' })
        } else if (user) {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (err) res.json({ success: false, message: 'Authentication failed. Wrong password.' })
                if (isMatch) {
                    // if user is found and password is right
                    // create a token with only our given payload
                    const payload = {
                        id: user._id,
                        email: user.email
                    }
                    var token = jwt.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: 60 * 60 * 24
                    })
                    // return the information including token as JSON
                    res.json({
                        success: true,
                        id: user._id,
                        token: token
                    })
                }
            })
        }
    }).catch(function (err) {
        console.log(err)
    })
}
  
// GET for logout
exports.logout = function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err)
            } else {
                return res.json({success: true})
            }
        })
    }
}

exports.addProfileImg = function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    let decodedToken = jwt.decode(token)

    var email = decodedToken.email
    var image_id = req.body.imageId

    Image.findOne({_id : image_id}).then((img) => {
        if (img) {
            User.findOne({ email: email }).then(function (user, err) {
                if (user) {
                    user.profile_img = image_id
                    user.save().then(function (dbRes) {
                        console.log('User updated to db with id:', dbRes._id)
                        res.json({
                            success: true,
                            user_profile_img: dbRes._id
                        })
                    })
                }
                if (err) {
                    res.json({
                        success: false,
                        error: "Cannot find user."
                    })
                }
            })
        }
        else {
            res.json({
                success: false,
                error: "Cannot find image."
            })
        }
    }).catch((err) => { console.log(err) })
}

exports.addProfileDesc = function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
    let description = req.body.desc
    // find the user
    User.findOne({ email: email }).then(function (user, err) {
        if (err) {
            res.json({
                success: false,
                error: "Database error"
            })
        }
        if (!user) {
            res.json({ success: false, message: 'Token decode failed. User not found.' })
        } else if (user) {
            // Update user description
            user.profile_desc = description
            user.save().then(function (dbRes) {
                console.log('User updated to db with id:', dbRes._id)
                res.json({
                    success: true,
                    desc: description
                })
            })
        }
    }).catch(function (err) {
        console.log(err)
    })
}
exports.pinImage = function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    let decodedToken = jwt.decode(token)
    this.res = res;
    var email = decodedToken.email
    var image_id = req.params.imageId
    Image.findOne({_id: image_id}).then((img) => {
        if (img) {
            User.findOne({email: email}).then((user, err) => {
                if (user) {
                    if (!user.pins.includes(image_id)) {
                        let pins = user.pins
                        pins.push(image_id)
                        User.update({email: email}, {$set: {
                                pins: pins
                            }}, function(err, res) {
                            if (err) {
                                console.log(err)
                                this.res.json({
                                    success: false
                                })
                            }
                            if (err) {
                                console.log(res)
                                this.res.json({
                                    success: true
                                })
                            }
                        })
                    }
                    else (
                        res.json({
                            success: true
                        })
                    )
                }
                else {
                    console.log(err)
                    res.json({
                        success: false,
                        error: "Cannot find user."
                    })
                }
            })
        }
        else {
            res.json({
                success: false,
                error: "Cannot find image."
            })
        }
    }).catch((err) => {
        console.log(err)
    })
}
exports.downloadPinned = function (req, res) {
    var token = req.headers['x-access-token']
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
    User.findOne({email: email}).then((user, err) => {
        if (user) {
            res.json({
                success: true,
                pins: user.pins
            })
        }
        if (err) {
            res.json({
                success: false,
                error: "Cannot find user."
            })
        }
    })
}

// PUT /user/addInterest   ->   Add an interest
exports.addInterest = function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    let decodedToken = jwt.decode(token)

    var email = decodedToken.email
    var interests = req.body.interests

    let regexp =/\S+/g
    let result = String(interests).match(regexp)
    interests = []
    if (result) {
        // Avoid to repeat interests
        interests = new Set()
        result.forEach((word) => {
            interests.add(word)
        })
        // Avoid to repeat interests
        interests = Array.from(interests)
    }

    User.findOne({ email: email }).then(function (user, err) {
        if (user) {
            user.interests = interests
            user.save().then(function (dbRes) {
                res.json({
                    success: true,
                    user_interests: dbRes._id
                })
            })
        }
        if (err) {
            res.json({
                success: false,
                error: "Cannot find user."
            })
        }
    }).catch((err) => { console.log(err) })
}

// GET /user/downloadInterest
exports.downloadInterest = function (req, res) {
    var token = req.headers['x-access-token']
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
    User.findOne({email: email}).then((user, err) => {
        if (user) {
            res.json({
                success: true,
                interests: user.interests
            })
        }
        if (err) {
            res.json({
                success: false,
                error: "Cannot find user."
            })
        }
    })
}

// POST /user/addCollection   ->   Add a collection
exports.addCollection = function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    let decodedToken = jwt.decode(token)

    var email = decodedToken.email
    var name = req.body.name
    var images = req.body.images // array of IDs
    var description = req.body.description

    // Array of IDs splitted by spaces
    let regexp =/\S+/g
    let result = String(images).match(regexp)
    let arrayImages = []
    if (result) {
        // Avoid to repeat interests
        arrayImages = new Set()
        result.forEach((id) => {
            arrayImages.add(id)
        })
        // Avoid to repeat interests
        arrayImages = Array.from(arrayImages)
    }

    // new collection object
    let collection = new Collection ({
        email: email,
        name: name,
        images: arrayImages,
        description: description,
        followedBy: []

    })

    // saving into db
    collection.save(function (err, saved) {
        if (err) {
            res.json({
                success: false,
                error: "Error while adding collection of photos"
            })
        }
        if (saved) {
            // if OK sends true
            res.json({
                success: true,
                id: collection._id
            })
        }
    })
}

// GET /user/downloadCollections
exports.downloadCollections = function (req, res) {
    var token = req.headers['x-access-token']
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email

    Collection.find({email: email}).then((collection, err) => {
        var result = []

        if (collection) {
            collection.forEach((collect) => {
                result.push({
                    name: collect.name,
                    images: collect.images,
                    description: collect.description,
                    followedBy: collect.followedBy
                })
            })
            res.json(result)
        }
        if (err) {
            res.json({
                success: false,
                error: "Cannot find collection."
            })
        }
    })
}

// PÚT /user/followCollection/:collId
exports.followCollection = function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    let decodedToken = jwt.decode(token)
    let collection = req.body.collId

    Collection.findOne({_id: collection}).then((coll, err) => {
        if (coll) {
            User.findOne({email: decodedToken.email}).then((usr, err) => {
                if (usr) {
                    if (!usr.collections.includes(collection)) {
                        usr.collections.push(collection)
                        res.json({
                            success: true,
                            collection: coll._id,
                            user: usr._id
                        })
                    }
                    else {
                        res.status(200).send({
                            success: true,
                            msg: "Already added"
                        })
                    } 
                }
                if (err) {
                    res.status(500).send({
                        success: false,
                        msg: "Cannot find user"
                    })
                }
            })
        }
        if (err) {
            res.status(500).send({
                success: false,
                msg: "Cannot find collection"
            })
        }
    })
}

// get profile image id GET /user/profileImg
exports.getProfileImage = function(req, res) {
    let token = req.body.token || req.headers['x-access-token'] || req.query.token
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
    
    User.findOne({email: email}).then((user, err) => {
        if (user) {
            res.json({
                success: true,
                profile_img: user.profile_img
            })
        }
        if (err) {
            res.json({
                success: false,
                error: "User not found"
            })
        }
    }).catch((err) => {
        res.json({
            success: false,
            error: "Unexpected error on server, user cannot be find"
        })
    })
}

// get profile image id GET /user/profileDesc
exports.getProfileDesc = function(req, res) {
    let token = req.body.token || req.headers['x-access-token'] || req.query.token
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
    
    User.findOne({email: email}).then((user, err) => {
        if (user) {
            res.json({
                success: true,
                profile_desc: user.profile_desc
            })
        }
        if (err) {
            res.json({
                success: false,
                error: "User not found"
            })
        }
    }).catch((err) => {
        res.json({
            success: false,
            error: "Unexpected error on server, user cannot be find"
        })
    })
}

exports.getImages = function(req, res) {
    let token = req.body.token || req.headers['x-access-token'] || req.query.token
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
    
    User.findOne({email: email}).then((user, err) => {
        if (user) {
            let final = []
            // Owned images
            Image.find({user: email}).then((images, err) => {
                if (images) {
                    images.forEach(function(img) {
                        if (!final.includes(img._id.toString())) {
                            final.push(img._id.toString())
                        }
                    })
                    console.log("Owned: " + final)
                    // Pinned images 
                    user.pins.forEach((img) => {
                        if (!final.includes(img.toString())) {
                            final.push(img.toString())
                        }
                    })
                    console.log("Owned + Pinned: " + final)
                    // images for interest
                    let interest = user.interests;
                    Image.find({}).then((images, err) => {
                        if (images) {
                            interest.forEach((tag) => {
                                images.forEach(function(imge) {
                                    if (!final.includes(imge._id.toString()) && imge.tag.toString().includes(tag).toString()) {
                                        final.push(imge._id.toString())
                                    }
                                })
                            })
                            console.log("Owned + Pinned + Interests: " + final)
                            res.json({
                                success: true,
                                msg: final
                            })
                        }
                        if (err) {}
                    })
                }
                if (err) {
                    res.json({
                        success: false,
                        msg: "Failed in owned images"
                    })
                }
            }).catch((err) => {
                console.log(err)
            })
        }
        if (err) {
            res.json({
                success: false,
                error: "User not found"
            })
        }
    })
}

// GET /user/all
exports.getAll = function (req, res) {
    User.find({}).then((user, err) => {
        if (user) {
            let id = []
            user.forEach((usr) => {
                id.push({id: usr._id, email: usr.email})
            })
            res.json({
                success: true,
                users: id
            })
        }
        if (err) {
            res.json({
                success: false,
                error: "Cannot find."
            })
        }
    })
}

exports.follow = function(req, res) {
    let token = req.body.token || req.headers['x-access-token'] || req.query.token
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
    let to_follow = req.params.username

    console.log(email)
    console.log(to_follow)

    User.findOne({username: to_follow}).then((user, err) => {
        if (user) {
            User.findOne({email: email}).then((user2, err) => {
                if (user2) {
                    if (!user2.follow.includes(to_follow)) {
                        user2.follow.push(to_follow)
                        user2.save().then(() => {
                            res.json({
                                success: true,
                                follow: user2.follow
                            })
                        })
                        
                    } else {
                        res.json({
                            success: false,
                            msg: to_follow + " already followed."
                        })
                    }
                }
                else {
                    res.json({
                        success: false,
                        error: "User not found or updated"
                    })      
                }
            })
        }
        else {
            res.json({
                success: false,
                error: "User to follow not found"
            })
        }
    })
}

exports.unfollow = function(req, res) {
    let token = req.body.token || req.headers['x-access-token'] || req.query.token
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
    let to_follow = req.params.username

    User.findOne({username: to_follow}).then((user, err) => {
        if (user) {
            User.findOne({email: email}).then((user2, err) => {
                if (user2) {
                    if (user2.follow.includes(to_follow)) {
                        user2.follow.forEach((elem, i) => {
                            if (elem === to_follow) {
                                user2.follow.splice(i,1)
                                user2.save().then(() => {
                                    res.json({
                                        success: true,
                                        follow: user2.follow
                                    })
                                })
                            }
                        })
                    } else {
                        res.json({
                            success: false,
                            msg: to_follow + " not followed."
                        })
                    }
                }
                if (err) {
                    res.json({
                        success: false,
                        error: "User not found or updated"
                    })      
                }
            })
        }
        else {
            res.json({
                success: false,
                error: "User to follow not found"
            })
        }
    })
}

exports.getMyFollows = function(req, res) {
    let token = req.body.token || req.headers['x-access-token'] || req.query.token
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
    
    User.findOne({email: email}).then((user, err) => {
        if (user) {
            let tmp = user.follow
            let tmp_mails = []
            tmp.forEach((usr, i) => {
                User.findOne({username: usr}).then((u,e) => {
                    if (u) {
                        tmp_mails.push(u.email)
                        if (i == tmp.length-1) {
                            res.json({
                                success: true,
                                mails: tmp_mails
                            })
                        }
                    }
                })
            })
        }
        if (err) {
            res.json({
                success: false,
                error: "User not found"
            })
        }
    }).catch((err) => {
        res.json({
            success: false,
            error: "Unexpected error on server, user cannot be find"
        })
    })
}

/*
 * Example: http://localhost:3000/user/profImg/jordi@jordi.io
 */
exports.getUserProfImg = function(req, res) {
    let email = req.params.email

    User.findOne({email: email}).then((user, err) => {
        if (user) {
            res.json({
                success: true,
                profile_img: user.profile_img
            })
        }
        if (err) {
            res.json({
                success: false,
                error: "User not found"
            })
        }
    }).catch((err) => {
        res.json({
            success: false,
            error: "Unexpected error on server, user cannot be find"
        })
    })
}

exports.timelineInfo = function(req, res) {
    let token = req.body.token || req.headers['x-access-token'] || req.query.token
    let decodedToken = jwt.decode(token)
    let email = decodedToken.email
     /**
     * @description determine if an array contains one or more items from another array.
     * @param {array} haystack the array to search.
     * @param {array} arr the array providing items to check for in the haystack.
     * @return {boolean} true|false if haystack contains at least one item from arr.
     */
    var match = function (haystack, arr) {
        return arr.some(function (v) {
            return haystack.indexOf(v) >= 0;
        });
    };
     User.findOne({email: email}).then((user,err) => {
        if (user) {
            
            let images_follow = []
            let follow_emails = []
            let _interests = user.interests;
            let _collections = []
             // Get images of collections that I follow
            user.collections.forEach((coll, err) => {
                if (coll) {
                    let images = CollectionController.getCollectionImages(coll);
                    images.forEach((imgID) => {
                        if (!_collections.includes(imgID)) {
                            _collections.push(imgID)
                        }
                    })
                }
            })
            
            images_follow.concat(_collections);
            
             // get following emails
            user.follow.forEach((uname) => {
                User.findOne({username: uname}).then((eml, er) => {
                    if (eml) {
                        follow_emails.push(eml.email)
                    }
                })
            })
             setTimeout(function() { 
                // Get images
                Image.find({}).then((images, errorImages) => {
                    if (images) {
                        images.forEach((imag) => {
                            // Filter images by following
                            if (follow_emails.includes(imag.user) & !images_follow.includes(imag._id)) {
                                images_follow.push(imag._id)
                            }
                            // Filter images by user interest
                            if (match(imag.tag, _interests) & !images_follow.includes(imag._id)) {
                                images_follow.push(imag._id)
                            }
                            
                        })
                        res.json({
                            success: true,
                            imgs: images_follow
                        })
                    }
                    if (errorImages) {
                        res.json({
                            success: false,
                            msg: "Error in Image.Find()"
                        })
                    }
                    else {
                        res.json({
                            success: true,
                            imgs: images_follow
                        })
                    }
                })
            }, 2000); 
        }
        if (err) {
            res.json({
                success: false,
                msg: "Error finding user"
            })
        }
    }).catch(() => {
        res.json({
            success: false,
            msg: "Unexpected error"
        })
    })
}

exports.middleware = function (app) {
    // route middleware to verify a token
    app.use(function (req, res, next) {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token']
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                if (err) {
                    return res.json({ error: true, message: 'Failed to authenticate token.' })
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded
                    next()
                }
            })
        } else {
            // if there is no token return an error
            return res.status(403).send({
                error: true,
                message: 'No token provided.'
            })
        }
    })
}
  
