const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
const randomString = (length) => Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
let allRoomUsers = {}; //To store peerID and Name of users in a room
let roomInfo = {}; //To store Id and Password of rooms

// HomePage
app.get("/", (req, res) => {
    res.render("index", { appName: "Attentive" });
});

// New Room Form
app.get("/new_room", (req, res) => {
    let room = uuidv4();
    let roomId = randomString(6);
    roomInfo[roomId] = { meetingLink: room, password: undefined, frequency: undefined, minTime: undefined };
    allRoomUsers[room] = [];
    res.render("new_meeting", {
        meetingLink: `/${room}`,

        meetingId: roomId
    });
});
// New Room form handlinig and creating room
app.post("/create_room", urlencodedParser, (req, res) => {
    let meetingPassword = req.body.meetingPassword;
    let userName = req.body.userName;
    let meetingId = req.body.meetingId;
    let frequency = req.body.frequency;
    let minTime = req.body.minTime;
    if (roomInfo[meetingId] === undefined || frequency > 30)
        res.redirect(`/`);
    else {
        roomInfo[meetingId].password = meetingPassword;
        roomInfo[meetingId].frequency = frequency;
        roomInfo[meetingId].minTime = minTime;
        res.render("room", {
            user: {
                roomId: roomInfo[meetingId].meetingLink,
                userName: userName,
                roomPassword: roomInfo[meetingId].password,
                roomName: meetingId,
                frequency: frequency,
                minTime: minTime
            }
        });
    }
});
// Join a meeting Form
app.get("/join_meeting", (req, res) => {
    res.render("join_meeting", {
        user: {
            meetingPassword: "",
            userName: "",
            meetingId: "",
            wrongCredentials: false
        }
    });
});
// Join a meeting form handling and joing  the room
app.post("/join_room", urlencodedParser, (req, res) => {
    let meetingPassword = req.body.meetingPassword;
    let userName = req.body.userName;
    let meetingId = req.body.meetingId;

    // Check if the room exists and then verify the passowrd
    if (roomInfo[meetingId] != undefined && roomInfo[meetingId].password == meetingPassword)
        res.render("room", {
            user: {
                roomId: roomInfo[meetingId].meetingLink,
                userName: userName,
                roomPassword: roomInfo[meetingId].password,
                roomName: meetingId,
                frequency: roomInfo[meetingId].frequency,
                minTime: roomInfo[meetingId].minTime
            }
        });
    // Return joining page if credentials are wrong
    else
        res.render("join_meeting",
            {
                user: {
                    meetingPassword: req.body.meetingPassword,
                    userName: req.body.userName,
                    meetingId: req.body.meetingId,
                    wrongCredentials: true
                }
            });
});

io.on("connection", (socket) => {
    // Adding user to the room
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);
    });
    socket.on("user-joined", (roomId, name, userId) => {
        allRoomUsers[roomId].push([name, userId]);
        socket.emit("addParticipant", allRoomUsers[roomId]);
        socket.to(roomId).emit("addParticipant", allRoomUsers[roomId]);
    });
    // Processing the message
    socket.on("message", (roomId, message, nickname) => {
        socket.to(roomId).emit("createMessage", message, nickname);
    });
    // Toogling the mic status of the user
    socket.on("audio-change", (roomId, userId, unmuteState) => {
        socket.emit("changeMuteStatus", userId, unmuteState);
        socket.to(roomId).emit("changeMuteStatus", userId, unmuteState);
    });
    // Toogling the camera status of the user
    socket.on("video-change", (roomId, userId, unmuteState) => {
        socket.emit("changeVideoStatus", userId, unmuteState);
        socket.to(roomId).emit("changeVideoStatus", userId, unmuteState);
    });
    // Marking the participant as present
    socket.on("markPresent", (roomId, userId) => {
        socket.emit("markPresent", userId);
        socket.to(roomId).emit("markPresent", userId);
    });
    // Toogling the bot status of the user
    socket.on("botStatusChange", (roomId, userId) => {
        socket.emit("BotStatusChange", userId);
        socket.to(roomId).emit("BotStatusChange", userId);
    });

    // Leaving the meeting
    socket.on("leave-meeting", (roomId, userId) => {
        for (let ii = 0; ii < allRoomUsers[roomId].length; ii++) {
            if (allRoomUsers[roomId][ii][1] === userId) {
                allRoomUsers[roomId].splice(ii, 1);
                break;
            }
        }

        if (allRoomUsers[roomId].length === 0) {
            delete allRoomUsers[roomId];
            for (let i in roomInfo) {
                if (roomInfo[i].meetingLink === roomId) {
                    delete roomInfo[i];
                }
            }
        } else {
            socket.emit("removeParticipant", allRoomUsers[roomId], userId);
            socket.to(roomId).emit("removeParticipant", allRoomUsers[roomId], userId);
        }
    });
});

server.listen(process.env.PORT || 3000);
console.log('Server is running on port 3000');
