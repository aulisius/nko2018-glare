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

requestPermission()
  .then(stream => {
    console.log(stream);
  })
  .catch(error => {
    if (error.name === "NotAllowedError") {
      alert("kindly allow video and audio permissins for a better experience");
    } else {
      alert(error.message);
    }
  });
