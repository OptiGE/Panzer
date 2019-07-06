class EventHandler{
	
	static ActionHandler(action, btn) {
		return function() {
			if(buttons_clickable && all_buttons_up && actionArray.includes(0) && gameState == 2){
				btn.sprite.animation.changeFrame(1);
				buttons_clickable = false;
				all_buttons_up = false;
				if (actionArray.includes(0)) {
					actionChosen(action);
					//p1.moveLeft(); //updateHealth(); //test
				}
			}else if (!buttons_clickable && all_buttons_up || !actionArray.includes(0) && all_buttons_up) { //fortsätt
				btn.sprite.animation.changeFrame(2);
				all_buttons_up = false;
			
			}else {
				
			}
		}
	}

	static FireActionHandler() {
		return function(){
			if(buttons_clickable && all_buttons_up && actionArray.includes(0) && gameState == 2){
				btn_fire.sprite.animation.changeFrame(1);
				buttons_clickable = false;
				all_buttons_up = false;
				if (actionArray[actionArray.findIndex(k => k == 0) + 1] > 2 || actionArray.includes(5)) { //Nästa objekt i listan är inte stopp || Det finns redan eld
					btn_fire.sprite.animation.changeFrame(2);
					all_buttons_up = false;
				} else if (actionArray.includes(0)) {
					if (actionArray.findIndex(k => k == 0) + 1 < 3){ //Om stoppet efter elden hamnar inom arrayen
						actionArray[actionArray.findIndex(k => k == 0) + 1] = 0; //Töm platsen efteråt också
					}
					actionChosen(5); //Lägg till en eld
					actionChosen(1); //Lägg ett stopp där
				}
			}else if (all_buttons_up && (!buttons_clickable || !actionArray.includes(0))){ //Om man antingen inte får trycka på knappar, eller inget mer kan läggas till
				btn_fire.sprite.animation.changeFrame(2); //Röd knapp
				all_buttons_up = false;
				
			}else {
				
			}
		}
	}

	static SlotHandler(slot){
		return function(){
			if (buttons_clickable && actionArray[slot] != 1) { //Buttonsclickable && man tryckte inte på en grå
			  
				if (actionArray[slot] == 5 && slot != 2){ //Tryckte på eld som inte är sist i listan
					console.log("I'm in");
					slotArray[slot + 1].sprite.animation.changeFrame(0);
					actionArray[slot + 1] = 0;
				}
				
				//Detta görs alltid
				buttons_clickable = false;
				all_buttons_up = false;
				slotArray[slot].sprite.animation.changeFrame(0);
				actionArray[slot] = 0;
				
			}
		}		   
	}
	
	static DoorHandler(doorNr, door){
		return function(){
			console.log("Dörr nedtryckt");
			if (buttons_clickable && all_buttons_up && gameObj.current_player == 0 && gameState == 1){
				deselectDoors();
				door.sprite.animation.changeFrame(1); //Gör dörren grön
				buttons_clickable = false;
				all_buttons_up = false;
				chosenDoorNr = doorNr;
			}
		}
	}
	
	static LaunchHandler(){
		return function(){
			
			console.log("Launchbutton nedtryckt i gameState: " + gameState);
			
			switch(gameState){
				
				case 0:
					break;
				
				case 1:
					// Om det är ens tur och knappar är klickbara
					if (buttons_clickable && all_buttons_up && gameObj.current_player == 0){
						btn_launch.sprite.animation.changeFrame(1);
						buttons_clickable = false;
						all_buttons_up = false;
						launchSequence();
						if (chosenDoorNr != -1){ //Om en dörr är vald
							sendRQ(3);
							deselectDoors();
						}
					//	
					}else if (!buttons_clickable && all_buttons_up) {
						btn_launch.sprite.animation.changeFrame(2);
						buttons_clickable = false;
						all_buttons_up = false;
					}
					break;
					
				case 2:
					
					if (buttons_clickable && all_buttons_up){
						btn_launch.sprite.animation.changeFrame(1);
						buttons_clickable = false;
						all_buttons_up = false;
						//Skicka sekvensen till servern!
						socket.emit('sequence_chosen', actionArray);
						alert('Sequence sent to server. Now resetting...');
						for(i = 0; i < 3; i ++){
							slotArray[i].sprite.animation.changeFrame(0);
							actionArray[i] = 0;
						}
					}
					
				
					break;
					
				case 3:
					break;
				
			}
		}
	}

}


