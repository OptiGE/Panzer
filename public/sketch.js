//-------------------------------------------------------------------------------------------

//----------------------------- F Ö R B E R E D E L S E R -----------------------------------

//-------------------------------------------------------------------------------------------
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
var door_1, door_2, door_3, doors; //Door 1-2 läggs i arrayen doors i Scene setup

var hearts_p1 = [];
var hearts_p2 = [];

var btn_launch;

var p1, p2;

//Fönsterstorlek
var cWindowWidth; //Konstanta versioner av windowWidth och height som inte ändras när t.ex tangentbord dyker upp på mobil
var cWindowHeight;
	
// Scenvariabler
var current_scene;

// Typsnittsvariabler
let font;

// In-gamevariabler
var actionArray;
var slotArray;
var	chosenDoorNr = -1;

var gameState = 1;
const waitingState = 0, pickDoorState = 1, pickSequenceState = 2, animationState = 3, gameOverState = 4;

//Animationsvariabler
var currentlyMoving = []; //Array för alla objekt som rör sig
var animation_list = []; //Håller en lista av animationer för både p1 och p2, i den ordning de ska komma //Den stoppar in första animationen i p1, väntar tills den är klar, stoppar in nästa i p2 osv osv
var global_animation_running = false;

// BÖR OCKSÅ HÅLLA KOLLA PÅ POSITIONER OCH ANNAT OCH REGELBUNDET KOLLA MED SERVERNS MOTSVARANDE VÄRDEN!!!!
var gameObj = {
	
	openDoor: -1,                         //KOM IHÅG ATT DEFAULTA TILL -1 SEDAN. 
	
	this_health: 3,
	opponent_health: 3,
	current_player: 0 //0 för mig själv, 1 för motståndaren
}

var myID = 'not_assigned';
var opponentID = 'not_assigned';
var p1_nick = 'not_assigned';
var p2_nick = 'not_assigned';
var room_name = 'not_assigned';

//-------------------------------------------------------------------------------------------

//----------------------------- P 5   F U N K T I O N E R -----------------------------------

//-------------------------------------------------------------------------------------------

function preload() {
  //Ladda in non-sprite assets
  bg = loadImage('assets/sky.png');
  title = loadImage('assets/title.png');
  font = loadFont('assets/collegeb.ttf');
}

function setup() {

	// Skapa Canvas
	cWindowWidth = windowWidth;
	cWindowHeight = windowHeight;
	console.log("WindowWidth is", windowWidth);
	createCanvas(cWindowWidth, cWindowHeight);
	
	// Bestäm typsnittskaraktäristik
	textFont(font);
	textSize(cWindowHeight / 10);
	textAlign(CENTER, CENTER);
	
	// Anslut till socketservern
	socket = io.connect(window.location.href); //t.ex 192.168.1.169:3000 eller localhost:3000
	socket.on('alert', function(msg){alert(msg);});
	
	
	// Event hanterare
	socket.on('name_approved', function(id){
		console.log("Name approved");
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
		gameState = waitingState;
		room_name = room.name;
	});
	
	socket.on('p2_joined', function(id){
		/* textAlign(RIGHT);
		text(name, cWindowWidth - (cWindowHeight / 25), cWindowHeight / 10); */
		alert(id.name + ' just joined the game!');
		gameState = pickDoorState;
		p2_nick = id.name;
		opponentID = id.id;
	});
	
	socket.on('pick_door_state', function(playerID){
		//alert(playerID + " will now choose a door");
		if (myID == playerID) {
			buttons_clickable = true;
			gameObj.current_player = 0;
			alert('Your turn!');
		}else{
			buttons_clickable = false;
			gameObj.current_player = 1;
			alert('Waiting for other player...');
		}
		gameState = pickDoorState;
	});
	
	socket.on('sequence_state', function(doorNr){
		
		//Mark door as green
		doors[doorNr].sprite.animation.changeFrame(1);
		
		gameObj.openDoor = doorNr;
		
		alert("Door chosen. Please pick a sequence");
		buttons_clickable = true;
		gameState = pickSequenceState;
	});
	
	socket.on('animation_state', function(animations){
		alert("Animation received: " + animations);
		
		//Byt dörrsprite till öppen dörr
		doors[gameObj.openDoor].sprite.animation.changeFrame(2);
		
		animation_list = animations; //Hade hellre lagt in dem än att skriva över, men tar det i framtiden
		
		//När den har kört igenom alla skall animation state avslutas
		//animation_list.append("END ANIMATION STATE. GÅ TILL CHOOSE DOOR STATE ELLER NÅT");
		
		for (let value of animations) {
			console.log("----a----");
			console.log(value);
		}
	});
	
	// För att förhindra scroll på mobilen
	$('body').addClass('overflow'); 
	
	// Starta login scenen
	SceneSetup.loginScene();
	//SceneSetup.gameScene();
	
	
}


