var User = require('../models/user')
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
        username: username
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
  
