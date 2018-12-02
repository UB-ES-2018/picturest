
module.exports = function (app) {
    var user = require('../controllers/user')
    var chat = require('../controllers/chat')

    app.post('/login', user.login)
    app.post('/signup', user.signup)
    app.get('/logout', user.logout)

    // From now on all calls must be authenticated.
    user.middleware(app)

    app.put('/addImg', user.addProfileImg)
    app.put('/addDesc', user.addProfileDesc)
    app.put('/user/pin/:imageId', user.pinImage)
    app.get('/user/downloadPinned', user.downloadPinned)
    app.put('/user/addInterest', user.addInterest)
    app.get('/user/downloadInterest', user.downloadInterest)
    app.post('/user/addCollection', user.addCollection)
    app.get('/user/downloadCollections', user.downloadCollections)
    app.put('/user/followCollection/', user.followCollection)
    app.get('/user/profileImg', user.getProfileImage)
    app.get('/user/profileDesc', user.getProfileDesc)

    //app.put('/user/:id', user.update)
    //app.delete('/user/:id', user.delete)
}