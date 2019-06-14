var socket;
var btn_joinroom;

function preload() {
  //Ladda in non-sprite assets
  bg = loadImage('assets/sky.png');
}

function setup() {
	
	//Sapa canvas och sätt in bakgrund
	createCanvas(windowWidth, windowHeight);
	image(bg, 0, 0, windowWidth, windowHeight);
	
	//Skapa knapp-sprite och animation
	btn_joinroom = createSprite((windowWidth - 600) / 2, 350);
	btn_joinroom.addAnimation('standard', 'assets/btn_joinroom_up.png', 'assets/btn_joinroom_hv.png', 'assets/btn_joinroom_p.png');
	//btn_joinroom.animation.playing = false;
	btn_joinroom.onMouseOver = function() {
		this.goToFrame(2);
	};
	btn_joinroom.playing = false;
	 
	
	//Anslut till socketservern
	socket = io.connect('http://192.168.0.29:3000');
	//socket.on('mouse', newDrawing);
	
	
	// För att förhindra scroll på mobilen
	$('body').addClass('overflow'); 
}

function draw() {
	drawSprites();
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

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  image(bg, 0, 0, windowWidth, windowHeight);

}
*/






































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