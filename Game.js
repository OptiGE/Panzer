module.exports = class Game {
	
	constructor(room, p1_id, p2_id, current_player){
		this.room = room;
		this.players = [{id: p1_id, health: 3, pos: 1, sequence: [], animation: []}, {id: p2_id, health: 3, pos: 1, sequence: [], animation: []}]
		this.current_player = current_player; //true = p1, false = p2
		this.open_door = 4; // 4 = undefined
		this.game_state = 'pre_game'; //pre_game, picking_door, choosing_sequence, animation_playing, game_over
	}
	
	getCurrentPlayer(){
		return this.players[this.current_player];
	}
	
	getPlayerFromID(id){
		if (this.players[0].id == id){
			return this.players[0]; 
		}else if(this.players[1].id == id){
			return this.players[1];
		}else{
			return undefined;
		}
	}
	
	other(player){
		if(player.id == this.players[0].id){
			//Om spelaren är P1
			return this.players[1];
		}else if(player.id == this.players[1].id){
			//Om spelaren är P2
			return this.players[0];
		}else{
			console.log("VARNING! - Other(player) fick en felaktig spelare: " + player + " - VARNING");
			return undefined;
		}
	}
	
	isAtOpenDoor(player){
		if(player.id == this.players[0].id){
			//Om spelaren är P1
			return (player.pos == this.open_door)
		}else if(player.id == this.players[1].id){
			//Om spelaren är P2
			return (2 - player.pos == this.open_door)
		}else{
			console.log("VARNING! - isAtOpenDoor(player) fick en felaktig spelare: " + player + " - VARNING");
			return undefined;
		}
	}
	
	nextPlayer(){
		this.current_player = this.other(current_player);
	}
	
	controlledSequence(sequence){
		
		console.log(sequence.length + "-----");
		
		if(sequence.length != 3){
			console.log("VARNING! - En sekvens hade fel längd - VARNING!");
			return [2, 2, 2];

		}
		
		var newSequence = [];
		var numOfFires = 0;
		
		for(let i = 0; i < 3; i++) {
			
			//Om tom, fyll den med ett stopp
			if(sequence[i] == 0){
				newSequence.push(2);
			
			//Om eld
			}else if(sequence[i] == 5){
				//Kolla om vi är sist i ledet
				if(i == 2){
					newSequence.push(5);
					numOfFires ++;
				//Annars, kolla så att den har ett stopp efter sig
				}else if(sequence[i + 1] == 1 || sequence[i + 1] == 2){
					newSequence.push(5);
					numOfFires ++;
				//Någon har fuskat in en massa eld
				}else{
					return([2, 2, 2]); //Rensa och stoppa dem
					console.log("VARNING! --- Någon har fuckat runt med sin sekvens --- VARNING!");
				}
			//Om det inte var varken tom eller eld, bara knuffa in den
			}else{
				newSequence.push(sequence[i]);
			}
			
		}
		
		if(numOfFires > 1){
			console.log("VARNING! --- Någon har fuckat runt med sin sekvens --- VARNING!");
			return([2, 2, 2]); //Rensa och stoppa dem
		}
		
		return newSequence;

	}
	
	
	
		
	
	//Både räknar ut vad som händer i spelet och fyller player.animation med det den skall visa
	execSequence(){
		
		if(this.players[0].sequence.length != 3 || this.players[1].sequence.length != 3){
			console.log("Both players do not have a sequence yet!");
		}
		
		//Töm bådas animationer
		this.players[0].animation = [];
		this.players[1].animation = [];
		
		
		//Gå igenom de tre movesen vardera klient har valt
		for(let i = 0; i < 3; i++){
			//Bestämmer om p1 eller p2 prioriteras
			if (this.current_player == 0){
				this.execMove(this.players[0].sequence[i], this.players[0]);
				this.execMove(this.players[1].sequence[i], this.players[1]);
			}else{                            
				this.execMove(this.players[1].sequence[i], this.players[1]);
				this.execMove(this.players[0].sequence[i], this.players[0]);
			}
		}
	}
	
	execMove(move, player){
		
		switch(move) {
			
			//Stop_lock
			case 1:
				player.animation.push([player, 'stay']);
				break;
			
			//Stop
			case 2:
				player.animation.push([player, 'stay']);
				break;
					
			//Left	
			case 3:
				if (player.pos > 0){
					
					//Om man är vid en öppen dörr
					if(isAtOpenDoor(player)){
						this.other(player).animation.push([player, 'move_out_to_right']);
					}
					
					//Flytta spelaren
					player.pos --;
					player.animation.push([player, 'move_left']);
					
					//Om man kom till en öppen dörr
					if(isAtOpenDoor(player)){
						this.other(player).animation.push([player, 'move_in_from_left']);
					}
					
					
				}else{
					player.animation.push([player, 'move_left_fail']);
				}
				break;
				
			//Right
			case 4:
				if (player.pos < 2){
					
					//Om man är vid en öppen dörr
					if(this.isAtOpenDoor(player)){
						this.other(player).animation.push([player, 'move_out_to_left']);
					}
					
					//Flytta spelaren
					player.pos --;
					player.animation.push([player, 'move_left']);
					
					//Om man kom till en öppen dörr
					if(this.isAtOpenDoor(player)){
						this.other(player).animation.push([player, 'move_in_from_right']);
					}
					
					
				}else{
					player.animation.push([player, 'move_right_fail']);
				}
				break;

			//Fire          (hela det här caset går att strukturera om mycket snyggare med färre satser)
			case 5:
				if (player.pos + this.other(player).pos == 2){ //Om de står mittemot varandra
					if (this.open_door == this.players[0].pos){ //Om dörren är öppen (baseras på p1)
						this.other(player).health --;
						player.animation.push([player, 'fire']); //Du ska se eld ur egen kanon
						this.other(player).animation.push([player, 'fire']); //Motståndaren skall se eld ur din kanon
						player.animation.push([this.other(player), 'hit']); //Du skall se motståndaren bli träffad
						this.other(player).animation.push([this.other(player), 'hit']); //Motståndaren skall se sig själv bli träffad
					}else{
						player.animation.push([player, 'fire_miss']);
					}
				}else{
					//Om de inte står mitt emot varandra, men den som skjuter står vid en öppen dörr
					if (this.open_door == this.players[0].pos){
						this.other(player).health --;
						player.animation.push([player, 'fire']); //Du ska se eld ur egen kanon
						this.other(player).animation.push([player, 'fire']); //Motståndaren skall se eld ur din kanon
					}
					
					player.animation.push([player, 'fire_miss']);
				}
				break;
							
			//Default
			default:
				console.log("Illegal move: " + move);
				break;	
		}
	}

}