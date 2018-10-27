
module.exports = function (app) {
    var user = require('../controllers/user')

    app.post('/login', user.login)
    app.post('/signup', user.signup)
    app.get('/logout', user.logout)

    // From now on all calls must be authenticated.
    user.middleware(app)

    app.put('/addImg/:username', user.addProfileImg)
    app.put('/addDesc', user.addProfileDesc)
    //app.put('/user/:id', user.update)
    //app.delete('/user/:id', user.delete)
}