	//The base class for all elements that appear in the game.
function GameObject(){
	
	this.zOrder = 0;	//Display depth order. A smaller zOrder means the element is rendered first in BG
	
	this.pos = new vec2(0.0, 0.0);
	this.vec = new vec2(0.0, 0.0);
	this.siz = new vec2(1.0, 1.0);
	
		//Initialises the object, and adds it to the list of objects held by the GameObjectManager.
	this.startupGameObject = function(vec2){  
		this.pos = vec2;
			console.log("GAMEOBJECT pushing : " + this);
		return this;
	};

	this.update = function(level)		{	return;		};
	this.draw	= function(context, img){	return;		};
	
	this.move = function(level){
		var vec = this.vec;
		var siz = this.siz;
		var retval = "NONE";
		
		if(vec.x > 0.0){
				//We're moving to the right, create a bounding box in the area we're moving through.
			var collpos = new vec2(this.pos.x + siz.x, this.pos.y);
			var collsiz = new vec2(vec.x, siz.y);
			var hitSTAT	= __GAME.level.collide(collpos, collsiz, "RIGHT");	//return object with .hit + .pos
			
			if(hitSTAT.hit === true){retval = "RIGHT";}
			this.pos.x = hitSTAT.pos - siz.x;
			__DEBUGposA = collsiz;
		}
		else{
				//We're moving to the left, create a bounding box in the area we're moving through.
			var collpos = new vec2(this.pos.x + vec.x, this.pos.y);
			var collsiz = new vec2(-vec.x, siz.y);
			var hitSTAT	= __GAME.level.collide(collpos, collsiz, "LEFT");	//return object with .hit + .pos
			
			if(hitSTAT.hit === true){retval = "LEFT";}
			this.pos.x = hitSTAT.pos;
			__DEBUGposA = collsiz;
		}
		if(vec.y > 0.0){
				//We're moving down, create a bounding box in the area we're moving through.
			var collpos = new vec2(this.pos.x + vec.x, this.pos.y + siz.y);
			var collsiz = new vec2(siz.x, vec.y);
			var hitSTAT	= __GAME.level.collide(collpos, collsiz, "DOWN");	//return object with .hit + .pos
			
			if(hitSTAT.hit === true){retval = "DOWN";}
			this.pos.y = hitSTAT.pos - siz.y;
			__DEBUGposA = collsiz;
		}
		else{
				//We're moving up, create a bounding box in the area we're moving through.
			var collpos = new vec2(this.pos.x, this.pos.y + vec.y);
			var collsiz = new vec2(siz.x, -vec.y);
			var hitSTAT	= __GAME.level.collide(collpos, collsiz, "UP");	//return object with .hit + .pos
			
			if(hitSTAT.hit === true){retval = "UP";}
			this.pos.y = hitSTAT.pos;
			__DEBUGposA = collsiz;
		}
		return retval;
	};
}