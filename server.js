// ----------------------------------------------------------------------------
// ----------------------------- V A R I A B L E R ----------------------------
// ----------------------------------------------------------------------------

// Karta över alla spelares namn kopplat till deras socketID | key = string, value = string
var nameMap = new Map();

// Karta över alla rum och spelarna de är kopplade till | key = string, value = [string, string]
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
  console.log('Servern kör på '+ host + port);
  console.log(" - - - - ");
	console.log(" - - -");
	console.log(" - - ");
	console.log(" - ");
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

	
	//  --- Försöker få ett namn ---
    socket.on('get_name',
      function(name) {
		name = name.toUpperCase();
        console.log(getName(socket.id) + ' tries to get the name: ' + name);
		
		// Om namnet inte redan är taget
		if (!nameMap.has(socket.id)){
			
			nameMap.set(socket.id, name);
			console.log(socket.id + ' is now called: ' + name);
			socket.emit('name_approved', name);
		
		// Om namnet redan är taget
		}else{
			console.log(socket.id + ' did not get the name: ' + name);
			socket.emit('alert', 'The name: ' + name + ' is already taken. Please choose another name');
		}
      }
    );
	
	
	//  --- Trying to create a room ---
    socket.on('create_room',
      function(roomName) {
		roomName = roomName.toUpperCase();
        console.log(getName(socket.id) + ' tries to create the room: ' + roomName);
		
		//Om rummet inte redan är skapat
		if (!roomMap.has(roomName)) {
			
			//Om användaren inte är med i något rum (utöver sitt egna)
			if (!(Object.keys(socket.rooms).length > 1)){
				//Skapa rummet och lägg till personen på rätt ställe
				socket.join(roomName);
				roomMap.set(roomName, [socket.id]);
				console.log(getName(socket.id) + ' successfully created room: ' + roomName);
				socket.emit('alert', 'The room: ' + roomName + ' is yours');
				socket.emit('join_room_approved', roomName);
			//Om användaren redan är i ett rum
			}else{
				socket.emit('alert', 'You are already in a room, named ' + Object.keys(socket.rooms)[1]);
				console.log(getName(socket.id) + ' failed to create room: ' + roomName + ' since ' + getName(socket.id) + ' is already in a room ');	
			}
			
		//Om rummet redan är skapat
		}else{
			console.log(getName(socket.id) + ' failed to create room: ' + roomName + ' since it already existed');		
			socket.emit('alert', 'The room: ' + roomName + ' already exists. Please choose another name');
		}
      }
    );
	

	//  --- Trying to join a room ---
    socket.on('join_room',
		function(roomName) {
			roomName = roomName.toUpperCase();
			console.log(getName(socket.id) + ' tries to join the room: ' + roomName);
			console.log(roomMap);
			console.log("-----");
			//Kolla om rummet finns
			if (roomMap.has(roomName)) {
				//Kolla om rummet har en eller två spelare i sig.
				var numClients = io.sockets.adapter.rooms[roomName].length;
				console.log(numClients);
				if (numClients < 2) {
					//Om användaren inte är med i något rum (utöver sitt egna)
					if (!(Object.keys(socket.rooms).length > 1)){
						socket.join(roomName);
						roomMap.set(roomName, [socket.id, roomMap.get(roomName)[0]]); //Lägger ihop den gamla entrien med den nya spelaren
						socket.emit('alert', "Sucessfully joined the room " + roomName);
						console.log("Room sucessfully joined");
						socket.emit('join_room_approved', roomName);
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




    socket.on('disconnect', function() {
      console.log("Client has disconnected");
	  //KOM IHÅG ATT TA BORT FRÅN NAMEMAP OCH ROOMMAP
    });
  }
  
// ----------------------------------------------------------------------------
// ----------------------------- F U N K T I O N E R --------------------------
// ----------------------------------------------------------------------------

// Funktion för att hämnta det spelarnamn som hör till en socket.
// Om ID:t har ett namn associerat med sig, returnera det. Annars returnera ID
function getName(id){
	if(nameMap.has(id)){
		return nameMap.get(id);
	}else{
		return id;
	}
}
  