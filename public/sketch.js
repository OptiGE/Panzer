var socket;
var btn_joinroom;

function preload() {
  bg = loadImage('assets/sky.png');
  btn_joinroom = [loadImage('assets/btn_joinroom_up.png'), loadImage('assets/btn_joinroom_p.png'), loadImage('assets/btn_joinroom_hv.png')];
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	image(bg, 0, 0, windowWidth, windowHeight);
	//image(btn_joinroom[0], (windowWidth - btn_joinroom[0].width) / 2 , (windowHeight - btn_joinroom[0].height) / 2, windowWidth / 10, windowHeight / 10);
	image(btn_joinroom[0], 0, 0, 600, 200);
	
	
	socket = io.connect('http://192.168.0.29:3000');
	//socket.on('mouse', newDrawing);
	
	
	$('body').addClass('overflow'); // För att förhindra scroll på mobilen
}

function draw() {
	//ellipse(data.x, data.y, 36, 36);
}


function titlescreen() {
	
}





// ------------------- M O B I L A N P A S S N I N G -----------------------------

function touchStarted () {
  var fs = fullscreen();
  if (!fs) {
    fullscreen(true);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  image(bg, 0, 0, windowWidth, windowHeight);

}







































function mouseDragged() {
	
	var data = {
		x: mouseX,
		y: mouseY
	}
	
	//socket.emit('mouse', data);
	
	noStroke();
	fill(0, 255, 100);
	ellipse(data.x, data.y, 10, 10);
}