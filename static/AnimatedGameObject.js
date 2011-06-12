	//Displays an animated Game Object
function AnimatedGameObject()
{
	this.playing = false;
	this.indexLoop = 0;
	this.currentFrame = 0;
		this.timeBetweenFrames = 0;
		this.timeSinceLastFrame = 0;
		
	this.seq = [1, 3, 3, 1, 0, 2, 3, 3, 2, 0];

	this.startupAnimatedGameObject = function(pos, fps){

		this.pos = pos;
		this.timeBetweenFrames = fps;
		this.timeSinceLastFrame = this.timeBetweenFrames;
		
		this.startupGameObject(this.pos);
		return this;
	};
	
		//Draws the currect segment of the imagestrip - NOTE: img.height = width
	this.draw = function( dt, context, img, index, loop){
		var pos = __GAME.level.mapToScreen(this.pos.x, this.pos.y);	
		var sourceX = img.height * this.currentFrame;
		context.drawImage(img, sourceX, 0, img.height, img.height, pos.x, pos.y, img.height, img.height);

		this.timeSinceLastFrame -= dt;
		if (this.timeSinceLastFrame <= 0){
			this.timeSinceLastFrame = this.timeBetweenFrames;
			if(loop === false){
				this.playing = true;
				this.indexLoop = Math.min(this.indexLoop, index.length-1);
				if(this.indexLoop >= index.length-1){
					this.playing = false;
				}
			}
			else{
				this.indexLoop %= index.length;
			}
			this.currentFrame = index[this.indexLoop];
			++this.indexLoop;
		}
		//this.log2();
	};
	
	this.log2 = function(){
		//console.log("I am hilarious! And I play animations Boogers");
		console.log("Currently playing?? :" + this.playing);
		//console.log("indexLoop = " + this.indexLoop);
		//console.log("Current Frame		 :" + this.currentFrame);
	};
}

AnimatedGameObject.prototype = new GameObject();