class Panzer {
	
	constructor(pos, img1, img2) {
		this.pos = pos; //Pos avgör vilken dörr pansarvagnen är vid lokalt
		this.img1 = img1;
		this.img2 = img2;
		this.element = new Element('panzer', pos, 270, 270, [img1, img2]);
		
		this.animation_queue = [];
		this.target = {x: 0, y: 0};
		this.animation_ready = true;
	}
	
	nextMove(){
		
		//Säkerhetskollar
		if(!this.animation_ready){return;}
		if(this.animation_queue.length < 1){return;}
		
		var self = this; //Behövs i lägre scopes nedan
		var next_animation = this.animation_queue.shift(); //shift tar bort och returnerar det äldsta elementet

		switch(next_animation){
			
			case 'move_left':
				if(this.pos > 0){
					this.animation_ready = false;
					this.pos --;
					this.target.x = doors[this.pos].sprite.position.x; //Target x är vid dörren till vänster
					this.element.sprite.rotation = -90;
					this.element.sprite.setSpeed(5, 180); //Börja rör dig åt vänster
					currentlyMoving.push(self); //Låt spelloopen kolla om du är klar
				}else{
					console.log("Could not move further left");
					return;
				}
				break;
				
			case 'move_right':
				if(this.pos < 2){
					this.animation_ready = false;
					this.pos ++;
					this.target.x = doors[this.pos].sprite.position.x; //Target x är vid dörren till vänster
					this.element.sprite.rotation = 90;
					this.element.sprite.setSpeed(5, 0); //Börja rör dig åt höger
					currentlyMoving.push(self); //Låt spelloopen kolla om du är klar
				}else{
					console.log("Could not move further right");
					return;
				}
				break;
				
			case 'fire':
				this.animation_ready = false;
				this.element.sprite.animation.changeFrame(1);
				
				setTimeout(function(elem) {
				elem.animation.changeFrame(0);
				self.animation_ready = true;
				self.nextMove();
				}, 300, this.element.sprite);
				break;
				
			case 'wait':
				this.animation_ready = false;
				
				setTimeout(function() {
				self.animation_ready = true;
				self.nextMove();
				}, 1500);
				break;
				
			default:
				console.log("Invalid animation input: " + next_animation);
		}
		
	}
	
	stopMove(){
		this.element.sprite.setSpeed(0, 0); //Stanna den
		this.element.sprite.x = this.target.x; //Sätt den på exakt rätt plats
		this.element.sprite.rotation = 0;
		this.animation_ready = true; //Redo för nästa animation
		//tas ut ur CurrentlyMoving i draw() i sketch.js, eftersom den då ändå har index till this.
	}
	
	skipRight() {
		this.element.sprite.position.x = this.element.sprite.position.x + (door_2.sprite.position.x - door_1.sprite.position.x);
	}
	
	skipLeft() {
		this.element.sprite.position.x = this.element.sprite.position.x - (door_2.sprite.position.x - door_1.sprite.position.x);
	}
}