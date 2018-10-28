import * as tf from "@tensorflow/tfjs";

// let webcamElement = document.getElementById("webcam");

function adjustVideoSize(webcamElement, width, height) {
  const aspectRatio = width / height;
  if (width >= height) {
    webcamElement.width = aspectRatio * webcamElement.height;
  } else if (width < height) {
    webcamElement.height = webcamElement.width / aspectRatio;
  }
}

export async function setupWebcam(webcamElement) {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia ||
      navigatorAny.mozGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { video: true },
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener(
            "loadeddata",
            async () => {
              adjustVideoSize(
                webcamElement,
                webcamElement.videoWidth,
                webcamElement.videoHeight
              );
              resolve(webcamElement);
            },
            false
          );
        },
        error => {
          reject();
        }
      );
    } else {
      reject();
    }
  });
}

// function initModel() {
//   let webcamElement = document.getElementById("webcam");
//   setupWebcam(webcamElement)
//     .then(webcamElement => {
//       //   let img = capture();
//       return loadMobileNet();
//       //   console.log(img);
//     })
//     .then(() => {
//       document
//         .getElementById("closed-fist")
//         .addEventListener("click", function() {
//           addLabel(1);
//         });

//       document
//         .getElementById("open-palm")
//         .addEventListener("click", function() {
//           addLabel(0);
//         });
//       document.getElementById("train").addEventListener("click", function() {
//         train().then(() => {
//           document
//             .getElementById("predict")
//             .addEventListener("click", function() {
//               predict();
//             });
//         });
//       });
//     });
// }

// initModel();
