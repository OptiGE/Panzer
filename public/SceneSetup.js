class SceneSetup{
	
	//-------------------------------------------------------------------------------------------------
	//-------------------------------------- L O G I N   S C E N E ------------------------------------
	//-------------------------------------------------------------------------------------------------
	
	static loginScene(){
		
		current_scene = 'login_scene';
		
		//Bakgrund
		image(bg, 0, 0, windowWidth, windowHeight);
		
		//Skapa Create room knapp
		btn_login = new Element('stdButton', 0, 600, 200, ['assets/btn_login_up.png', 'assets/btn_login_p.png']);
		
		
		//Knapp-event hanterare
		btn_login.sprite.onMousePressed = function() {
			if(buttons_clickable){
				$('#loginModal').modal('toggle');
				console.log("Showing login modal");
				btn_login.sprite.animation.changeFrame(1);
				buttons_clickable = false;
			}
		};
	}


	//-------------------------------------------------------------------------------------------------
	//-------------------------------------- R O O M   S C E N E ------------------------------------
	//-------------------------------------------------------------------------------------------------



	static roomScene(name){
		
		current_scene = 'room_scene';
		
		image(bg, 0, 0, windowWidth, windowHeight);
		
		//Sätt spelarens namn som titel
		fill(30, 30, 30);
		text(name, windowWidth / 2, windowHeight / 3.5); //Center aligned text
		
		//Skapa knappar
		btn_joinroom = new Element('stdButton', 0, 600, 200, ['assets/btn_joinroom_up.png', 'assets/btn_joinroom_p.png']);
		btn_createroom = new Element('stdButton', 1, 600, 200, ['assets/btn_createroom_up.png', 'assets/btn_createroom_p.png']);
		
		
		//Knapp-event hanterare
		btn_joinroom.sprite.onMousePressed = function() {
			if(buttons_clickable){
				$('#joinRoomModal').modal('toggle');
				console.log("Showing join room modal");
				btn_joinroom.sprite.animation.changeFrame(1);
				buttons_clickable = false;
			}
		};
		
		btn_createroom.sprite.onMousePressed = function() {
			if(buttons_clickable){
				$('#createRoomModal').modal('toggle');
				console.log("Showing create room modal");
				btn_createroom.sprite.animation.changeFrame(1);
				buttons_clickable = false;
			}
		};
		
	}


	//-------------------------------------------------------------------------------------------------
	//-------------------------------------- G A M E   S C E N E ------------------------------------
	//-------------------------------------------------------------------------------------------------

	static gameScene(roomName, p1_nick){
		
		current_scene = 'game_scene';
		
		//Bakgrund
		bg = new Element('background', 0, 800, 600, ['assets/sky.png']); //image(bg, 0, 0, windowWidth, windowHeight);
		
		//Nya regler för text, inte som de som skapades i setup()
		textSize(min((windowHeight / 25), (windowWidth / 15)));
		fill(30, 30, 30);
		
		//Skapa action-knappar
		btn_stop = new Element('actionButton', -18, 200, 200, ['assets/btn_stop_up.png', 'assets/btn_stop_p.png', 'assets/btn_stoplock_p.png']);
		btn_left = new Element('actionButton', -6, 200, 200, ['assets/btn_left_up.png', 'assets/btn_left_p.png', 'assets/btn_leftlock_p.png']);
		btn_right = new Element('actionButton', 6, 200, 200, ['assets/btn_right_up.png', 'assets/btn_right_p.png', 'assets/btn_rightlock_p.png']);
		btn_fire = new Element('actionButton', 18, 200, 200, ['assets/btn_fire_up.png', 'assets/btn_fire_p.png', 'assets/btn_firelock_p.png']);
		
		//Skapa actionfield
		actionfield = new Element('actionField', 0, 1000, 300, ['assets/actionfield.png']);
		
		//Skapa actionslots
		slot_1 = new Element('actionSlot', -1, 200, 200, ['assets/btn_null.png', 'assets/btn_stopcock_up.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png']);
		slot_2 = new Element('actionSlot', 0, 200, 200, ['assets/btn_null.png', 'assets/btn_stopcock_up.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png']);
		slot_3 = new Element('actionSlot', 1, 200, 200, ['assets/btn_null.png', 'assets/btn_stopcock_up.png', 'assets/btn_stop_up.png', 'assets/btn_left_up.png', 'assets/btn_right_up.png', 'assets/btn_fire_up.png']);
		
		//Heart fields
		field_1 = new Element('heartField', 0, 200, 200, ['assets/heart_field.png']);
		field_2 = new Element('heartField', 1, 200, 200, ['assets/heart_field.png']);
		
		//Doors ÄNDRA STORLEK PÅ SPRITES FÖR HITBOX
		door_1 = new Element('doorButton', -15, 200, 200, ['assets/door_closed.png', 'assets/door_charged.png']);
		door_2 = new Element('doorButton', 0, 200, 200, ['assets/door_closed.png', 'assets/door_charged.png']);
		door_3 = new Element('doorButton', 15, 200, 200, ['assets/door_closed.png', 'assets/door_charged.png']);
		doors = [door_1, door_2, door_3];
		
		//Hjärtan
		hearts_p1 = [];
		hearts_p2 = [];
		
		let i;
		for (i = 1; i <= 3; i++) {
			hearts_p1.push(new Element('heart', i, 150, 150, ['assets/heart.png', 'assets/btn_null.png']))
			hearts_p2.push(new Element('heart', -i, 150, 150, ['assets/heart.png', 'assets/btn_null.png']))
		}
		
		//Launch-knapp
		btn_launch = new Element('launchButton', 0, 200, 200, ['assets/btn_fire_up.png', 'assets/btn_fire_p.png']);
		
		//Panzer
		p1 = new Panzer(0, 'assets/tank.png', 'assets/tank_fire.png');
		p2 = new Panzer(2, 'assets/tank2.png', 'assets/tank2_fire.png');
		p2.element.sprite.position.y -= (p2.element.sprite.scale * 220); //Flytta upp P2 så den ligger högre upp på skärmen
		
		//Actionfield-variabler
		slotArray = [slot_1, slot_2, slot_3];
		actionArray = [0, 0, 0];
		
		//Knapp-event hanterare
		btn_stop.sprite.onMousePressed = EventHandler.ActionHandler(2, btn_stop);
		btn_left.sprite.onMousePressed = EventHandler.ActionHandler(3, btn_left);
		btn_right.sprite.onMousePressed = EventHandler.ActionHandler(4, btn_right);
		btn_fire.sprite.onMousePressed = EventHandler.FireActionHandler(); //Denna är unik, så inga argument behövs

		slot_1.sprite.onMousePressed = EventHandler.SlotHandler(0);
		slot_2.sprite.onMousePressed = EventHandler.SlotHandler(1);
		slot_3.sprite.onMousePressed = EventHandler.SlotHandler(2);
		
		door_1.sprite.onMousePressed = EventHandler.DoorHandler(0, door_1);
		door_2.sprite.onMousePressed = EventHandler.DoorHandler(1, door_2);
		door_2.sprite.debug = true;
		door_3.sprite.onMousePressed = EventHandler.DoorHandler(2, door_3);
		
		p2.element.sprite.depth = door_1.sprite.depth - 1;
		p2.element.sprite.debug = true;
		
		btn_launch.sprite.onMousePressed = EventHandler.LaunchHandler();
		
		
		
		p2.animate("move_in_from_right");
		p1.animate("move_in_from_left");
		
		
		
	}
}