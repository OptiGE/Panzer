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
var actionArray;
var slotArray;

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
	
	socket.on('join_room_approved', function(room){
		alert("Room object is: " + room);
		btn_joinroom.remove();
		btn_createroom.remove();
		$('#loginModal').modal('hide');
		gameScene(room.name, room.p1_nick);
	});
	
	socket.on('p2_joined', function(name){
		textAlign(LEFT);
		text(name, windowHeight / 25, windowHeight / 12);
	});
	
	
	// För att förhindra scroll på mobilen
	$('body').addClass('overflow'); 
	
	// Starta login scenen
	gameScene();
	
	
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


function gameScene(roomName, p1_nick){
	current_scene = 'game_scene';
	console.log(roomName + " " + p1_nick);
	
	//Bakgrund
	image(bg, 0, 0, windowWidth, windowHeight);
	
	//Nya regler för text, inte som de som skapades i setup()
	textSize(windowHeight / 25);
	fill(30, 30, 30);
	
	//Skriv ut rumsnamnet i mitten
	textAlign(CENTER);
	text(roomName, windowWidth / 2, windowHeight / 25);
	
	//Skriv ut P1 i det övre vänstra hörnet
	textAlign(LEFT);
	text(p1_nick, windowHeight / 25, windowHeight / 25);

	
	
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
	placeActionfield(actionfield, 'assets/actionfield.png'); 
	
	//Skapa actionslots
	slot_1 = createSprite(0, 0, 200, 200);
	addActionSlot(slot_1, -1, 'assets/btn_null.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png');
	
	slot_2 = createSprite(0, 0, 200, 200);
	addActionSlot(slot_2, 0, 'assets/btn_null.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png');
	
	slot_3 = createSprite(0, 0, 200, 200);
	addActionSlot(slot_3, 1, 'assets/btn_null.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png');
	
	slotArray = [slot_1, slot_2, slot_3];
	actionArray = [0, 0, 0];
	
	//Knapp-event hanterare
	btn_stop.onMousePressed = function() {
		if(buttons_clickable){
			btn_stop.animation.changeFrame(1);
			buttons_clickable = false;
			if (actionArray.includes(0)) {
				actionChosen(1);
			}
		}
	};
	btn_left.onMousePressed = function() {
		if(buttons_clickable){
			btn_left.animation.changeFrame(1);
			buttons_clickable = false;
			if (actionArray.includes(0)) {
				actionChosen(2);
			}
		}
	};
	btn_right.onMousePressed = function() {
		if(buttons_clickable){
			btn_right.animation.changeFrame(1);
			buttons_clickable = false;
			if (actionArray.includes(0)) {
				actionChosen(3);
			}
		}
	};
	btn_fire.onMousePressed = function() {
		if(buttons_clickable){
			btn_fire.animation.changeFrame(1);
			buttons_clickable = false;
			if (actionArray.includes(0)) {
				actionChosen(4);
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
	btn.addAnimation('standard', img1, img2);
	btn.animation.playing = false;
	btn.scale = windowHeight / (7*200); //scale sätts så att knappens höjd om 200 översätts till 1/7 av skärmen
	btn.mouseActive = true;
	btn.position.x = ((windowWidth) / 2);
	btn.position.y = ((windowHeight + 100) / 2) + ((heightOffset * 200*btn.scale)*1.3);
	console.log(btn.height);
}

function placeActionfield(btn, img1){
	btn.addAnimation('standard', img1); //Single frame
	btn.animation.playing = false;
	btn.scale = windowHeight / (7*300); //scale sätts så att knappens höjd om 200 översätts till 1/7 av skärmen
	btn.mouseActive = true;
	btn.position.x = ((windowWidth) / 2);
	btn.position.y = windowHeight - (windowHeight - btn_stop.position.y) - btn.scale*300*1.3;
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

function addActionSlot (slot, slotPosition, img0, img1, img2, img3, img4){
	slot.addAnimation('standard', img0, img1, img2, img3, img4);
	slot.animation.playing = false;
	slot.scale = actionfield.scale; //scale sätts så att knappens bredd om 200 översätts till 1/5 av skärmen
	slot.position.x = (windowWidth / 2) + slotPosition * 1000*actionfield.scale / 3;
	slot.position.y = actionfield.position.y;
	slot.mouseActive = true;
	console.log(slot.height);
}

function actionChosen(frameNr) { 
	actionArray[actionArray.findIndex(k => k == 0)] = frameNr;
	for (i=0; i<slotArray.length; i++) {
		slotArray[i].animation.changeFrame(actionArray[i]);
	}
	console.log(actionArray);
}

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