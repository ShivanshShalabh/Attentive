const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);
let allRoomUsers = {};
app.get('/', (req, res) => {
    let room = uuidv4();
    res.redirect(`/${room}`);
    allRoomUsers[room] = [];
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId, name) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        socket.on('message', (message, nickname) => {
            socket.to(roomId).emit('createMessage', message, nickname);
        });
    }); socket.on('user-joined', (roomId, name, userId) => {
        allRoomUsers[roomId].push([name, userId]);

        socket.emit('addParticipant', allRoomUsers[roomId]);
        socket.to(roomId).emit('addParticipant', allRoomUsers[roomId]);
    });
    socket.on('leave-meeting', (roomId, userId) => {
        for (let ii = 0; ii < allRoomUsers[roomId].length; ii++) {
            if (allRoomUsers[roomId][ii][1] === userId) {
                allRoomUsers[roomId].splice(ii, 1);
                break;
            }
        }

        socket.emit('removeParticipant', allRoomUsers[roomId], userId);
        socket.to(roomId).emit('removeParticipant', allRoomUsers[roomId], userId);
        // res.redirect('/');
    });
});

server.listen(process.env.PORT || 3000);
console.log('Server is running on port 3000');
