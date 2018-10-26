var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

const SALT_WORK_FACTOR = 10

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 13,
        max: 99
    },
    gender: {
        type: String,
        required: false,
        trim: true
    },
    country: {
        type: String,
        required: false,
        trim: true
    },
    language: {
        type: String,
        required: false,
        trim: true
    },
    interests: {
        type: [Number],
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    profile_img: {
        type: String,
        trim: true
    },
    profile_desc: {
        type: String,
        required: false,
        trim: true
    }
})


// Hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this
    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next()
    // Generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err)
        // Hash the password along with our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err)
            // Override the cleartext password with the hashed one
            user.password = hash
            next()
        })
    })
})
  
// Compare candidate password and password
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

module.exports = mongoose.model('User', UserSchema)