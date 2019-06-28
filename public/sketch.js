// Socketvariabler
var socket;

// Knappvariabler
var btn_joinroom;
var btn_createroom;
var btn_login;
var buttons_clickable = true;
var all_buttons_up = true;

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

var myID;
var p1_nick = 'undefined';
var p2_nick = 'undefined';
var room_name = 'undefined';

class Panzer {
	
	constructor(pos, img1, img2) {
		this.pos = pos;
		this.img1 = img1;
		this.img2 = img2;
		this.sprite = newElement('panzer', 0, 270, 270, ['assets/tank.png', 'assets/tank_fire.png']);
	}
	
	moveRight() {
		this.sprite.position.x = this.sprite.position.x + (door_2.position.x - door_1.position.x);
	}
	
	moveLeft() {
		this.sprite.position.x = this.sprite.position.x - (door_2.position.x - door_1.position.x);
	}
	
	fire() {
		this.sprite.animation.changeFrame(1);
		setTimeout(function(bog) {
		bog.animation.changeFrame(0);
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
	socket.on('name_approved', function(name){
		btn_login.remove();
		$('#loginModal').modal('hide');
		roomScene(name);
		p1_nick = name;
	});
	
	socket.on('join_room_approved', function(room){
		btn_joinroom.remove();
		btn_createroom.remove();
		$('#loginModal').modal('hide');
		gameScene(room.name, room.p1_nick);
		gameState = 0;
		room_name = room.name;
	});
	
	socket.on('p2_joined', function(name){
		/* textAlign(RIGHT);
		text(name, windowWidth - (windowHeight / 25), windowHeight / 10); */
		alert(name + ' just joined the game!');
		gameState = 1;
		p2_nick = name;
	});
	
	socket.on('pick_door_state', function(playerID){
		if (myID = playerID) {
			buttons_clickable = true;
			alert('Your turn!');
		}else {
			buttons_clickable = false;
		}
		gameState = 1;
	});
	
	
	// För att förhindra scroll på mobilen
	$('body').addClass('overflow'); 
	
	// Starta login scenen
	gameScene();
	
	
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



function loginScene(){
	
	current_scene = 'login_scene';
	
	//Bakgrund
	image(bg, 0, 0, windowWidth, windowHeight);
	
	//Skapa Create room knapp
	btn_login = newElement('stdButton', 0, 600, 200, ['assets/btn_login_up.png', 'assets/btn_login_p.png']);
	
	
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
	
	//Sätt spelarens namn som titel
	fill(30, 30, 30);
	text(name, windowWidth / 2, windowHeight / 3.5); //Center aligned text
	
	//Skapa knappar
	btn_joinroom = newElement('stdButton', 0, 600, 200, ['assets/btn_joinroom_up.png', 'assets/btn_joinroom_p.png']);
	btn_createroom = newElement('stdButton', 1, 600, 200, ['assets/btn_createroom_up.png', 'assets/btn_createroom_p.png']);
	
	
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
	
	//Bakgrund
	bg = newElement('background', 0, 800, 600, ['assets/sky.png']); //image(bg, 0, 0, windowWidth, windowHeight);
	
	//Nya regler för text, inte som de som skapades i setup()
	textSize(min((windowHeight / 25), (windowWidth / 15)));
	fill(30, 30, 30);
	
	//Skriv ut rumsnamnet i mitten
	/* textAlign(CENTER);
	text(roomName, windowWidth / 2, windowHeight / 25); */
	
	//Skriv ut P1 i det övre vänstra hörnet (p2 skrivs ut i socket.on(p2_join))
	/* textAlign(LEFT);
	text(p1_nick, windowHeight / 25, windowHeight / 10); */


	//Skapa action-knappar
	btn_stop = newElement('actionButton', -18, 200, 200, ['assets/btn_stop_up.png', 'assets/btn_stop_p.png', 'assets/btn_stoplock_p.png']);
	btn_left = newElement('actionButton', -6, 200, 200, ['assets/btn_left_up.png', 'assets/btn_left_p.png', 'assets/btn_leftlock_p.png']);
	btn_right = newElement('actionButton', 6, 200, 200, ['assets/btn_right_up.png', 'assets/btn_right_p.png', 'assets/btn_rightlock_p.png']);
	btn_fire = newElement('actionButton', 18, 200, 200, ['assets/btn_fire_up.png', 'assets/btn_fire_p.png', 'assets/btn_firelock_p.png']);
	
	//Skapa actionfield
	actionfield = newElement('actionField', 0, 1000, 300, ['assets/actionfield.png']);
	
	//Skapa actionslots
	slot_1 = newElement('actionSlot', -1, 200, 200, ['assets/btn_null.png', 'assets/btn_stopcock_up.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png']);
	slot_2 = newElement('actionSlot', 0, 200, 200, ['assets/btn_null.png', 'assets/btn_stopcock_up.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png']);
	slot_3 = newElement('actionSlot', 1, 200, 200, ['assets/btn_null.png', 'assets/btn_stopcock_up.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png']);
	
	//Heart fields
	field_1 = newElement('heartField', 0, 200, 200, ['assets/heart_field.png']);
	field_2 = newElement('heartField', 1, 200, 200, ['assets/heart_field.png']);
	
	//Doors ÄNDRA STORLEK PÅ SPRITES FÖR HITBOX
	door_1 = newElement('doorButton', -15, 200, 200, ['assets/door_closed.png', 'assets/door_charged.png']);
	door_2 = newElement('doorButton', 0, 200, 200, ['assets/door_closed.png', 'assets/door_charged.png']);
	door_3 = newElement('doorButton', 15, 200, 200, ['assets/door_closed.png', 'assets/door_charged.png']);
	
	//Hjärtan
	hearts_p1 = [];
	hearts_p2 = [];
	
	for (i = 1; i <= 3; i++) {
		hearts_p1.push(newElement('heart', i, 150, 150, ['assets/heart.png', 'assets/btn_null.png']))
		hearts_p2.push(newElement('heart', -i, 150, 150, ['assets/heart.png', 'assets/btn_null.png']))
	}
	
	//Launch-knapp
	btn_launch = newElement('launchButton', 0, 200, 200, ['assets/btn_fire_up.png', 'assets/btn_fire_p.png']);
	
	//Panzer
	p1 = new Panzer(0, 'assets/tank.png', 'assets/tank_fire.png');
	//p1.moveRight();
	console.log(p1.sprite.position.x);
	
	//Actionfield-variabler
	slotArray = [slot_1, slot_2, slot_3];
	actionArray = [0, 0, 0];
	
	//Knapp-event hanterare
	btn_stop.onMousePressed = eventHandler.createActionHandler(2, btn_stop);
	btn_left.onMousePressed = eventHandler.createActionHandler(3, btn_left);
	btn_right.onMousePressed = eventHandler.createActionHandler(4, btn_right);
	btn_fire.onMousePressed = eventHandler.createFireActionHandler(); //Denna är unik, så inga argument behövs

	slot_1.onMousePressed = eventHandler.createSlotHandler(0);
	slot_2.onMousePressed = eventHandler.createSlotHandler(1);
	slot_3.onMousePressed = eventHandler.createSlotHandler(2);
	
	door_1.onMousePressed = eventHandler.createDoorHandler(0, door_1);
	door_2.onMousePressed = eventHandler.createDoorHandler(1, door_2);
	door_3.onMousePressed = eventHandler.createDoorHandler(2, door_3);
	
	btn_launch.onMousePressed = eventHandler.createLaunchHandler();

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
	 }
	 
 }

function windowResized() {
	console.log("Window resized");
}


function newElement(type, offset, width, height, imageArray){
	elem = createSprite(0, 0, width, height);
	elem.addAnimation('standard', ...imageArray);
	elem.animation.playing = false;
	elem.mouseActive = true;		
	switch(type) {
		case 'stdButton':
			elem.scale = windowHeight / (7*200); //scale sätts så att knappens höjd om 200 översätts till 1/7 av skärmen
			elem.position.x = windowWidth / 2;
			elem.position.y = ((windowHeight + 100) / 2) + ((offset * 200*elem.scale)*1.3);
			break;
		case 'actionField':
			elem.scale = windowHeight / (7*300);
			elem.position.x = ((windowWidth) / 2);
			elem.position.y = windowHeight - (windowHeight - btn_stop.position.y) - elem.scale*300*1.3;
			break;
		case 'actionButton':
			elem.scale = (windowHeight > windowWidth) ? windowWidth / (5*200) : windowHeight / (7*200);
			elem.position.x = (windowWidth / 2) + offset * windowWidth / 50;
			elem.position.y = (windowHeight > windowWidth) ? (windowHeight - (windowWidth*0.14)) : windowHeight*0.88;
			break;
		case 'actionSlot':
			elem.scale = actionfield.scale;
			elem.position.x = (windowWidth / 2) + offset * 1000 * actionfield.scale / 3;
			elem.position.y = actionfield.position.y;
			break;
		case 'doorButton':
			elem.scale = btn_stop.scale * 0.7;
			elem.position.x = (windowWidth / 2) + offset * windowWidth / 50;
			elem.position.y = field_1.position.y + ((actionfield.position.y - field_1.position.y)/2)*0.8;
			break;
		case 'heartField':
			elem.scale = windowHeight / (7*500);
			elem.position.x = offset ? windowHeight / 25 + (elem.scale * 500 / 2) : windowWidth - (windowHeight / 25 + (elem.scale * 500/2));
			elem.position.y = (windowHeight / 10) + 1.5 * textSize();
			break;
		case 'heart':
			elem.scale = field_1.scale;
			elem.position.x = (offset < 0) ? field_1.position.x + (offset + 2)*(500*field_1.scale/4) : field_2.position.x + (offset - 2)*(500*field_1.scale/4);
			elem.position.y = field_1.position.y;
			break;
		case 'launchButton':
			elem.scale = btn_stop.scale;
			elem.position.x = windowWidth - 200*elem.scale;
			elem.position.y = actionfield.position.y;
			break;
		case 'background':
			elem.scale = max((windowHeight / 600), (windowWidth / 800));
			elem.position.x = windowWidth / 2;
			elem.position.y = windowHeight / 2;
			break;
		case 'panzer':
			elem.scale = door_1.scale*2;
			elem.position.x = (windowWidth / 2) + (offset - 1)*(door_2.position.x - door_1.position.x);
			elem.position.y = windowHeight / 2;
			break;
		default:
			elem.position.x = windowWidth / 2;
			elem.position.y = windowHeight / 2;
	}
	return elem;
}

var eventHandler = {

	createActionHandler(action, btn) {
		return function() {
			if(buttons_clickable && all_buttons_up && actionArray.includes(0)){
				btn.animation.changeFrame(1);
				buttons_clickable = false;
				all_buttons_up = false;
				if (actionArray.includes(0)) {
					actionChosen(action);
					//p1.moveLeft(); //updateHealth(); //test
				}
			}else if (!buttons_clickable && all_buttons_up || !actionArray.includes(0) && all_buttons_up) { //fortsätt
				btn.animation.changeFrame(2);
				all_buttons_up = false;
			
			}else {
				
			}
		}
	},

	createFireActionHandler() {
		return function(){
			if(buttons_clickable && all_buttons_up){
				btn_fire.animation.changeFrame(1);
				buttons_clickable = false;
				all_buttons_up = false;
				if (actionArray[actionArray.findIndex(k => k == 0) + 1] > 2 || actionArray.includes(5)) { //Nästa objekt i listan är inte stopp || Det finns redan eld
					btn_fire.animation.changeFrame(2);
					all_buttons_up = false;
				} else if (actionArray.includes(0)) {
					actionArray[actionArray.findIndex(k => k == 0) + 1] = 0; //Töm platsen efteråt också
					actionChosen(5); //Lägg till en eld
					actionChosen(1); //Lägg ett stopp där
				}
			}else if (!buttons_clickable && all_buttons_up || !actionArray.includes(0) && all_buttons_up){
				btn_fire.animation.changeFrame(2);
				all_buttons_up = false;
				
			}else {
				
			}
		}
	},

	createSlotHandler(slot){
		return function(){
			if (buttons_clickable && actionArray[slot] != 1) { //Buttonsclickable && man tryckte inte på en grå
			  
				if (actionArray[slot] == 5 && slot != 2){ //Tryckte på eld som inte är sist i listan
					console.log("I'm in");
					slotArray[slot + 1].animation.changeFrame(0);
					actionArray[slot + 1] = 0;
				}
				
				//Detta görs alltid
				buttons_clickable = false;
				all_buttons_up = false;
				slotArray[slot].animation.changeFrame(0);
				actionArray[slot] = 0;
				
			}
		}		   
	},
	
	createDoorHandler(doorNr, door){
		return function(){
			if (buttons_clickable && all_buttons_up){
				deselectDoors();
				door.animation.changeFrame(1);
				buttons_clickable = false;
				all_buttons_up = false;
				chosenDoorNr = doorNr;
			}
		}
	},
	
	createLaunchHandler(){
		return function(){
			if (buttons_clickable && all_buttons_up){
				btn_launch.animation.changeFrame(1);
				buttons_clickable = false;
				all_buttons_up = false;
				launchSequence();
				if (chosenDoorNr != -1){
					sendRQ(3);
					deselectDoors();
				}
					
			}else if (!buttons_clickable && all_buttons_up) {
				btn_launch.animation.changeFrame(2);
				
			}else {
				
			}
		}
	}
}


function actionChosen(frameNr) { 
	actionArray[actionArray.findIndex(k => k == 0)] = frameNr;
	for (i=0; i<slotArray.length; i++) {
		slotArray[i].animation.changeFrame(actionArray[i]);
	}
	console.log(actionArray);
}

function updateHealth() {
	for (i = 0; i < 3; i++){
		if (i < gameObj.this_health) {
			hearts_p1[i].animation.changeFrame(0)
		}else{
			hearts_p1[i].animation.changeFrame(1);
		}
		if (i < gameObj.opponent_health) {
			hearts_p2[i].animation.changeFrame(0)
		}else{
			hearts_p2[i].animation.changeFrame(1);
		}
		
	}
}

function deselectDoors() {
	door_1.animation.changeFrame(0);
	door_2.animation.changeFrame(0);
	door_3.animation.changeFrame(0);
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
		btn_login.animation.changeFrame(0);
	}else if (current_scene == 'room_scene'){		
		btn_joinroom.animation.changeFrame(0);
		btn_createroom.animation.changeFrame(0);
	}else if (current_scene == 'game_scene'){
		btn_stop.animation.changeFrame(0);
		btn_left.animation.changeFrame(0);
		btn_right.animation.changeFrame(0);
		btn_fire.animation.changeFrame(0);
		btn_launch.animation.changeFrame(0);
		
		buttons_clickable = true;
		all_buttons_up = true;
	}
}
