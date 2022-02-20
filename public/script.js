let totalPresent = 0;
let botStatusChange;
let totalAttendance = 0;
let send_image_data;
let messageInbox = document.getElementById('message-inbox');
let markPresent;
let botClickFunc;
let PEER_ID = ' ';

const socket = io('/');
const videoGrid = document.getElementById('other-participants-video-container');
const myVideo = document.createElement('video');
myVideo.muted = true;

let peer = new Peer();
// let peer = new Peer(undefined, {
//     path: '/peerjs',
//     host: '/',
//     port: '3030',
// });

// Ask user for camera and microphone permissions
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream, true); // Add your video stream to video element

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream, false); // Add the video stream to video element
        }
        );
    });

    // Listen for other users to connect
    socket.on('user-connected', (userID) => {
        connectToNewUser(userID, stream);
    });
    // Mute and turn off video of user
    myVideoStream.getAudioTracks()[0].enabled = false;
    myVideoStream.getVideoTracks()[0].enabled = false;
});
// Initialize the peer object and add event listeners
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
    document.getElementById('fa-microphone').addEventListener('click', () => muteUnmute(id));
    document.getElementById('fa-video').addEventListener('click', () => videoOnOff(id));
    document.getElementById('leave-btn').addEventListener('click', () => disconnect(id));
    document.addEventListener('keydown', (event) => { if (event.altKey && event.key === 'v') videoOnOff(id); });
    document.addEventListener('keydown', (event) => { if (event.altKey && event.key === 'a') muteUnmute(id); });
    markPresent = () => {
        socket.emit('markPresent', ROOM_ID, id);
    };
    botStatusChange = () => {
        if (!userImage.includes(undefined))
            socket.emit('botStatusChange', ROOM_ID, id);
    };
    socket.emit('user-joined', ROOM_ID, NICKNAME, id);
});
// New user connected
const connectToNewUser = (userID, stream) => {
    const call = peer.call(userID, stream);
    const video = document.createElement('video');
    video.setAttribute('id', userID);

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, false);
    });
};
// Function to add a video stream to a video element
const addVideoStream = (video, stream, isMyVideo) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    if (!isMyVideo)
        videoGrid.append(video);
    else {
        document.getElementById('my-video-container').append(video);
    }
};
// Function to send message
const sendMessage = () => {
    if (messageBox.value != "") {
        socket.emit('message', ROOM_ID, messageBox.value, NICKNAME);
        createMessageLi(messageBox.value, "You", false);
        messageBox.value = '';
    }
};
// Function to trigger message to be sent
let messageBox = document.getElementById('message-box');
document.getElementsByTagName('html')[0].addEventListener("keyup", (e) => {
    if (e.key == "Enter") sendMessage();
});
document.getElementById('message-submit-btn').addEventListener("click", sendMessage);
// Listen to incoming messages
socket.on('createMessage', (message, senderNickname) => {
    createMessageLi(message, senderNickname, true);
});
// Add message to messageInbox
const createMessageLi = (message, userName, incoming) => {
    let liToAppend = document.createElement('li');
    liToAppend.classList.add(incoming ? 'recieved' : 'sent');
    liToAppend.innerHTML = `<strong>${userName}</strong><span>${message}</span>`;
    messageInbox.appendChild(liToAppend);
    scroollToBottom();
};

// Scroll to bottom of messageInbox
const scroollToBottom = () => {
    let messageInboxScroll = $('.messages_container');
    messageInboxScroll.scrollTop(messageInboxScroll.prop('scrollHeight'));
};

// Clear participant list
const resetParticipants = () => document.getElementById('participant-list').innerHTML = '';

// Listen to new participant list event
socket.on('addParticipant', name => {
    resetParticipants();

    name.forEach(element => {
        appendNameParticipant(element);
    });
});

// Listen to user-left event
socket.on('removeParticipant', (name, userId) => {
    resetParticipants();
    name.forEach(element => {
        appendNameParticipant(element);
    });
    removeVideo(userId);
});

// Listen to user-mark-present event
socket.on('markPresent', (userId) => {
    document.getElementById(`p${userId}`).children[2].children[0].classList.add('present');
});

// Listen to bot-status-change event
socket.on('BotStatusChange', (userId) => {
    document.getElementById(`p${userId}`).children[1].children[0].classList.toggle('attentive');
});

// Evaluate the processeed image response 
let markAttendance = status => {
    if (status) totalPresent++;
    totalAttendance++;
    if (totalPresent >= minTime) {
        markPresent();
        botDiv.classList.toggle('active-bot');
        botStatusChange();
        if (botCallbackFunc)
            clearInterval(botCallbackFunc);
        botClickToDoFunc = () => { };
        displayMessage("Attendance Marked");
    }
};

// Remove Video element from videoGrid of user
const removeVideo = (userId) => {
    document.getElementById(userId).remove();
};

// Append name to participant list
const appendNameParticipant = (name) => {
    let newParticipant = document.createElement('li');
    newParticipant.setAttribute('id', `p${name[1]}`);
    newParticipant.classList.add('participant-li');
    newParticipant.innerHTML = `<span>${name[0]}</span>
<div><i class="fas fa-robot"></i></div>
<div><i class="fas fa-clipboard-check"></i></div>
<div><i class="fas fa-video fa-video-slash"></i></div>
<div><i class="fas fa-microphone fa-microphone-slash"></i></div>`;
    document.getElementById('participant-list').appendChild(newParticipant);
};

// Function to leave room
const disconnect = (PEER_ID_2) => {
    socket.emit('leave-meeting', ROOM_ID, PEER_ID_2);
    socket.emit('leave-room', ROOM_ID, PEER_ID_2);
    window.location = '/';
};

// Handle to user unmute-mute event
socket.on('changeMuteStatus', (userId, unmuteStatus) => {
    document.getElementById(`p${userId}`).children[4].children[0].classList.toggle('fa-microphone-slash');
});
const muteUnmute = (id) => {
    document.getElementById('fa-microphone').classList.toggle('fa-microphone-slash');
    if (myVideoStream.getAudioTracks()[0].enabled) {
        socket.emit('audio-change', ROOM_ID, id, false);
        myVideoStream.getAudioTracks()[0].enabled = false;
    } else {
        socket.emit('audio-change', ROOM_ID, id, true);
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

// Handle user video on/off event
socket.on('changeVideoStatus', (userId, unmuteStatus) => {
    document.getElementById(`p${userId}`).children[3].children[0].classList.toggle('fa-video-slash');
});
const videoOnOff = (id) => {
    document.getElementById('fa-video').classList.toggle('fa-video-slash');

    if (myVideoStream.getVideoTracks()[0].enabled) {
        socket.emit('video-change', ROOM_ID, id, false);
        myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
        socket.emit('video-change', ROOM_ID, id, true);
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};
