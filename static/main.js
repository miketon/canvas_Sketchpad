	// The entry point of the application is set to the init function
window.onload = init;

function init(){ 
	new GameObjectManager().startupGameObjectManager();
}
	//Utilities
function vec2(x, y){
	this.x = x;
	this.y = y;
		this.print = function(){console.log("vec2 printing -> x :" + this.x + " y : " + this.y);};
}

	//Debug
function smileyMike(context){
			// Create the yellow face
		context.strokeStyle = "#000000";
		context.fillStyle = "#FFFF00";
		context.beginPath();
		context.arc(100,100,50,0,Math.PI*2,true);
		context.closePath();
		context.stroke();
		context.fill();
		
			//Create a drop shadow
		context.shadowOffsetX = 10;
		context.shadowOffsetY = 10;
		context.shadowBlur = 10;
		context.shadowColor = "black";
		
			//Rotate picture
		context.rotate(0.05);
}

function squareDraw(context, xposI, yposI, xposE, yposE){
	context.strokeStyle = "#0000FF";
	context.fillStyle = "#FFFF00";
	context.lineWidth   = 4;
	
	context.strokeRect(xposI, yposI, xposE, yposE);
}