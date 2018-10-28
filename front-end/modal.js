import { setUpCamera } from "./main";

var videoTag = document.getElementById('webcam');
videoTag.hidden = true;

$(document).ready(function(){
  $('#intro-modal').iziModal('open');
});

$("#modal").iziModal();
$("#intro-modal").iziModal();


$(document).on('click', '.trigger', function (event) {
    event.preventDefault();
    $('#modal').iziModal('open');
    shiftVideoTag('webcam-anchor');
});

$(document).on('closing', "#modal", function(event){
  shiftVideoTag('body-anchor');
});

$(document).on('opening', '#modal', function(event) {
  shiftVideoTag('webcam-anchor');
  setUpCamera();
})
function shiftVideoTag(id){
  document.getElementById(id).appendChild(videoTag);
  videoTag.hidden = false;
  videoTag.play();
}
