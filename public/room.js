let notifDiv = document.getElementById('notification-div');
let notifText = document.getElementById('notification-text');
let botDiv = document.getElementById('bot-div');
// Function to show error notification 
const displayMessage = (msg) => {
    notifDiv.classList.remove('no-display');
    notifText.innerText = msg;
    setTimeout(() => {
        notifText.innerText = '';
        notifDiv.classList.add('no-display');
    }, 5000);
};

document.getElementById('participant-toggle-btn').addEventListener('click', () => {
    document.getElementById('participant-div').classList.toggle('inactive');
});

document.getElementById('close-participant-panel').addEventListener('click', () => {
    document.getElementById('participant-div').classList.add('inactive');
});

// document.getElementById('chat-toggle-btn').addEventListener('click', () => {
//     document.getElementById('chat-div').classList.toggle('inactive');
// });

document.getElementById('close-chat-panel').addEventListener('click', () => {
    document.getElementById('chat-div').classList.add('inactive');
});
