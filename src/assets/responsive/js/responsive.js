var isFullscreen = false;

// update canvas size
var refreshCanvas = function() {
  $("#unityContainer").width(window.innerWidth);
  $("#unityContainer").height(window.innerHeight - 60);
};

$(function() {
  // scale canvas correctly once on start
  refreshCanvas();
});

// on window resize, apply width to game
$( window ).resize(function() {
  refreshCanvas();
});
