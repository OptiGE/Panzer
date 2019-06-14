var socket;

function preload() {
  bg = loadImage('assets/sky.png');
}

function setup() {
	createCanvas(200, 200);
	background(51);
	image(bg, 0, 0, windowWidth, windowHeight);
	
	socket = io.connect('http://192.168.0.29:3000');
	socket.on('join_room_approved', roomJoined);
}

function touchStarted () {
  var fs = fullscreen();
  if (!fs) {
    fullscreen(true);
  }
}

function roomJoined(data) {
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseDragged() {
	var data = {
		x: mouseX,
		y: mouseY
	}
	socket.emit('mouse', data);
}

function draw() {
	//ellipse(data.x, data.y, 36, 36);
}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling
 * the page.
 */
document.ontouchmove = function(event) {
    event.preventDefault();
};

