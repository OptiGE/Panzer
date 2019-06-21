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
	socket = io.connect('http://localhost:3000');
	socket.on('alert', function(msg){alert(msg);});
	
	
	// Event hanterare
	socket.on('name_approved', function(name){
		btn_login.remove();
		$('#loginModal').modal('hide');
		roomScene(name);
	});
	
	socket.on('join_room_approved', function(room){
		btn_joinroom.remove();
		btn_createroom.remove();
		$('#loginModal').modal('hide');
		gameScene(room.name, room.p1_nick);
	});
	
	socket.on('p2_joined', function(name){
		textAlign(RIGHT);
		text(name, windowWidth - (windowHeight / 25), windowHeight / 10);
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
	//image(title, 0, 0, windowWidth / 1.2, 200);
	
	//Sätt spelarens namn som titel
	fill(30, 30, 30); // Svarta hela streck
	text(name, windowWidth / 2, windowHeight / 3.5); //Kom ihåg att texten är center aligned
	
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
	image(bg, 0, 0, windowWidth, windowHeight);
	
	//Nya regler för text, inte som de som skapades i setup()
	textSize(min((windowHeight / 25), (windowWidth / 15)));
	fill(30, 30, 30);
	
	//Skriv ut rumsnamnet i mitten
	textAlign(CENTER);
	text(roomName, windowWidth / 2, windowHeight / 25);
	
	//Skriv ut P1 i det övre vänstra hörnet (p2 skrivs ut i socket.on(p2_join))
	textAlign(LEFT);
	text(p1_nick, windowHeight / 25, windowHeight / 10);


	//Skapa action-knappar
	btn_stop = newElement('actionButton', -18, 200, 200, ['assets/btn_stop_up.png', 'assets/btn_stop_p.png']);
	btn_left = newElement('actionButton', -6, 200, 200, ['assets/btn_left_up.png', 'assets/btn_left_p.png']);
	btn_right = newElement('actionButton', 6, 200, 200, ['assets/btn_right_up.png', 'assets/btn_right_p.png']);
	btn_fire = newElement('actionButton', 18, 200, 200, ['assets/btn_fire_up.png', 'assets/btn_fire_p.png']);
	
	//Skapa actionfield
	actionfield = newElement('actionField', 0, 1000, 300, ['assets/actionfield.png']);
	
	//Skapa actionslots
	slot_1 = newElement('actionSlot', -1, 200, 200, ['assets/btn_null.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png']);
	slot_2 = newElement('actionSlot', 0, 200, 200, ['assets/btn_null.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png']);
	slot_3 = newElement('actionSlot', 1, 200, 200, ['assets/btn_null.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png']);
	
	//Actionfield-variabler
	slotArray = [slot_1, slot_2, slot_3];
	actionArray = [0, 0, 0];
	
	//Knapp-event hanterare
	btn_stop.onMousePressed = eventHandler.createActionHandler(1, btn_stop);
	btn_left.onMousePressed = eventHandler.createActionHandler(2, btn_left);
	btn_right.onMousePressed = eventHandler.createActionHandler(3, btn_right);
	btn_fire.onMousePressed = eventHandler.createFireActionHandler(); //Denna är unik, så inga argument behövs

	slot_1.onMousePressed = eventHandler.createSlotHandler(0, slot_1);
	slot_2.onMousePressed = eventHandler.createSlotHandler(1, slot_2);
	slot_3.onMousePressed = eventHandler.createSlotHandler(2, slot_3);

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
			elem.scale = (windowHeight > windowWidth) ? windowWidth / (5*200) : windowWidth / (7*200);
			elem.position.x = (windowWidth / 2) + offset * windowWidth / 50;
			elem.position.y = (windowHeight > windowWidth) ? (windowHeight - (windowWidth*0.14)) : windowHeight*0.88;
			break;
		case 'actionSlot':
			elem.scale = actionfield.scale;
			elem.position.x = (windowWidth / 2) + offset * 1000 * actionfield.scale / 3;
			elem.position.y = actionfield.position.y;
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
			if(buttons_clickable){
				btn.animation.changeFrame(1);
				buttons_clickable = false;
				if (actionArray.includes(0)) {
					actionChosen(action);
				}
			}
		}
	},

	createFireActionHandler() {
		return function(){
				if(buttons_clickable){
					btn_fire.animation.changeFrame(1);
					buttons_clickable = false;
					if (actionArray[actionArray.findIndex(k => k == 0) + 1] > 1 || actionArray.includes(4)) {
						alert('Forbidden move');
					} else if (actionArray.includes(0)) {
						actionChosen(4);
						actionChosen(1);
					}
				}
			   }
	},

	createSlotHandler(i, slot){
		return function(){
				  if (buttons_clickable) {
					buttons_clickable = false;
					slot.animation.changeFrame(0);
					actionArray[i] = 0;
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