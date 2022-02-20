let send_image_data;
let markPresent;
let botClickFunc;
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
    document.getElementById('fa-microphone').addEventListener('click', () => muteUnmute(id));
    document.getElementById('fa-video').addEventListener('click', () => videoOnOff(id));
    document.getElementById('leave-btn').addEventListener('click', () => disconnect(id));
    markPresent = () => {
        socket.emit('markPresent', ROOM_ID, id);
    };
    botDiv.addEventListener('click', () => {
        socket.emit('botStatusChange', ROOM_ID, id);
    });
    send_image_data = base64_val => socket.emit('process_image', ROOM_ID, id, base64_val);
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

const resetParticipants = () => document.getElementById('participant-list').innerHTML = '';
const func = () => { };
func();
socket.on('addParticipant', name => {
    resetParticipants();

    name.forEach(element => {
        appendNameParticipant(element);
    });
});
socket.on('removeParticipant', (name, userId) => {
    resetParticipants();
    name.forEach(element => {
        appendNameParticipant(element);
    });
    removeVideo(userId);
});
socket.on('changeMuteStatus', (userId, unmuteStatus) => {
    console.log(`someone ${unmuteStatus ? 'unmuted' : 'muted'}`);
    document.getElementById(`p${userId}`).children[4].children[0].classList.toggle('fa-microphone-slash');
    console.log(`p${userId}`);
});
socket.on('changeVideoStatus', (userId, unmuteStatus) => {
    console.log(`someone ${unmuteStatus ? 'unmuted' : 'muted'}`);
    document.getElementById(`p${userId}`).children[3].children[0].classList.toggle('fa-video-slash');
});
socket.on('markPresent', (userId) => {
    console.log("uwu");
    document.getElementById(`p${userId}`).children[2].children[0].classList.add('present');
});

socket.on('BotStatusChange', (userId) => {
    console.log("owo");
    document.getElementById(`p${userId}`).children[1].children[0].classList.toggle('attentive');
});
socket.on('imageProcessed', (automl_response) => {
    console.log(automl_response);
});
const removeVideo = (userId) => {
    document.getElementById(userId).remove();
};
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
const disconnect = (PEER_ID_2) => {
    socket.emit('leave-meeting', ROOM_ID, PEER_ID_2);
    socket.emit('leave-room', ROOM_ID, PEER_ID_2);
};
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
