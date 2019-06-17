// Socketvariabler
var socket;

// Knappvariabler
var btn_joinroom;
var btn_createroom;
var btn_login;
var buttons_clickable = true;

// Scenvariabler
var current_scene;

// Typsnittsvariabler
let font,
  fontsize = 40;

function preload() {
  //Ladda in non-sprite assets
  bg = loadImage('assets/sky.png');
  title = loadImage('assets/title.png');
  font = loadFont('assets/collegeb.ttf');
}

function setup() {

	// Skapa Canvas
	createCanvas(windowWidth, windowHeight);
	
	// Bestäm typsnittskaraktäristik
	textFont(font);
	textSize(fontsize);
	textAlign(CENTER, CENTER);
	
	// Anslut till socketservern
	socket = io.connect('http://192.168.0.29:3000');
	socket.on('alert', function(msg){alert(msg);});
	
	
	// Event hanterare
	socket.on('name_approved', function(name){
		btn_login.remove();
		$('#loginModal').modal('hide');
		roomScene(name);
	});
	
	
	// För att förhindra scroll på mobilen
	$('body').addClass('overflow'); 
	
	// Starta login scenen
	loginScene();
	
	
}



function draw() {
	drawSprites();
}



function loginScene(){
	
	current_scene = 'login_scene';
	
	//Bakgrund
	image(bg, 0, 0, windowWidth, windowHeight);
	
	//Skapa Create room knapp
	btn_login = createSprite(0, 0, 600, 200);
	addStdButton(btn_login, 0, 'assets/btn_login_up.png', 'assets/btn_login_p.png');
	
	//Knapp-event hanterare
	btn_login.onMousePressed = function() {
		if(buttons_clickable){
			$('#loginModal').modal('toggle');
			console.log("Showing login modal");
			btn_login.animation.changeFrame(1);
			buttons_clickable = false;
		}
	};
	
}


function roomScene(name){
	
	current_scene = 'roomScene';
	
	image(bg, 0, 0, windowWidth, windowHeight);
	//image(title, 0, 0, windowWidth / 1.2, 200);
	
	//Sätt spelarens namn som titel
	
	
	//Skapa Join room knapp
	btn_joinroom = createSprite(0, 0, 600, 200);
	addStdButton(btn_joinroom, 0, 'assets/btn_joinroom_up.png', 'assets/btn_joinroom_p.png');
	
	//Skapa Create room knapp
	btn_createroom = createSprite(0, 0, 600, 200);
	addStdButton(btn_createroom, 1, 'assets/btn_createroom_up.png', 'assets/btn_createroom_p.png');
	
	//Knapp-event hanterare
	btn_joinroom.onMousePressed = function() {
		if(buttons_clickable){
			$('#joinRoomModal').modal('toggle');
			console.log("Showing join room modal");
			btn_joinroom.animation.changeFrame(1);
			buttons_clickable = false;
		}
	};
	
	btn_createroom.onMousePressed = function() {
		if(buttons_clickable){
			$('#createRoomModal').modal('toggle');
			console.log("Showing create room modal");
			btn_createroom.animation.changeFrame(1);
			buttons_clickable = false;
		}
	};
	
}

function lobbyScene(){
	
}

function gameScene(){
	
}



// ------------------- M O B I L A N P A S S N I N G -----------------------------

/* function touchStarted () {
  var fs = fullscreen();
  if (!fs) {
    fullscreen(true);
  }
}
 */

 
 function sendRQ(rq){
	 if (rq == 0){
		if (document.getElementById('inputName').value != ''){
			socket.emit('get_name', document.getElementById('inputName').value);
		}else{
			alert("You can't log in without a name!");
		}
		
		
	 }else if (rq == 1){
		if (document.getElementById('inputCRoomName').value != ''){
			socket.emit('create_room', document.getElementById('inputCRoomName').value);
		}else{
			alert("You can't create a room with no name!");
		}
		
		
	 }else if (rq == 2){
		 
	 }
	 
 }

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
	if(current_scene == 'login_scene'){
		btn_login.animation.changeFrame(0);
	}else{
		btn_joinroom.animation.changeFrame(0);
		btn_createroom.animation.changeFrame(0);
	}
}