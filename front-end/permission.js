let permissions = {
  audio: true,
  video: true
}

function hasGetUserMedia() {
  return (navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export async function requestPermission() {
  return hasGetUserMedia() ? navigator.mediaDevices.getUserMedia(permissions)
    : new Error("This version of the browser does not support the required device functions");
}
