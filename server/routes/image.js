
module.exports = function (app) {
    //var user = require('../controllers/user')
    var image = require('../controllers/image')

    // Calls must be authenticated.
    //user.middleware(app)

    app.post('/uploadimage', image.uploadImage, image.upload)
    app.get('/downloadimages', image.download)
}