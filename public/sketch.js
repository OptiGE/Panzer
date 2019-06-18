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
let font;

// In-gamevariabler
var actions = [];

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
	textSize(windowHeight / 10);
	textAlign(CENTER, CENTER);
	
	// Anslut till socketservern
	socket = io.connect('http://192.168.1.175:3000');
	socket.on('alert', function(msg){alert(msg);});
	
	
	// Event hanterare
	socket.on('name_approved', function(name){
		btn_login.remove();
		$('#loginModal').modal('hide');
		roomScene(name);
	});
	
	
	// Event hanterare
	socket.on('join_room_approved', function(name){
		btn_joinroom.remove();
		btn_createroom.remove();
		$('#loginModal').modal('hide');
		gameScene();
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
	addStdButton(btn_login, -0.4, 'assets/btn_login_up.png', 'assets/btn_login_p.png');
	
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
	
	current_scene = 'room_scene';
	
	image(bg, 0, 0, windowWidth, windowHeight);
	//image(title, 0, 0, windowWidth / 1.2, 200);
	
	//Sätt spelarens namn som titel
	fill(30, 30, 30); // Svarta hela streck
	text(name, windowWidth / 2, windowHeight / 3.5); //Kom ihåg att texten är center aligned
	
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


function gameScene(){
	current_scene = 'game_scene';
	
	//Bakgrund
	image(bg, 0, 0, windowWidth, windowHeight);
	
	//Skapa action-knappar
	
	btn_stop = createSprite(0, 0, 200, 200);
	addActionButton(btn_stop, -18, 'assets/btn_stop_up.png', 'assets/btn_stop_p.png');
	
 	btn_left = createSprite(0, 0, 200, 200);
	addActionButton(btn_left, -6, 'assets/btn_left_up.png', 'assets/btn_left_p.png');
	
	btn_right = createSprite(0, 0, 200, 200);
	addActionButton(btn_right, 6, 'assets/btn_right_up.png', 'assets/btn_right_p.png');
	
	btn_fire = createSprite(0, 0, 200, 200);
	addActionButton(btn_fire, 18, 'assets/btn_fire_up.png', 'assets/btn_fire_p.png'); 
	
	//Skapa actionfield
	actionfield = createSprite(0, 0, 1000, 300);
	addStdButton(actionfield, 0.8, 'assets/actionfield.png', 'assets/actionfield.png');
	
	//Knapp-event hanterare
	btn_stop.onMousePressed = function() {
		if(buttons_clickable){
			btn_stop.animation.changeFrame(1);
			buttons_clickable = false;
			if (actions.length <3) {
				actions.push('stop');//Ändra till actionChosen
			}
		}
	};
	btn_left.onMousePressed = function() {
		if(buttons_clickable){
			btn_left.animation.changeFrame(1);
			buttons_clickable = false;
			if (actions.length <3) {
				actions.push('left');//-ll-
			}
		}
	};
	btn_right.onMousePressed = function() {
		if(buttons_clickable){
			btn_right.animation.changeFrame(1);
			buttons_clickable = false;
			if (actions.length <3) {
				actions.push('right');//-ll-
			}
		}
	};
	btn_fire.onMousePressed = function() {
		if(buttons_clickable){
			btn_fire.animation.changeFrame(1);
			buttons_clickable = false;
			if (actions.length <3) {
				actions.push('fire');//-ll-
			}
		}
	};

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
			socket.emit('get_name', document.getElementById('inputName').value.toUpperCase());
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
		if (document.getElementById('inputJRoomName').value != ''){
			socket.emit('join_room', document.getElementById('inputJRoomName').value.toUpperCase());
		}else{
			alert("You can't join a room with no name!");
		}
	 }
	 
 }

function windowResized() {
	console.log("Window resized");
}

function addStdButton(btn, heightOffset, img1, img2){
	if (img1 != img2) {
		btn.addAnimation('standard', img1, img2);
	}else {
		btn.addAnimation('standard', img1); //Single frame
	}	
	btn.animation.playing = false;
	btn.scale = windowHeight / (7*200); //scale sätts så att knappens höjd om 200 översätts till 1/7 av skärmen
	btn.mouseActive = true;
	btn.position.x = ((windowWidth) / 2);
	btn.position.y = ((windowHeight + 100) / 2) + ((heightOffset * 200*btn.scale)*1.3);
	console.log(btn.height);
}

function addActionButton(btn, btnPosition, img1, img2){ //Samma som addStdButton, fast med position i sidled istället
	btn.addAnimation('standard', img1, img2);
	btn.animation.playing = false;
	if (windowHeight > windowWidth){
		btn.scale = windowWidth / (5*200); //scale sätts så att knappens bredd om 200 översätts till 1/5 av skärmen
		btn.position.x = (windowWidth / 2) + btnPosition * windowWidth / 50;
		btn.position.y = windowHeight - (windowWidth*0.14);
	} else {
		btn.scale = windowHeight / (7*200);
		btn.position.x = (windowWidth / 2) + btnPosition * windowWidth / 50;
		btn.position.y = windowHeight*0.88;
	}		

	btn.mouseActive = true;
	console.log(btn.height);
}

//function addActionSlot (

/* function addAction(order, img) {
	createSprite(((windowHeight+100)/2) + ((0.8*200*(windowHeight/(7*200))*1.3)), (windowWidth*order)/4, 200, 200);'
	
} */

/* function actionChosen(x) {
	if (x == 1) {
		actions.push('stop');
		
	}
} */

function mouseReleased() {
	if(current_scene == 'login_scene'){
		btn_login.animation.changeFrame(0);
	}else if (current_scene == 'room_scene'){		
		btn_joinroom.animation.changeFrame(0);
		btn_createroom.animation.changeFrame(0);
	}else if (current_scene == 'game_scene'){
		btn_stop.animation.changeFrame(0);
		btn_left.animation.changeFrame(0);
		btn_right.animation.changeFrame(0);
		btn_fire.animation.changeFrame(0);
		buttons_clickable = true;
	}
}






