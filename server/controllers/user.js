var User = require('../models/user')
var Image = require('../models/image')
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

    
    if (exists) { 
        res.status(409).send({error: "Someone already has this email address"}) 
    }
    if (!exists) {
        user.save(function (err, saved) {
            if (err) {
                res.status(500).send({error: "Database error"})
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
}

// login for the user
exports.signin = function (req, res) {
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

    var email = decodedToken.email;
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
