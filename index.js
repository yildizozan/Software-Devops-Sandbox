var express = require('express');
var socket = require('socket.io');
var request = require('request');

//*******//
// Users //
//*******//
let users = new Map();
users.set('admin', {user: 'admin', pass: 'admin', role: 'M'});

//*************************//
//Ports and their listeners//
//*************************//
var front = express();
var frontListener = front.listen(4001, function () {
    console.log("localhost:4001 to access the front end")
});
front.use(express.static('front'));

var back = express();
var backListener = back.listen(4000, function () {
    console.log("other groups send to localhost:4000")
});
back.use(express.json());


//*****************//
//Frontend's socket//
//*****************//
var io = socket(frontListener);

io.on('connection', function (socket) {
    socket.on('undeploy', function (data) {
        undeployPost(data)
    });

    socket.on('auth', function (data, res) {
        console.log(data);
        res(auth(data));
    });

    socket.on('checkUser', function (data, res) {
        res(users.get(data.user));
    });

    socket.on('addNewUser', function (data) {
        addUser(data);
    });
});

back.post('/', function (req, res) {
    io.emit('postIncoming', req.body);
    res.send(req.body);
});


//****************//
//Helper Functions//
//****************//
function undeployPost(jsonData) {
    request.post(
        'http://localhost:8081',
        {json: jsonData},
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                // no problems
            } else {
                console.log("Error!!!!");
            }
        }
    );
}


function auth(data) {
    const result = users.get(data.user);

    if (!result) {
        return {success: false, role: 'N'};
    }

    return {success: true, role: result.role};
}

function addUser(data) {
    console.log("addUser", data);
    users.set(data.user, data);
}
