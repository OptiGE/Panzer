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
		console.log(socket.id + ' tries to get the name: ' + name);
		if (name.length < 9){
			socket.nickname = name;
			socket.emit('name_approved', name);
			console.log(socket.id + "is now called: " + socket.nickname);
			//Just nu finns inget som kollar om namnet redan finns, eftersom att samma
			//användarnamn på flera sockets inte är ett problem. Annars, skapa bara en map eller ett objekt
		}else{
			socket.emit('alert', 'The name: ' + name + ' is must be 8 characters or less');
			console.log('But the name was too long, at ' + name.length + ' characters');
		}
      }
    );
	
	
	//  --- Trying to create a room ---
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
	

	//  --- Trying to join a room ---
    socket.on('join_room',
		function(roomName) {
			roomName = roomName.toUpperCase();
			console.log(socket.nickname + ' tries to join the room: ' + roomName);
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
						roomMap.set(roomName, [roomMap.get(roomName)[0], socket.id]); //Lägger ihop den gamla entrien med den nya spelaren
						console.log("Room sucessfully joined");
						socket.emit('join_room_approved', { name: roomName, p1_nick: socket.nickname});
						//Skicka joinarens namn till alla som redan är i rummet (bör bara vara 1)
						socket.to(roomName).emit('p2_joined', socket.nickname);
						//Skicka den som redan är i rummets namn till joinaren
						var inRoomSocket = roomMap.get(roomName)[0];
						socket.emit('p2_joined', io.sockets.sockets[inRoomSocket].nickname);
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