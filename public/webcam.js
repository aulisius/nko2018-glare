import * as tf from '@tensorflow/tfjs';

let webcamElement = document.getElementById("webcam")

function adjustVideoSize(width, height) {
    const aspectRatio = width / height;
    if (width >= height) {
        webcamElement.width = aspectRatio * webcamElement.height;
    } else if (width < height) {
        webcamElement.height = webcamElement.width / aspectRatio;
    }
}

function capture() {
    return tf.tidy(() => {
        const webcamImage = tf.fromPixels(webcamElement);

        const croppedImage = cropImage(webcamImage);

        const batchedImage = croppedImage.expandDims(0);

        return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    });
}

function cropImage(img) {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
}

async function setupWebcam() {
    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                { video: true },
                stream => {
                    webcamElement.srcObject = stream;
                    webcamElement.addEventListener('loadeddata', async () => {
                        adjustVideoSize(
                            webcamElement.videoWidth,
                            webcamElement.videoHeight);
                        resolve();
                    }, false);
                },
                error => {
                    reject();
                });
        } else {
            reject();
        }
    });
}

setupWebcam().then(() => {
    let img = capture();
    console.log(img)
})