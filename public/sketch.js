// Socketvariabler
var socket;


//Knappkontroll
var buttons_clickable = true;
var all_buttons_up = true;

//Element
var btn_joinroom, btn_createroom, btn_login;
var btn_stop, btn_left, btn_right, btn_fire;
var actionfield;
var slot_1, slot_2, slot_3;
var field_1, field_2;
var door_1, door_2, door_3;

var hearts_p1 = [];
var hearts_p2 = [];

var btn_launch;

var p1, p2;

// Scenvariabler
var current_scene;

// Typsnittsvariabler
let font;

// In-gamevariabler
var actionArray;
var slotArray;
var gameState = 1;
var	chosenDoorNr = -1;


/*	waitingState = 0;
	pickDoorState = 1;
	pickSequenceState = 2;
	animationState = 3;
	gameOverState = 4;

	*/
	
var gameObj = {
	this_id: '', //antingen p1 eller p2
	opponent_id: '', //antingen p1 eller p2
	this_pos: 1,
	opponent_pos: 2,
	this_health: 3,
	opponent_health: 3,
	current_player: 0 //0 för denna klient, 1 för motståndaren
}

var myID = 'not_assigned';
var opponentID = 'not_assigned';
var p1_nick = 'not_assigned';
var p2_nick = 'not_assigned';
var room_name = 'not_assigned';

class Panzer {
	
	constructor(pos, img1, img2) {
		this.pos = pos;
		this.img1 = img1;
		this.img2 = img2;
		this.sprite = new Element('panzer', 0, 270, 270, ['assets/tank.png', 'assets/tank_fire.png']);
	}
	
	moveRight() {
		//this.sprite.setSpeed(3, 0);
		this.sprite.position.x = this.sprite.position.x + (door_2.position.x - door_1.position.x);
	}
	
	moveLeft() {
		//this.sprite.position.x = this.sprite.position.x - (door_2.position.x - door_1.position.x);
	}
	
	fire() {
		this.sprite.animation.changeFrame(1);
		setTimeout(function(bog) {
		bog.sprite.animation.changeFrame(0);
		}, 300, this.sprite);
	}
}

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
	socket = io.connect('http://localhost:3000');
	socket.on('alert', function(msg){alert(msg);});
	
	
	// Event hanterare
	socket.on('name_approved', function(id){
		btn_login.sprite.remove();
		$('#loginModal').modal('hide');
		SceneSetup.roomScene(id.name);
		p1_nick = id.name;
		myID = id.id;
	});
	
	socket.on('join_room_approved', function(room){
		btn_joinroom.sprite.remove();
		btn_createroom.sprite.remove();
		$('#loginModal').modal('hide');
		SceneSetup.gameScene(room.name, room.p1_nick);
		gameState = 0;
		room_name = room.name;
	});
	
	socket.on('p2_joined', function(id){
		/* textAlign(RIGHT);
		text(name, windowWidth - (windowHeight / 25), windowHeight / 10); */
		alert(id.name + ' just joined the game!');
		gameState = 1;
		p2_nick = id.name;
		opponentID = id.id;
	});
	
	socket.on('pick_door_state', function(playerID){
		alert(playerID + " will now choose a door");
		if (myID == playerID) {
			buttons_clickable = true;
			gameObj.current_player = 0;
			alert('Your turn!');
		}else{
			buttons_clickable = false;
			gameObj.current_player = 1;
			alert('Waiting for other player...');
		}
		gameState = 1;
	});
	
	socket.on('sequence_state', function(doorNr){
		if (doorNr == 0){
			door_1.sprite.animation.changeFrame(1);
			console.log(doorNr);
		}else if (doorNr == 1){
			door_2.sprite.animation.changeFrame(1);
		}else if (doorNr == 2){
			door_3.sprite.animation.changeFrame(1);
		}
		alert("Door chosen. Please pick a sequence");
		buttons_clickable = true;
		gameState = 2;
	});
	
	socket.on('animation_state', function(animation){
		alert("Animation received: " + animation);
	});
	
	// För att förhindra scroll på mobilen
	$('body').addClass('overflow'); 
	
	// Starta login scenen
	SceneSetup.loginScene();
	
	
}

function draw() {
	drawSprites();
	if (current_scene == 'game_scene' && gameState >= 0) {
		textAlign(LEFT);
		text(p1_nick, windowHeight / 25, windowHeight / 10);
		textAlign(CENTER);
		text(room_name, windowWidth / 2, windowHeight / 25);
		if (gameState > 0) {
			textAlign(RIGHT);
			text(p2_nick, windowWidth - (windowHeight / 25), windowHeight / 10);
		}
	}
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
		
		
	 }else if (rq == 3){
		socket.emit('door_chosen', chosenDoorNr); 
		console.log(chosenDoorNr);
	 
	 
	 }else if (rq == 4){
		socket.emit('sequence_chosen', actionArray); 
		console.log("ActionArray som skickades: " + ActionArray);
	 }
	 
 }

function windowResized() {
	console.log("Window resized");
}


function actionChosen(frameNr) {
	first_zero = actionArray.findIndex(k => k == 0);
	if(first_zero < 0 || first_zero > 2){return;}
	
	actionArray[first_zero] = frameNr;
	for (i=0; i<slotArray.length; i++) {
		slotArray[i].sprite.animation.changeFrame(actionArray[i]);
	}
	console.log(actionArray);
}

function updateHealth() {
	for (i = 0; i < 3; i++){
		hearts_p1[i].sprite.animation.changeFrame((i < gameObj.this_health) | 0); // Detta är samma som Number(i < gameObj.this_health), fast snabbare
		hearts_p2[i].sprite.animation.changeFrame((i < gameObj.opponent_health) | 0);
	}
}

function deselectDoors() {
	door_1.sprite.animation.changeFrame(0);
	door_2.sprite.animation.changeFrame(0);
	door_3.sprite.animation.changeFrame(0);
	chosenDoorNr = -1;
}

function launchSequence() {
	setTimeout(function() {
		launchAction(actionArray[0])
		}, 300);
	setTimeout(function() {
		launchAction(actionArray[1])
		}, 600);
	setTimeout(function() {
		launchAction(actionArray[2])
		}, 900);
	
}

function launchAction(slot) {
	switch(slot) {
		case 3:
			p1.moveLeft();
			break;
		case 4:
			p1.moveRight();
			break;
		case 5:
			p1.fire();
			break;
		default:
			break;
	}
}

function mouseReleased() {
	if(current_scene == 'login_scene'){
		btn_login.sprite.animation.changeFrame(0);
	}else if (current_scene == 'room_scene'){		
		btn_joinroom.sprite.animation.changeFrame(0);
		btn_createroom.sprite.animation.changeFrame(0);
	}else if (current_scene == 'game_scene'){
		btn_stop.sprite.animation.changeFrame(0);
		btn_left.sprite.animation.changeFrame(0);
		btn_right.sprite.animation.changeFrame(0);
		btn_fire.sprite.animation.changeFrame(0);
		btn_launch.sprite.animation.changeFrame(0);
		
		buttons_clickable = true;
		all_buttons_up = true;
	}
}
