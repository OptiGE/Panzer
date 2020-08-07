class Panzer {
	
	constructor(pos, imageArray) {
		this.pos = pos; //Pos avgör vilken dörr pansarvagnen är vid lokalt
		this.element = new Element('panzer', pos, 270, 270, imageArray);
		
		this.speed = cWindowWidth / 200;
		this.animation_queue = [];
		this.target = {x: 0, y: 0};
		this.animation_ready = true;
	}
	
	animate(move){ //Hette tidigare nextMove
		
		//Säkerhetskollar
		if(!this.animation_ready){return;}
		//if(this.animation_queue.length < 1){return;}
		
		var self = this; //Behövs i lägre scopes nedan
		//var next_animation = this.animation_queue.shift(); //shift tar bort och returnerar det äldsta elementet

		switch(move){
			
			//For this player
			case 'move_left':
				if(this.pos > 0){
					this.animation_ready = false;
					this.pos --; //0, 1 eller 2
					this.target.x = doors[this.pos].sprite.position.x; //Target x är vid dörren till vänster
					this.element.sprite.rotation = -90;
					this.element.sprite.setSpeed(this.speed, 180); //Börja rör dig åt vänster
					currentlyMoving.push(self); //Låt spelloopen kolla om du är klar
				}else{
					console.log("Could not move further left");
					return;
				}
				break;
			
			//For this player
			case 'move_right':
				if(this.pos < 2){
					this.animation_ready = false;
					this.pos ++; //0, 1 eller 2
					this.target.x = doors[this.pos].sprite.position.x; //Target x är vid dörren till vänster
					this.element.sprite.rotation = 90;
					this.element.sprite.setSpeed(this.speed, 0); //Börja rör dig åt höger
					currentlyMoving.push(self); //Låt spelloopen kolla om du är klar
				}else{
					console.log("Could not move further right");
					return;
				}
				break;
			
			case 'move_in_from_right': //From right innebär att man rör sig åt vänster
				this.animation_ready = false;

				this.element.sprite.position.x = doors[gameObj.openDoor + 1].sprite.position.x; //Lägg spriten vid dörren ett steg till höger
				this.target.x = doors[gameObj.openDoor].sprite.position.x; //Target x är vid dörren till vänster
				
				this.element.sprite.rotation = 90;
				this.element.sprite.setSpeed(this.speed, 180); //Börja rör dig åt vänster
				currentlyMoving.push(self); //Låt spelloopen kolla om du är klar
				break;
			
			case 'move_in_from_left': //From right innebär att man rör sig åt vänster
				this.animation_ready = false;

				this.element.sprite.position.x = doors[gameObj.openDoor - 1].sprite.position.x; //Lägg spriten vid dörren ett steg till vänster
				this.target.x = doors[gameObj.openDoor].sprite.position.x; //Target x är vid dörren till höger
				
				this.element.sprite.rotation = 90;
				this.element.sprite.setSpeed(this.speed, 0); //Börja rör dig åt höger
				currentlyMoving.push(self); //Låt spelloopen kolla om du är klar
				break;
				
			case 'move_out_to_right':
				this.animation_ready = false;

				this.element.sprite.position.x = doors[gameObj.openDoor].sprite.position.x; //Lägg spriten vid dörren
				this.target.x = doors[gameObj.openDoor + 1].sprite.position.x; //Target x är vid dörren till höger
				
				this.element.sprite.rotation = 90;
				this.element.sprite.setSpeed(this.speed, 0); //Börja rör dig åt höger
				currentlyMoving.push(self); //Låt spelloopen kolla om du är klar
				break;
			
			case 'move_out_to_left':
				this.animation_ready = false;

				this.element.sprite.position.x = doors[gameObj.openDoor].sprite.position.x; //Lägg spriten vid dörren
				this.target.x = doors[gameObj.openDoor - 1].sprite.position.x; //Target x är vid dörren till vänster
				
				this.element.sprite.rotation = 90;
				this.element.sprite.setSpeed(this.speed, 180); //Börja rör dig åt vänster
				currentlyMoving.push(self); //Låt spelloopen kolla om du är klar
				break;
				
			case 'hit':
				console.log("PANG I PLANETEN");
				this.animation_ready = false;
				this.element.sprite.animation.changeFrame(2); //Träffad-bilden
				
				setTimeout(function(sprite) {
					sprite.animation.changeFrame(0);
					self.animation_ready = true;
					global_animation_running = false;
				}, 500, this.element.sprite);
				break;

			case 'fire':
				this.animation_ready = false;
				this.element.sprite.animation.changeFrame(1);
				
				setTimeout(function(sprite) {
					sprite.animation.changeFrame(0);
					self.animation_ready = true;
					global_animation_running = false;
				}, 500, this.element.sprite);
				break;
				
				
				
			case 'wait':
				this.animation_ready = false;
				
				setTimeout(function() {
					self.animation_ready = true;
					global_animation_running = false;
				}, 1500);
				break;
				
			default:
				console.log("Invalid animation input: " + move);
		}
		
	}
	
	stopMove(){
		this.element.sprite.setSpeed(0, 0); //Stanna den
		this.element.sprite.position.x = this.target.x; //Sätt den på exakt rätt plats
		this.element.sprite.rotation = 0;
		this.animation_ready = true; //Redo för nästa animation
		global_animation_running = false;
		//tas ut ur CurrentlyMoving i draw() i sketch.js, eftersom den då ändå har index till this.
	}
	
	skipRight() {
		this.element.sprite.position.x = this.element.sprite.position.x + (door_2.sprite.position.x - door_1.sprite.position.x);
	}
	
	skipLeft() {
		this.element.sprite.position.x = this.element.sprite.position.x - (door_2.sprite.position.x - door_1.sprite.position.x);
	}
}