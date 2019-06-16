var socket;
var btn_joinroom;
var btn_createroom;

function preload() {
  //Ladda in non-sprite assets
  bg = loadImage('assets/sky.png');
}

function setup() {
	
	
	//Skapa Canvas och bakgrund
	createCanvas(windowWidth, windowHeight);
	image(bg, 0, 0, windowWidth, windowHeight);
	
	//Skapa Join room knapp
	btn_joinroom = createSprite(0, 0, 600, 200);
	addStdButton(btn_joinroom, 0, 'assets/btn_joinroom_up.png', 'assets/btn_joinroom_p.png');
	
	//Skapa Create room knapp
	btn_createroom = createSprite(0, 0, 600, 200);
	addStdButton(btn_createroom, 1, 'assets/btn_createroom_up.png', 'assets/btn_createroom_p.png');
	
	//Anslut till socketservern
	socket = io.connect('http://192.168.0.29:3000');
	//socket.on('mouse', newDrawing);
	
	
	// För att förhindra scroll på mobilen
	$('body').addClass('overflow'); 
	
	
	//Knapp-event hanterare
	btn_joinroom.onMousePressed = function() {
		//$('#joinRoomModal').modal('toggle');
		$('#joinRoomModal').modal('toggle');
		console.log("Showing modal");
		btn_joinroom.animation.changeFrame(1);
	};
	
	btn_createroom.onMousePressed = function() {
		btn_createroom.animation.changeFrame(1);
	};
	
}

function draw() {
	drawSprites();
}






// ------------------- M O B I L A N P A S S N I N G -----------------------------

/* function touchStarted () {
  var fs = fullscreen();
  if (!fs) {
    fullscreen(true);
  }
}
 */

function windowResized() {
	console.log("Window resized");
}


function addStdButton(btn, heightOffset, img1, img2){
	btn.addAnimation('standard', img1, img2);
	btn.animation.playing = false;
	btn.scale = windowHeight / (7*200); //scale sätts så att knappens höjd om 200 översätts till 1/7 av skärmen
	btn.mouseActive = true;
	btn.position.x = ((windowWidth) / 2);
	btn.position.y = ((windowHeight + 100) / 2) + ((heightOffset * 200*btn.scale)*1.3);
	console.log(btn.height);
}

function mouseReleased() {
	btn_joinroom.animation.changeFrame(0);
	btn_createroom.animation.changeFrame(0);
}

function mouse0Dragged() {
	
	var data = {
		x: mouseX,
		y: mouseY
	}
	
	//socket.emit('mouse', data);
}