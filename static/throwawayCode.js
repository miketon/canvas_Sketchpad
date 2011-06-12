//window.onload = init;
console.log("Howdy Doody!")
function init(){
	console.log("throwawayCode.js: init");

	__MAIN = this;
   	this.canvas 	= document.getElementById('canvas');
   	this.context2D 	= canvas.getContext('2d');
   		//create and draw to backbuffer
   	this.backBuffer = document.createElement('canvas');
    this.backBuffer.width = this.canvas.width;
    this.backBuffer.height = this.canvas.height;
    this.backBufferContext2D = this.backBuffer.getContext('2d');
    
    this.canvas.addEventListener('mousemove', ev_mousemove, false);
   	
   		//copy the back buffer to the displayed canvas
	this.context2D.drawImage(this.backBuffer, 0, 0);
	
}

// The mousemove event handler.
var started = false;

function ev_mousemove (ev) {
	var x, y;

  // Get the mouse position relative to the canvas element.
  if (ev.layerX || ev.layerX == 0) { // Firefox
    x = ev.layerX;
    y = ev.layerY;
  } else if (ev.offsetX || ev.offsetX == 0) { // Opera
    x = ev.offsetX;
    y = ev.offsetY;
  }
console.log("throwawayCode.js: mouseHandler " + x);
  // The event handler works like a drawing pencil which tracks the mouse 
  // movements. We start drawing a path made up of lines.
  if (!started) {
    __MAIN.context2D.beginPath();
    __MAIN.context2D.moveTo(x, y);
    started = true;
  } else {
    __MAIN.context2D.lineTo(x, y);
    __MAIN.context2D.stroke();
  }
}