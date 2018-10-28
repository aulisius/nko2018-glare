import { setUpCamera, startGame } from "./main";

var videoTag = document.getElementById('webcam');
videoTag.hidden = true;

$("#modal").iziModal();
document.getElementById("modal").hidden = false;
document.getElementById("intro-modal").hidden = false;
$("#intro-modal").iziModal();
$('#intro-modal').iziModal('open');

$("#score-modal").iziModal();

$(document).on('click', '.trigger', function (event) {
  event.preventDefault();
  $('#modal').iziModal('open');
  shiftVideoTag('webcam-anchor');
});

$(document).on('closing', "#modal", function (event) {
  shiftVideoTag('body-anchor');
});

$(document).on('opening', '#modal', function (event) {
  shiftVideoTag('webcam-anchor');
  setUpCamera();
});
function shiftVideoTag(id) {
  document.getElementById(id).appendChild(videoTag);
  videoTag.hidden = false;
  videoTag.play();
}

$("#predict").on('click', function (event) {
  $("#modal").iziModal('close');
  startGame();
});
