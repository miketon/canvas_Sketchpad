	//A class to represent the level
function Level()
{
	this.TILE_SIZE = 64;
	this.CENTER = new vec2(1.0, 1.0);  //Stores which tile should be drawn in center of screen???
	
	this.GRID = [
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
		[1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,1,0,0,0,0,1,1,1,1],
		[1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
		[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,1,1,0,1,1,1,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	];
	
	this.mapWidth  = this.GRID[0].length;
	this.mapHeight = this.GRID.length;

		//Initialises this object
	this.startupLevel = function(){
		return this;
	};
	
	this.draw = function(context, tileDATA){
		var screenOrg = new vec2(0.0, 0.0);
		var screenEnd = new vec2(__GAME.canvas.width, __GAME.canvas.height);
			//Find the tiles at the top-left and bottom-right of the screen
		var tileOrg	  = this.screenToMap(screenOrg.x, screenOrg.y);
		var tileEnd   = this.screenToMap(screenEnd.x, screenEnd.y);
			//Loop through the grid of tiles we know to be on screen
		for(var y = parseInt(tileOrg.y, 10); y <= parseInt(tileEnd.y, 10); y++){
			for(var x = parseInt(tileOrg.x, 10); x <= parseInt(tileEnd.x, 10); x++){
				if(this.getTile(x, y) == 1){
					this.drawTileOnMap(context, tileDATA[0].img, x, y);
				}
			}
		}
	};
	
	this.collide = function(vec2Pos, vec2Siz, dirn){
			//Find the bounding box for the given area as whole tiles
		var minx = parseInt(vec2Pos.x, 10);
		var miny = parseInt(vec2Pos.y, 10);
			var maxxf = (vec2Pos.x + vec2Siz.x);
			var maxyf = (vec2Pos.y + vec2Siz.y);
		var maxx = parseInt(maxxf, 10);
		var maxy = parseInt(maxyf, 10);
		
		if(Math.floor(maxxf) == maxxf)	{maxx--;}
		if(Math.floor(maxyf) == maxyf)	{maxy--;}
										
		var retOBJ = {hit:false, pos:0};	//HACK!!!: Object to return hit detection state and newpos
		
		switch(dirn){
			case "RIGHT":
					//We are traveling right
				retOBJ.pos = vec2Pos.x + vec2Siz.x;
					//Scan through the tiles we're travelling through from left to right	
				for(var x = minx; x <= maxx; x++){
					for(var y = miny; y <= maxy; y++){
						if(this.getTile(x, y) == 1){
							retOBJ.pos = x;
							retOBJ.hit = true;
						}
					}
				}
				return retOBJ;
			case "LEFT":
					//We are traveling left
				retOBJ.pos = vec2Pos.x;
					//Scan through the tiles we're travelling through from left to right
				for(var x = minx; x <= maxx; x++){
					for(var y = miny; y <= maxy; y++){
						if(this.getTile(x, y) == 1){
							retOBJ.pos = x + 1.0;
							retOBJ.hit = true;
						}
					}
				}
				return retOBJ;
			case "DOWN":
					//We are traveling down
				retOBJ.pos = vec2Pos.y + vec2Siz.y;
					//Scan through the tiles we're travelling through from top to bottom
				for(var y = miny; y <= maxy; y++){
					for(var x = minx; x <= maxx; x++){
						if(this.getTile(x, y) == 1){
							retOBJ.pos = y;
							retOBJ.hit = true;
						}
					}
				}
				return retOBJ;
			case "UP":
					//We are traveling up
				retOBJ.pos = vec2Pos.y;
					//Scan through the tiles we're travelling through from top to bottom
				for(var y = miny; y <= maxy; y++){
					for(var x = minx; x <= maxx; x++){
						if(this.getTile(x, y) == 1){
							retOBJ.pos = y + 1.0;
							retOBJ.hit = true;
						}
					}
				}
				return retOBJ;
		}
	};
	
	this.drawTileOnMap = function(context, img, x, y){
			//find the screen position for image
		var scrPos = this.mapToScreen(x, y);
		context.drawImage(img, scrPos.x, scrPos.y);
	};
	
	this.drawCharOnMap = function(context, img, x, y, frameCount, fps, animIndex){
			//find the screen position for image
		var scrPos = this.mapToScreen(x, y);
		context.drawImage(img, scrPos.x, scrPos.y);
	};
	
	this.setViewPos = function(x, y){
			// Only move towards the specified position, don't move directly there.
		this.CENTER.x += (x - this.CENTER.x) * 0.1;
		this.CENTER.y += (y - this.CENTER.y) * 0.1;
	};
	
	this.mapToScreen = function(x,y){
		var scrPos = new vec2(0.0, 0.0);
		scrPos.x = (x - this.CENTER.x) * this.TILE_SIZE  + (__GAME.canvas.width  * 0.5);
		scrPos.y = (y - this.CENTER.y) * this.TILE_SIZE  + (__GAME.canvas.height * 0.5);
		
		return scrPos;
	};

	this.screenToMap = function(x,y){
		var mapPos = new vec2(0.0, 0.0);
		mapPos.x = (x - (__GAME.canvas.width   * 0.5)) / this.TILE_SIZE + this.CENTER.x;
		mapPos.y = (y - (__GAME.canvas.height  * 0.5)) / this.TILE_SIZE + this.CENTER.y;
		return mapPos;
	};
	
		//Returns tile at given position. This is called rather than directly
		//indexing the "GRID" array because it provides bound checking against map edge
	this.getTile = function(x,y){
		if(x >= 0 && x < this.mapWidth &&
		   y >= 0 && y < this.mapHeight){
		   return this.GRID[y][x];	//???
		}
		   //else all tiles outside map area are empty
		return 0;
	};

}