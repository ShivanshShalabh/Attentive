document.getElementById('fa-video').addEventListener('click', () => {
    document.getElementById('fa-video').classList.toggle('fa-video-slash');
    videoOnOff();
    let videoSpan = document.querySelector('#fa-video+span');
    videoSpan.innerText != "Video On" ? videoSpan.innerText = "Video On" : videoSpan.innerText = "Video Off";
});

document.getElementById('participant-toggle-btn').addEventListener('click', () => {
    document.getElementById('participant-div').classList.toggle('inactive');
});

document.getElementById('close-participant-panel').addEventListener('click', () => {
    document.getElementById('participant-div').classList.add('inactive');
});

document.getElementById('chat-toggle-btn').addEventListener('click', () => {
    document.getElementById('chat-div').classList.toggle('inactive');
});

document.getElementById('close-chat-panel').addEventListener('click', () => {
    document.getElementById('chat-div').classList.add('inactive');
});
document.getElementById('ai-robo').addEventListener('click', () => {
    document.getElementById('ai-robo').classList.toggle('active');
    let AISpan = document.querySelector('#ai-robo+span');
    AISpan.innerText != "Bot Inactive" ? AISpan.innerText = "Bot Inactive" : AISpan.innerText = "Bot Activated";
});
