let start = async () => { };
// Getting all the required files  ready
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start);

let labledDescriptor = undefined;

// Face recognition fnction
let process_image = async (image) => {
    if (!labledDescriptor) return false;
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    // Checking if a face is detected
    if (detections.length > 0) {
        // Check for face recognition
        const faceMatcher = new faceapi.FaceMatcher(labledDescriptor, 0.6);
        const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
        if(results.length>0) return true;
        return false;
    }

    return false;
};

// Function to process data set
let labeledImages = async () => {
    const label = 'User';
    const descriptions = [];
    for (let i = 0; i < userImage.length; i++) {
        const detections = await faceapi.detectSingleFace(userImage[i]).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
    }

    labledDescriptor = new faceapi.LabeledFaceDescriptors(label, descriptions);
};