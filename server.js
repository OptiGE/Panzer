// ----------------------------------------------------------------------------
// ----------------------------- V A R I A B L E R ----------------------------
// ----------------------------------------------------------------------------

var Game = require('./Game');  

// Karta över alla rum och spelarna de är kopplade till | key = string, value = [string, string, obj]
var roomMap = new Map();


// ----------------------------------------------------------------------------
// ----------------------------- E X P R E S S --------------------------------
// ----------------------------------------------------------------------------

// Starta Express som används för hosting
var express = require('express');
var app = express();

// Initiera servern
var server = app.listen(3000, started);

// Skriv ut information när servern startar
function started() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Servern kör på port: ' + port);
	console.log("");
}

// Ge ut 'public' mappen som statisk förstasida vid get. 
app.use(express.static('public'));

// ----------------------------------------------------------------------------
// ----------------------------- S O C K E T S --------------------------------
// ----------------------------------------------------------------------------

// Koppla samman Sockets med Express (server är en expressvariabel) 
var io = require('socket.io')(server);

// Kör funktionen newConnection vid varje ny socketanslutning
io.sockets.on('connection', newConnection);
console.log("Klar med init");

function newConnection(socket) {

    console.log("Ny klient ansluten: " + socket.id);

	
	//                                       --- G E T   N A M E   ---
    socket.on('get_name',
      function(name) {
		name = name.toUpperCase();
		console.log(socket.id + ' tries to get the name: ' + name);
		if (name.length < 9){
			socket.nickname = name;
			socket.emit('name_approved', {name: name, id: socket.id});
			console.log(socket.id + "is now called: " + socket.nickname);
			//Just nu finns inget som kollar om namnet redan finns, eftersom att samma
			//användarnamn på flera sockets inte är ett problem. Annars, skapa bara en map eller ett objekt
		}else{
			socket.emit('alert', 'The name: ' + name + ' is must be 8 characters or less');
			console.log('But the name was too long, at ' + name.length + ' characters');
		}
      }
    );
	
	//                                     --- C R E A T E   R O O M  ---
    socket.on('create_room',
      function(roomName) {
		roomName = roomName.toUpperCase();
        console.log(socket.nickname + ' tries to create the room: ' + roomName);
		
		//Om rummet inte redan är skapat
		if (!roomMap.has(roomName)) {
			
			//Om användaren inte är med i något rum (utöver sitt egna)
			if (!(Object.keys(socket.rooms).length > 1)){
				//Skapa rummet och lägg till personen på rätt ställe
				socket.join(roomName);
				roomMap.set(roomName, [socket.id]);
				console.log(socket.nickname + ' successfully created room: ' + roomName);
				socket.emit('join_room_approved', { name: roomName, p1_nick: socket.nickname});
			//Om användaren redan är i ett rum
			}else{
				socket.emit('alert', 'You are already in a room, named ' + Object.keys(socket.rooms)[1]);
				console.log(socket.nickname + ' failed to create room: ' + roomName + ' since ' + socket.nickname + ' is already in a room ');	
			}
			
		//Om rummet redan är skapat
		}else{
			console.log(socket.nickname + ' failed to create room: ' + roomName + ' since it already existed');		
			socket.emit('alert', 'The room: ' + roomName + ' already exists. Please choose another name');
		}
      }
    );
	
	//                                      --- J O I N   R O O M  ---
    socket.on('join_room',
		function(roomName) {
			roomName = roomName.toUpperCase();
			console.log(socket.nickname + ' tries to join the room: ' + roomName);
			console.log("Room map: " + roomMap);
			console.log("-----");
			//Kolla om rummet finns
			if (roomMap.has(roomName)) {
				//Kolla om rummet har en eller två spelare i sig.
				var numClients = io.sockets.adapter.rooms[roomName].length;
				console.log("numClients: " + numClients);
				if (numClients < 2) {
					//Om användaren inte är med i något rum (utöver sitt egna)
					if (!(Object.keys(socket.rooms).length > 1)){
						
						//Spelet är skapat!
						socket.join(roomName);
						let gameObj = new Game(roomName, io.sockets.sockets[roomMap.get(roomName)[0]].id, socket.id, getRandomInt(2));
						roomMap.set(roomName, [roomMap.get(roomName)[0], socket.id, gameObj]); //Lägger ihop den gamla entrien med den nya spelaren och deras gemensamma spelobjekt
						
						//Låt klienten sätta upp sitt rum
						console.log("Room sucessfully joined");
						socket.emit('join_room_approved', { name: roomName, p1_nick: socket.nickname});
						
						//Ge medlemmarna varandras namn
						socket.to(roomName).emit('p2_joined', {name: socket.nickname, id: socket.id}); //Skicka joinarens namn till alla som redan är i rummet (bör bara vara 1)
						socket.emit('p2_joined', {name: io.sockets.sockets[roomMap.get(roomName)[0]].nickname, id: io.sockets.sockets[roomMap.get(roomName)[0]].id}); //Skicka den som redan är i rummets namn till joinaren
						
						//Sätt igång spelet!
						io.in(roomName).emit('pick_door_state', gameObj.getCurrentPlayer().id); //Berätta för alla i rummet vems tur det är
						console.log("currentPlayer.id: " + gameObj.getCurrentPlayer().id);
						gameObj.game_state = 'pick_door_state';
						
					}else{
						socket.emit('alert', 'Sorry, you are already in a room named ' + Object.keys(socket.rooms)[1]);
					}
				}else{
					socket.emit('alert', 'Sorry, the room ' + roomName + ' is already full');
				}
			}else{
				socket.emit('alert', 'Sorry, the room ' + roomName + ' does not exist yet');
			}
        }
    );

	//										--- D I S C O N N E C T ---
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
	  //Kom ihåg att ta bort från roomMap vid disconnect
    });
  
  
	//										--- D O O R   C H O S E N ---
	socket.on('door_chosen', function(door) {
		
		this_room = Object.keys(socket.rooms)[1];
		this_game = roomMap.get(this_room)[2];
		
		if(this_game.game_state != 'pick_door_state'){
			console.log("Någon försökte välja en dörr i fel state: " + socket.nickname);
			return;
		}
		
		if (this_game.getCurrentPlayer().id == socket.id){ //Om det är den här spelarens tur att välja dörr
			if (door >= 0 && door <= 2){ //Om det är en ok dörr att välja
				
				isPlayerOne = Number(!(socket.id == this_game.players[0].id)); //1 Om spelare 1, 0 om spelare två (negeras för att matten i nästa rad skall gå ihop)
				
				this_game.open_door	= 2*isPlayerOne + (door * Math.pow(-1, isPlayerOne)); // Blir antingen (door), eller (2 - door).
				
				socket.emit('sequence_state', door); //Till den aktiva socketen
				socket.to(this_room).emit('sequence_state', 2 - door); //Till alla i rummet som inte är denna socketen (alltså motståndaren)
				
				this_game.game_state = 'sequence_state';
			}else{
				console.log("Dörr index utanför gränsen: " + door);
			}
		}else{
			console.log("VARNING! - Fel användare försökte välja dörr - VARNING!");
		}
      }
    );
	
	
	
	//										--- S E Q U E N C E   C H O S E N  ---
	socket.on('sequence_chosen', function(sequence) {
		console.log("Sequence chosen from " + socket.nickname + "/" + socket.id);
		this_room = Object.keys(socket.rooms)[1];
		this_game = roomMap.get(this_room)[2];
		
		if(!(this_game.game_state == "sequence_state")){
			console.log("Någon försökte skicka en sekvens i fel game state");
			return;
		}
		
		//Kolla om avsändaren redan har en sekvens, annars fyll i den
		if(this_game.getPlayerFromID(socket.id).sequence != []){
			this_game.getPlayerFromID(socket.id).sequence = this_game.controlledSequence(sequence);
			console.log("Sekvens mottagen från " + socket.nickname + ": " + this_game.getPlayerFromID(socket.id).sequence);
		}
		
		//Kolla om båda nu har sekvenser, i så fall gå vidare med spelet
		if(this_game.players[0].sequence.length == 3 && this_game.players[1].sequence.length == 3){
			console.log("Båda spelare har en sekvens i " + this_game.room + ". Kör igenom ronda och skapar animaiton!");
			
			this_game.execSequence();
			
			//Skicka animationer och speldata (som hälsa, position (inte den hemliga positionen) osv, nu efter att alla sekvenser är utförda)
			this_animation = this_game.getPlayerFromID(socket.id).animation;
			other_animation = this_game.other(this_game.getPlayerFromID(socket.id)).animation;
			
			socket.emit('animation_state', this_animation); //Till den aktiva socketen
			socket.to(this_room).emit('animation_state', other_animation); //Till alla i rummet som inte är denna socketen (alltså motståndaren)
			
			this_game.game_state = "animation_state";
			
			console.log("Animation strings are sent");
			
			//Nu en megaemit med alla nya värden?
			//socket.emitToHelaRummet('game_state_update', gameStateInfoBös);
						
		}
		
      }
    );
	
}


// ----------------------------------------------------------------------------
// ----------------------------- A L L M Ä N N A   F U N K T I O N E R  -------
// ----------------------------------------------------------------------------

function zip(a, b){
	var c = [];
	if (a.length != b.length){
		console.log("VARNING! --- Zipfunktionens inparametrar har olika längd! --- VARNING!");
		return;
	}
	for (var i = 0; i < a.length; i++){
		c.push(a[i]);
		c.push(b[i]);
	}
	return c;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


