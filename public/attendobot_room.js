let tapCount = 0;

botDiv.addEventListener('click', (id) => {
    botDiv.classList.toggle('active-bot');
    tapCount++;
    if (tapCount % 2 != 0) {
        botCallbackFunc = setInterval(() => {
            let waitSec = Math.floor(Math.random() * (40 - 0) + 0);
            console.log(waitSec);
            setTimeout(() => {
                take_snapshot();
            }, waitSec * 1000);
        }, 5 * 60 * 1000);
    } else {
        clearInterval(botCallbackFunc);
    }
});
Webcam.set({
    width: 640,
    height: 480,
    image_formate: 'jpeg',
    jpeg_quality: 90
});

Webcam.attach('#webcam');

const take_snapshot = () => {
    Webcam.snap((uri) => {
        let img = document.getElementById('temp');
        img.removeAttribute('src');
        img.setAttribute('src', uri);
        let base64_value = uri.split(';')[1].split(',')[1];
        console.log(base64_value);
        
        send_image_data(base64_value);
        // star1
        // const reader = new FileReader();
        // reader.onload = function () {
        //     const bytes = new Uint8Array(img.result);
        // };
        // reader.readAsArrayBuffer(img.files[0]);
        // console.log('done');
        // star2
        // const reader = new FileReader();
        // reader.onload = function () {
        //     const base64 = img.result.replace(/.*base64,/, '');
        //     socket.emit('image', base64);
        // };
        // reader.readAsDataURL(img.files[0]);
        // str3
        // let c = document.getElementById("canvas");
        // let ctx = c.getContext("2d");
        // ctx.drawImage(img, 10, 10);
        // console.log(c.toDataURL());

        // getBase64(uri);
        // toBase64(img);
    });
};

// document.getElementById('bot-div').addEventListener('click', () => {
//     take_snapshot();
// });
// const getBase64Image = (img) => {
//     let canvas = document.createElement("canvas");
//     canvas.width = img.width;
//     canvas.height = img.height;
//     let ctx = canvas.getContext("2d");
//     ctx.drawImage(img, 0, 0);
//     let dataURL = canvas.toDataURL("image/png");
//     return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
// };

// const toBase64 = (file) => {
//     let base64String = "";
//     let reader = new FileReader();
//     console.log("next");
//     reader.onload = function () {
//         base64String = reader.result.replace("data:", "")
//             .replace(/^.+,/, "");

//         imageBase64Stringsep = base64String;
//         console.log(base64String);
//     };
//     reader.readAsDataURL(file);
//     console.log("Base64String about to be printed");
//     alert(base64String);
// };

// const getBase64 = url => {
//     console.log('doing');
//     imageToBase64(url)
//         .then(
//             (response) => {
//                 console.log(response);
//             }
//         )
//         .catch(
//             (error) => {
//                 console.log(error);
//             }
//         );
// };