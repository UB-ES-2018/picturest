// Socket.io API
var io = require('../../app').io;

 // For storing chat
var Chat = require('../models/chat');

 // For decoding token
var jwt = require('jsonwebtoken');

 // On Connect
io.on('connection', function (socket) {

     // If there is a new message, we treat it
    socket.on('new-message', function (data) {

        let decodedToken = jwt.decode(data.token);
        let email = decodedToken.email;
        let message = {
            from: email,
            message: data.message,
            date: new Date()
        };

         // Response to sender, sent successfully
        socket.emit(email,
            {
                success: true
            });

         // Store message until user need it
        Chat.findOne({ email: email }).then(function (chat, err) {

             // If chat exists
            if (chat) {
                chat.messages.push(message);
                chat.save().then(function (dbRes) {
                    console.log("Message saved");
                })
            }

             // If there is not a chat related yet
            else {
                let chat = new Chat ({
                    email: email,
                    messages: []
                });

                chat.save(function (err, saved) {
                    if (err) {
                        console.log("Chat already exists");
                    }
                    if (saved) {
                        console.log("Chat created");
                    }
                })
            }
        }).catch((err) => { console.log(err) });

         // Try to emit message if user is connected or not
        io.emit(data.to, message);

        console.log(data);
    });

     // If there is a pending message, we treat it
    socket.on('pending-message', function (data) {
        let decodedToken = jwt.decode(data.token);
        var email = decodedToken.email;

        Chat.findOne({ email: email }).then(function (chat, err) {

            let messages = [];

             // If chat exists
            if (chat) {
                
                 // Messages
                chat.messages.forEach(function (message) {
                    messages.push(message)
                });
            }

            io.emit(email,
                {
                    messages: messages
                });
        }).catch((err) => { console.log(err) });

        console.log(data);
    });
}); 