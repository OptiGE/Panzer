module.exports = class Game {
	
	constructor(room, p1_id, p2_id, current_player){
		this.room = room;
		this.players = [{id: p1_id, health: 3, pos: 1, sequence: [], animation: []}, {id: p2_id, health: 3, pos: 1, sequence: [], animation: []}]
		this.current_player = current_player; //true = p1, false = p2
		this.open_door = 2; // 4 = undefined
		//this.animation_sequence = [];
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
	
	controlledSequence(sequence){
		
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
	
	other(player){
		return player ? 0 : 1;
	}
	
	nextPlayer(){
		this.current_player = this.other(current_player);
	}	
	
	//Både räknar ut vad som händer i spelet och fyller player.animation med det den skall visa
	execSequence(){
		
		if(this.players[0].seq.length != 3 || this.players[1].seq.length != 3){
			console.log("Both players do not have a sequence yet!");
		}
		
		//Töm bådas animationer
		this.players[0].animation = [];
		this.players[1].animation = [];
		
		
		//Gå igenom de tre movesen vardera klient har valt
		for(let i = 0; i < 3; i++){
			//Bestämmer om p1 eller p2 prioriteras
			if (this.current_player == 0){
				this.execMove(this.players[0].seq[i], 0);
				this.execMove(this.players[1].seq[i], 1);
			}else{                   
				this.execMove(this.players[1].seq[i], 1);
				this.execMove(this.players[0].seq, 0);
			}
		}
	}
	
	execMove(move, player){
		
		switch(move) {
			
			//Stop_lock
			case 1:
				//this.animation_sequence.push([player, 'stay']);
				break;
			
			//Stop
			case 2:
				//this.animation_sequence.push([player, 'stay']);
				break;
					
			//Left	
			case 3:
				if (this.players[player].pos > 0){
					this.players[player].pos --;
					//this.animation_sequence.push([player, 'move_left']);
				}else{
					//this.animation_sequence.push([player, 'move_left_fail']);
				}
				break;
				
			//Right
			case 4:
				if (this.players[player].pos < 2){
					this.players[player].pos ++;
					this.animation_sequence.push([player, 'move_right']);
				}else{
					this.animation_sequence.push([player, 'move_right_fail']);
				}
				break;

			//Fire
			case 5:
				if (this.players[player].pos + this.players[this.other(player)].pos == 2){ //Om de står mittemot varandra
					if (this.open_door == this.players[0].pos){ //Om dörren är öppen (baseras på p1)
						this.players[this.other(player)].health --;
						this.animation_sequence.push([player, 'fire_hit']);
					}else{
						this.animation_sequence.push([player, 'fire_miss1']);
					}
				}else{
					this.animation_sequence.push([player, 'fire_miss2']);
				}
				break;
							
			//Default
			default:
				console.log("Illegal move: " + move);
				break;	
		}
	}

}