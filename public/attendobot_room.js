let botActive = false;
let userImage = [];
const WAIT_TIME = FREQUENCY * 60 * 1000;
// COnverting the image to base64
let getBase64Image = (image, index) => {
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = function () {
        let base64 = reader.result;
        let temp_image = new Image();
        temp_image.src = base64;
        userImage[index] = temp_image;
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
};
let botClickToDoFunc = () => {
    botDiv.classList.toggle('active-bot');
    botStatusChange();
    botActive = !botActive;
    if (botActive) {
        // To take snapshot after a random interval after every 5 minutes
        botCallbackFunc = setInterval(() => {
            if (labledDescriptor != undefined)
                take_snapshot();
        }, WAIT_TIME);
    } else {
        clearInterval(botCallbackFunc);
    }
};
botDiv.addEventListener('click', () => {
    if (!userImage.includes(undefined)) {
        botClickToDoFunc();
    } else {
        document.getElementById("input-file-div").classList.remove("inactive");
    }
});

// Closing input file pop-up
document.getElementById("close-input-file-div").addEventListener('click', () => document.getElementById("input-file-div").classList.add("inactive"));

let userImageInputs = document.getElementsByClassName("userImage");
// Event-listener to process the image on upload
for (let i = 0; i < userImageInputs.length; i++) {
    userImage.push(undefined);
    userImageInputs[i].addEventListener('change', async (e) => {
        getBase64Image(e.target.files[0], i);
    }
    );
}

// Event-listener to handle the image upload
document.getElementById("userImagesUpload").addEventListener('click', () => {
    if (!userImage.includes(undefined)) {
        document.getElementById("input-file-div").classList.add("inactive");
        botClickToDoFunc();
        labeledImages();
    }
});

// Webcam setup
Webcam.set({
    width: 640,
    height: 480,
    image_formate: 'jpeg',
    jpeg_quality: 90
});

Webcam.attach('#webcam');
// Function to take snapshot
let snapShotCount = 0;
const take_snapshot = () => {
    snapShotCount++;
    console.log(`Snapshot count: ${snapShotCount}`);
    Webcam.snap(async (uri) => {
        let image = new Image();
        image.src = uri;
        let response = await process_image(image);
        markAttendance(response);
    });
};
