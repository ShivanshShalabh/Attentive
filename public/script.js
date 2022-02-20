const NICKNAME = window.prompt("Enter your name: ");
var PEER_ID = ' ';

const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

// var peer = new Peer();
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000',
});

// Ask user for camera and microphone permissions
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        }
        );
    });

    socket.on('user-connected', (userID) => {
        connectToNewUser(userID, stream);
    });
    myVideoStream.getAudioTracks()[0].enabled = false;
    myVideoStream.getVideoTracks()[0].enabled = false;
});

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, NICKNAME);

    document.getElementById('leave-btn').addEventListener('click', () => disconnect(id));
    socket.emit('user-joined', ROOM_ID, NICKNAME, id);
});
const connectToNewUser = (userID, stream) => {
    const call = peer.call(userID, stream);
    const video = document.createElement('video');
    video.setAttribute('id', userID);

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
};
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
};
const sendMessage = () => {
    if (messageBox.value != "") {
        socket.emit('message', messageBox.value, NICKNAME);
        createMessageLi(messageBox.value, "You", false);
        messageBox.value = '';
    }
};

let messageBox = document.getElementById('message-box');
document.getElementsByTagName('html')[0].addEventListener("keyup", (e) => {
    if (e.key == "Enter") sendMessage();
});
document.getElementById('message-submit-btn').addEventListener("click", sendMessage);

let messageInbox = document.getElementById('message-inbox');

socket.on('createMessage', (message, tempNickname) => {
    createMessageLi(message, tempNickname, true);
});

const createMessageLi = (message, userName, incoming) => {
    let liToAppend = document.createElement('li');
    liToAppend.classList.add(incoming ? 'recieved' : 'sent');
    liToAppend.innerHTML = `<strong>${userName}</strong><span>${message}</span>`;
    messageInbox.appendChild(liToAppend);
    scroollToBottom();
};

const scroollToBottom = () => {
    // Scroll to bottom of messageInbox
    let messageInboxScroll = $('.messages_container');
    messageInboxScroll.scrollTop(messageInboxScroll.prop('scrollHeight'));
};

// Mute video off

const muteUnmute = () => {
    if (myVideoStream.getAudioTracks()[0].enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

document.getElementById('fa-microphone').addEventListener('click', () => {
    document.getElementById('fa-microphone').classList.toggle('fa-microphone-slash');
    muteUnmute();
});

const videoOnOff = () => {
    if (myVideoStream.getVideoTracks()[0].enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};
const resetParticipants = () => document.getElementById('participant-list').innerHTML = '';
const func = () => { };
func();
socket.on('addParticipant', name => {
    resetParticipants();

    name.forEach(element => {
        appendNameParticipant(element[0]);
    });
});
socket.on('removeParticipant', (name, userId) => {
    resetParticipants();

    name.forEach(element => {
        appendNameParticipant(element[0]);
    });
    removeVideo(userId);
});
const removeVideo = (userId) => {
    document.getElementById(userId).remove();
};
const appendNameParticipant = (name) => {
    let newParticipant = document.createElement('li');
    newParticipant.innerHTML = `<span>${name}</span> <i class="fas fa-video fa-video-slash" id="fa-video"></i>
    <i class="fas fa-microphone fa-microphone-slash" id="fa-microphone"></i>`;
    document.getElementById('participant-list').appendChild(newParticipant);
};
const disconnect = (PEER_ID_2) => {
    socket.emit('leave-meeting', ROOM_ID, PEER_ID_2);
    socket.emit('leave-room', ROOM_ID, PEER_ID_2);
};
