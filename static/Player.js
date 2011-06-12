	//A class to represent the player on the screen
function Player(){
	this._JUMP		= 0.35;		// The initial velocity of the player when they jump.
	this._GRAVITY	= 0.02;	// Gravitation pull applied to the player.
	this._MAX_SPEED	= 0.20;		// The fastest speed the player can move at.
	this._DECEL		= 0.010;	// The amount the player slows by when not pushing left stick.
	this._ACCEL		= 0.008;	// The amount the player accelerates by.
	
	this.left = false;
	this.right = false;
	this.jump = false;
	this.jumpCount = 0;

	this.STATE		=	{	seq		:null,
							loop	:true,	//will the sequence loop?
							X		:0,		// 0 = facing right, 1 = facing left
							stand	:null,
								duck	:null,
							walk	:null,
							jump	:null,
								jumpD	:null,
								fall	:null,
								drift	:null	
						};
					
	this.seqDATA =	{
						idle	:[	[0,0], null ],								//[arrayFACINGRIGHT, arrayFACINGLEFT]
						run		:[	[1, 3, 3, 1, 0, 2, 3, 3, 2, 0], [10, 8, 8, 10, 11, 9, 8, 8, 9, 11] ],
						jump	:[	[7,8,9,10], null ]	
					};

	this.animPlayer = null;

		//init object
	this.startupPlayer = function(animData){
		this.pos.x = 6;
		this.pos.y = 6;
		//this.seqDATA.run[1] = this.arrayFLIP(this.seqDATA.run[0]);
		this.seqDATA.idle[1] = this.arrayFLIP(this.seqDATA.idle[0]);
		this.seqDATA.jump[1] = this.arrayFLIP(this.seqDATA.jump[0]);
		this.animPlayer = this.startupAnimatedGameObject(this.pos, 0.05);
		return this;
	};
	
	this.arrayFLIP = function(array){
		var arrayReturn = [];
		var num = array.length;
		console.log("arrayFLIP " + num);
		for(var i = 0; i < num; i++){
			arrayReturn.push(parseInt(11-array[i], 10));
		}
		return arrayReturn;
	};
		//updates object
	this.update = function (level, context, animData){
		this.STATE.loop = true;		//by default animations will loop
		this.STATE.seq = this.seqDATA.idle[this.STATE.X];
			//Move the player using the GameObject method Move() and note in which direction we hit a wall.
		var hit = this.move(this.level);
		if((hit == "LEFT")||(hit == "RIGHT")){
			this.vec.x = 0.0;
		}
		if(hit == "UP"){
			this.vec.y = 0.0;
		}
		if(hit == "DOWN"){
			this.vec.y = 0.0;
			this.jumpCount = 0;
		}
			
			//Check for key event to determine move
		if(this.left === true){
			this.STATE.X = 1;
			this.STATE.seq = this.seqDATA.run[this.STATE.X];
			this.vec.x -= (this._ACCEL + this._DECEL);
		}
		if(this.right === true){
			this.STATE.X = 0;
			this.STATE.seq = this.seqDATA.run[this.STATE.X];
			this.vec.x += (this._ACCEL + this._DECEL);
		}
			//Friction decelerates the x vector towards zero
		this.vec.x = this.tendToZero(this.vec.x, this._DECEL);
			//Gravity constantly increases the y vector
		this.vec.y += this._GRAVITY;
		
		if(this.jump === true){
			this.STATE.seq = this.seqDATA.jump[this.STATE.X];
			if(this.vec.y >= this._GRAVITY && this.jumpCount <= 1){
				this.vec.y = -this._JUMP;
				this.jumpCount += 1;
			}
		}
			//draw animation
		if(this.STATE.X === 0){
			this.draw(0.02, context, animData[0].img, this.STATE.seq, this.STATE.loop);
		}
		else{
			this.draw(0.02, context, animData[0].imgF, this.STATE.seq, this.STATE.loop);
		}
	};

	this.keyDown = function(event){
		if (event.keyCode == 37){	this.left = true;	}
		if (event.keyCode == 39){	this.right = true;	}
		if (event.keyCode == 32){	this.jump = true;	}
	};

	this.keyUp = function(event){
		if (event.keyCode == 37){	this.left = false;	}
		if (event.keyCode == 39){	this.right = false;	}
		if (event.keyCode == 32){	this.jump = false;	}
	};
	
	this.tendToZero = function(val, amount){
		if(val > 0.0 && (val -= amount) <0.0) {return 0.0;}
		if(val < 0.0 && (val += amount) >0.0) {return 0.0;}
		return val;
	};
	
	this.log = function(){
		console.log("Player position x: " + this.pos.x + " y: " + this.pos.y);
		console.log("Player velocity x: " + this.vec.x + " y: " + this.vec.y);
	};
}

Player.prototype = new AnimatedGameObject();