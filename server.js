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

function newConnection(socket) {

    console.log("Ny klient ansluten: " + socket.id);

	
	//  --- Försöker få ett namn ---
    socket.on('get_name',
      function(name) {
        console.log(getName(socket.id) + ' tries to get the name: ' + name);
		
		// Om namnet inte redan är taget
		if (!nameMap.has(name)){
			nameMap.set(name, socket.id);
			console.log(socket.id + ' is now called: ' + name);
			socket.broadcast.to(socket.id).emit('get_name_approved', name);
		
		// Om namnet redan är taget
		}else{
			console.log(getName(socket.id) + ' did not get the name: ' + name);
			socket.broadcast.to(socket.id).emit('get_name_denied', name);
		}
      }
    );
	
	
	//  --- Trying to create a room ---
    socket.on('create_room',
      function(roomName) {
        console.log(getName(socket.id) + ' tries to create the room: ' + roomName);
		//Om rummet inte redan är skapat
		if (!roomMap.has(roomName)) {
			//Skapa rummet och lägg till personen på rätt ställe
			socket.join(roomName);
			roomMap.set(roomName, [socket.id]);
			console.log(getName(socket.id) + ' successfully created room: ' + roomName);
			socket.broadcast.to(socket.id).emit('create_room_approved', {roomName: roomName});
		}else{
			console.log(getName(socket.id) + ' failed to create room: ' + roomName + ' since it already existed');		
			io.emit('alert', roomName);
		}
      }
    );
	

	//  --- Trying to join a room ---
    socket.on('joinroom',
      function(roomName) {
        console.log(getName(socket.id) + ' tries to join the room: ' + roomName);
		//Kolla om rummet finns
			//Kolla om rummet har en eller två spelare i sig.
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
  