//----------------------------------------------------------------------------------------------------------------------

//----------------------------- M A I N   L O O P    (A N I M A T I O N E R) -------------------------------------------

//----------------------------------------------------------------------------------------------------------------------

function draw() {
	drawSprites();						
	
									  //För kontext har gameState bara relevans i game_scene
	if (current_scene == 'game_scene' && gameState >= waitingState) {
		
		//Måla ut alla perifera grejer så att de inte blir övermålade av bakgrunden
		textAlign(LEFT);
		text(p1_nick, cWindowHeight / 25, cWindowHeight / 10);
		textAlign(CENTER);
		text(room_name, cWindowWidth / 2, cWindowHeight / 25);
		textAlign(RIGHT);
		text(p2_nick, cWindowWidth - (cWindowHeight / 25), cWindowHeight / 10);
		
		
		//Här ska den jobba igenom animationerna i den ordning den har fått dem
		//Kolla igenom objekten som väntar på att få nästa animation startade
		if(animation_list.length != 0 && !global_animation_running){ 
			let animation = animation_list.shift();
			
			if(animation[0] == myID){
				global_animation_running = true; //animation_running sätts till false på lite olika ställen, men alltid i Panzer filen
				p1.animate(animation[1]);
			}else if(animation[0] == opponentID){
				global_animation_running = true; //animation_running sätts till false på lite olika ställen, men alltid i Panzer filen
				p2.animate(animation[1]);
			}else{
				console.log("Varning! - " + animation[0] + " är inte ett korrekt ID");
			}
		}
		
		//Kolla om de objekt som rör på sig har nått sitt target. Isf stanna dem
		
		for(i = 0; i < currentlyMoving.length; i++){
			
			moving_element = currentlyMoving[i];
			
			/*	Om objektet rör sig åt höger blir factor 1, om vänster -1. Anledningen är att man kan kolla både < och > på samma rad genom att ha en faktor, eftersom 0 ska kolla om positionen är större och 180 om den är mindre. Matten: x > y == -x < -y evaluerar alltid till sant */
			
			let factor = (moving_element.element.sprite.getDirection() == 0) ? 1 : -1; //Kolla om riktningen är 0 eller 180 
			
				if(moving_element.element.sprite.position.x * factor >= moving_element.target.x * factor){
					moving_element.stopMove(); //Stanna den (och sätt den på rätt plats om den har gått för långt)
					currentlyMoving.splice(i, 1); //Ta ut den ur currentlyMoving;
				}
		}
		
		
	}
}





//-------------------------------------------------------------------------------------------

//----------------------------- Ö V R I G A   F U N K T I O N E R ---------------------------

//-------------------------------------------------------------------------------------------



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
			p1.skipLeft();
			break;
		case 4:
			p1.skipRight();
			break;
		case 5:
			p1.animateFire();
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
 
function sendRQ(rq){
	 if (rq == 0){
		if (document.getElementById('inputName').value != ''){
			socket.emit('get_name', document.getElementById('inputName').value.toUpperCase());
		}else{
			console.log("4");
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

