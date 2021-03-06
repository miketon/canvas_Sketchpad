Doodle = new function(){
  // The world dimensions
  var SCREEN_WIDTH  = window.innerWidth;
  var SCREEN_HEIGHT = window.innerHeight;
  
  // Target framerate
  var FRAMERATE = 60;
  
  var canvas;
  var context;
  
  var points = [];
  
  // Mouse properties
  var mouseX         = (window.innerWidth - SCREEN_WIDTH);
  var mouseY         = (window.innerHeight - SCREEN_HEIGHT);
  var previousMouseX = mouseX;
  var previousMouseY = mouseY;
  var mouseIsDown    = false;
  var spaceIsDown    = false;
  
  var scale = 0.1;
  
  /**
   * 
   */
  this.init = function(){
  
    canvas = document.getElementById('world');
    
    if (canvas && canvas.getContext) {
      context = canvas.getContext('2d');
      
      // Register event listeners
      document.addEventListener('mousemove', documentMouseMoveHandler, false);
      document.addEventListener('mousedown', documentMouseDownHandler, false);
      document.addEventListener('mouseup', documentMouseUpHandler, false);
      
      canvas.width  = SCREEN_WIDTH  * scale;
      canvas.height = SCREEN_HEIGHT * scale;
      
      setInterval(loop, 1000 / FRAMERATE); 
      
    }
  };
  
  /**
   * Event handler for document.onmousemove.
   */
  function documentMouseMoveHandler(event){
    mouseX = event.clientX * scale;
    mouseY = event.clientY * scale;
  }
  
  /**
   * Event handler for document.onmousedown.
   */
  function documentMouseDownHandler(event){
    mouseIsDown = true;
  }
  
  /**
   * Event handler for document.onmouseup.
   */
  function documentMouseUpHandler(event) {
    mouseIsDown = false;
  }
  
  function loop() {
    
    // Clear the canvas of all old pixel data
    context.clearRect(0,0,canvas.width,canvas.height);
    
    points.push( new Point( mouseX, mouseY ) );
    
    var dx  = mouseX-previousMouseX;
    var dy  = mouseY-previousMouseY;
    var pad = Math.ceil( Math.sqrt(dx*dx + dy*dy) ) / 2;
    
    for( var i = 1; i < pad; i++ ) {
       points.push( new Point( previousMouseX + (mouseX-previousMouseX) * ( i / pad ), 
                               previousMouseY + (mouseY-previousMouseY) * ( i / pad ) ) );
    }
    
    for( var i = 1; i < points.length; i++ ) {
      var pp = points[i-1];
      var p = points[i];
      
      //p.position.x += p.velocity.x;
      //p.position.y += p.velocity.y;
      
      //p.alpha *= 0.97;
      p.size *= 0.87;
      
      context.fillStyle = 'rgba( 0, 235, 190, ' + p.alpha + ' )';
      context.beginPath();
      context.arc(p.position.x, p.position.y, p.size/2, 0, Math.PI*2, true);
      context.fill();
      //context.stroke();
    
      if( p.alpha < 0.01 || p.size < 0.001 ) {
        points.splice(i,1);
        i--;
      }
      
    }
          
    previousMouseX = mouseX;
    previousMouseY = mouseY;
  }
}
          
/**
 * 
 */
function Point( x, y ) {
  this.position = { x: x, y: y };
  this.size     = 3;
  this.alpha    = 1;
}
Point.prototype.distanceTo = function(p) {
  var dx = p.x-this.position.x;
  var dy = p.y-this.position.y;
  return Math.sqrt(dx*dx + dy*dy);
};
Point.prototype.clonePosition = function() {
  return { x: this.position.x, y: this.position.y };
};


Doodle.init();

