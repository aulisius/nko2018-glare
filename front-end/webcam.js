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
      navigator.mediaDevices.getUserMedia;
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
          reject(error);
        }
      );
    } else {
      reject("This version of the browser does not support the required device functions");
    }
  });
}

