let permissions = {
  audio: true,
  video: true
}

const hasgetUserMedia = () => {
  return (navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
navigator.mediaDevices.getUserMedia(permissions)
  .then(stream => {
    console.log(stream);
  })
  .catch(error => {
    if(error.name === "NotAllowedError"){
      alert("kindly allow video and audio permissins for a better experience");
    }
  });
