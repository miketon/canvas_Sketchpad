var __GAME = null;
var __DEBUG = 0;
var __DEBUGposA = new vec2(39.0, 229.0);

function GameObjectManager(){
	this.resourcesLoaded = false;
	this.FPS			 = 30.0;
	this.FRAMERATE		 = 1.0 / this.FPS;
	this.lastFrame		 = new Date().getTime();

	this.level				= null;
	this.player				= null;
	
	this.animData =			
		[{name: 'runLeft',  src: 'img/RCR_Alex_R.png', img: null, imgF: null}];	//HACK!: imgF = image flipped across X axis
	this.tileData =				
		[{name: 'brick',	src: 'img/brick.png',	img: null},
		 {name: 'runRight', src: 'img/run_right.png', img: null}];

	this.canvas = null;
		this.context2D = null;
		this.canvasSupported = false;			//True if the canvas element is supported, false otherwise

	this.startupGameObjectManager = function(){	
		__GAME = this;									//reference this object
		this.canvas = document.getElementById('canvas');	//ref canvas elements
			//if the this.canvas.getContext function does not exist it is a safe bet that
			//the current browser does not support the canvas element.
		if (this.canvas.getContext){
			this.canvasSupported = true;
			this.context2D = this.canvas.getContext('2d');
				//watch for keyboard events
			document.onkeydown	= function(event){__GAME.keyDown(event);};
			document.onkeyup	= function(event){__GAME.keyUp	(event);};
				//load image Data
			this.loadImage(this.animData);
			this.loadImage(this.tileData);
				//use setInterval to call the draw function
			setInterval(function(){__GAME.draw();}, 20.0); //__GAME.FRAMERATE);
			
			return true; 
		}
		else{
			alert("Current browser doesn't support HTML5 <canvas>.  Suggestion: Try Firefox, Safari, Chrome or Opera.");
			return false;
		}
			   
	};
	
		//The render loop
	this.draw = function (){
		if(this.resourcesLoaded === false){
			var assetTotal = this.animData.length + this.tileData.length;
			var numLoaded = 0;
			for (var i = 0; i < this.animData.length; i += 1){
				if (this.animData[i].img.complete)	{numLoaded += 1;}
			}
			for (var j = 0; j < this.tileData.length; j += 1){
				if (this.tileData[j].img.complete)	{numLoaded += 1;}
			}
			if ( numLoaded == assetTotal){
				this.resourcesLoaded = true;
				//var imgF = this.flipImage(this.animData[0].img);
				var objImage  = new Image();		//The JavaScript Image Object is a property of the document object 
				objImage.src  = 'img/RCR_Alex_L.png'; //imgF;			//.src = URL string of the image to be displayed
				this.animData[0].imgF = objImage;
					//start game
				console.log("!!Resources loaded : " + this.animData[this.animData.length-1].name);  
				this.context2D.fillRect(0, 0, this.canvas.width, this.canvas.height);
				this.level = new Level().startupLevel();				//init level
				this.player = new Player().startupPlayer(this.animData);  
			}
				//handle resources : if not ready draw loading screen
		}
		else{
/*		
				//calculate the time since the last frame
			var thisFrame = new Date().getTime();
			var dt = (thisFrame - this.lastFrame)/1000;
				this.lastFrame = thisFrame;
*/		
				//handle drawing : manage canvas contexts
			this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.context2D.fillStyle   = '#59f'; // blue
			this.context2D.fillRect(0, 0, this.canvas.width, this.canvas.height);
			
			this.player.update(this.level, this.context2D, this.animData);
				//Update the position of the map to center on the player
			this.level.setViewPos(this.player.pos.x, this.player.pos.y);	
			this.level.draw(this.context2D, this.tileData); 
		}
	};

	this.keyDown = function(event){
		this.player.keyDown(event);
	};

	this.keyUp = function(event){
		this.player.keyUp(event);
	};

	this.loadImage = function(imgSOURCE){
		for ( var i = 0; i < imgSOURCE.length; i++ ){
				//create new Image object and add to array
			var objImage  = new Image();				//The JavaScript Image Object is a property of the document object 
			objImage.src  = imgSOURCE[i].src;		//.src = URL string of the image to be displayed
			imgSOURCE[i].img = objImage;
		}
		return true;
	};
	
/* FIREFOX : doesn't seem to work with multiple canvas inits???
	
	this.flipImage = function(img){
		var tempCanvas = document.createElement('canvas');
			tempCanvas.width = img.width;
			tempCanvas.height = img.height;
		var tempContext = tempCanvas.getContext('2d');

			tempContext.translate(img.width-1, 0);
			tempContext.scale(-1,1);
			tempContext.drawImage(img, 0, 0);
			
		return tempCanvas.toDataURL();
	}
*/
}