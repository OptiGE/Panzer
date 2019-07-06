class Element{
	
	
	constructor(type, offset, width, height, imageArray){
		this.type = type;
		this.width = width;
		this.height = height;
		this.imageArray = imageArray;
		
		this.sprite = createSprite(0, 0, width, height);
		this.sprite.addAnimation('standard', ...imageArray);
		this.sprite.animation.playing = false;
		this.sprite.mouseActive = true;
		
		this.placeElement(offset);
	}
	
	
	placeElement(offset){
		switch(this.type) {
		case 'stdButton':
			this.sprite.scale = windowHeight / (7*200); //scale sätts så att knappens höjd om 200 översätts till 1/7 av skärmen
			this.sprite.position.x = windowWidth / 2;
			this.sprite.position.y = ((windowHeight + 100) / 2) + ((offset * 200*this.sprite.scale)*1.3);
			break;
			
		case 'actionField':
			this.sprite.scale = windowHeight / (7*300);
			this.sprite.position.x = ((windowWidth) / 2);
			this.sprite.position.y = windowHeight - (windowHeight - btn_stop.sprite.position.y) - this.sprite.scale*300*1.3;
			break;
			
		case 'actionButton':
			this.sprite.scale = (windowHeight > windowWidth) ? windowWidth / (5*200) : windowHeight / (7*200);
			this.sprite.position.x = (windowWidth / 2) + offset * windowWidth / 50;
			this.sprite.position.y = (windowHeight > windowWidth) ? (windowHeight - (windowWidth*0.14)) : windowHeight*0.88;
			break;
			
		case 'actionSlot':
			this.sprite.scale = actionfield.sprite.scale;
			this.sprite.position.x = (windowWidth / 2) + offset * 1000 * actionfield.sprite.scale / 3;
			this.sprite.position.y = actionfield.sprite.position.y;
			break;
			
		case 'doorButton':
			this.sprite.scale = btn_stop.sprite.scale * 0.7;
			this.sprite.position.x = (windowWidth / 2) + offset * windowWidth / 50;
			this.sprite.position.y = field_1.sprite.position.y + ((actionfield.sprite.position.y - field_1.sprite.position.y)/2)*0.8;
			break;
			
		case 'heartField':
			this.sprite.scale = windowHeight / (7*500);
			this.sprite.position.x = offset ? windowHeight / 25 + (this.sprite.scale * 500 / 2) : windowWidth - (windowHeight / 25 + (this.sprite.scale * 500/2));
			this.sprite.position.y = (windowHeight / 10) + 1.5 * textSize();
			break;
			
		case 'heart':
			this.sprite.scale = field_1.sprite.scale;
			this.sprite.position.x = (offset < 0) ? field_1.sprite.position.x + (offset + 2)*(500*field_1.sprite.scale/4) : field_2.sprite.position.x + (offset - 2)*(500*field_1.sprite.scale/4);
			this.sprite.position.y = field_1.sprite.position.y;
			break;
			
		case 'launchButton':
			this.sprite.scale = btn_stop.sprite.scale;
			this.sprite.position.x = windowWidth - 200*this.sprite.scale;
			this.sprite.position.y = actionfield.sprite.position.y;
			break;
			
		case 'background':
			this.sprite.scale = max((windowHeight / 600), (windowWidth / 800));
			this.sprite.position.x = windowWidth / 2;
			this.sprite.position.y = windowHeight / 2;
			break;
			
		case 'panzer':
			this.sprite.scale = door_1.sprite.scale*2;
			this.sprite.position.x = (windowWidth / 2) + (offset - 1)*(door_2.sprite.position.x - door_1.sprite.position.x);
			this.sprite.position.y = windowHeight / 2;
			break;
			
		default:
			this.sprite.position.x = windowWidth / 2;
			this.sprite.position.y = windowHeight / 2;
		}
	}
	
	

}