/**
 * Check out the full experiment at: 
 * http://hakim.se/experiments/html5/keylight/02/
 */
var KeylightWorld = new function() {
  
  var NUMBER_OF_CHANNELS = 12;
  var NUMBER_OF_CHORDS   = 30;
  
  var NUMBER_OF_ROWS = 3;
  var NUMBER_OF_COLS = 10;
  
  var PLAYHEAD_MIN_SPEED = 1;
  var PLAYHEAD_MAX_SPEED = 4;
  
  var worldRect   = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  var dirtyRegion = { left: 0, top: 0, right: 0, bottom: 0 };
  
  var usera  = navigator.userAgent.toLowerCase();
  var useMP3 = (usera.indexOf('safari') !         = -1) || (usera.indexOf('chrome') ! = -1);
  
  var canvas;
  var context;
  var paused;
  var intro;
  
  var keys = [];
  
  var playhead;
  var playheadSpeed = 3;
  
  // Holds references to all the preloaded chords audio objects, contents never changes after startup
  var audioChords = [];
  
  // Holds the audio instances used to play back audio, objects in this pool are rotated
  var audioChannels = [];
  
  var mouseX      = (window.innerWidth - worldRect.width);
  var mouseY      = (window.innerHeight - worldRect.height);
  var mouseIsDown = false;
  
  // This is used to keep track of the users last interaction to stop playing sounds after lack of input (save bandwidth)
  var lastMouseMoveTime = new Date().getTime();
  
  this.init = function() {
    
    canvas = document.getElementById( 'world' );
    paused = document.getElementById( 'paused' );
    intro  = document.getElementById( 'intro' );
    
    if (canvas && canvas.getContext) {
      
      for( var i = 1; i <= NUMBER_OF_CHORDS; i++ ) {
        var chord = new Audio( 'http://hakim.se/experiments/html5/keylight/03/assets/'+i+(useMP3?'.mp3':'.ogg') );
        chord.load();
        
        audioChords.push( chord );
      }
      
      // Setup the playback channels
      for( var i = 0; i <= NUMBER_OF_CHANNELS; i++ ) {
        audioChannels.push( new Audio('') );
      }
      
      context = canvas.getContext('2d');
      
      // Mouse events
      document.addEventListener ( 'mousemove' , documentMouseMoveHandler   , false ) ;
      document.addEventListener ( 'mousedown' , documentMouseDownHandler   , false ) ;
      document.addEventListener ( 'mouseup'   , documentMouseUpHandler     , false ) ;
      canvas.addEventListener   ( 'dblclick'  , documentDoubleClickHandler , false ) ;
      
      // Touch events
      document.addEventListener('touchstart' , documentTouchStartHandler , false);
      document.addEventListener('touchmove'  , documentTouchMoveHandler  , false);
      document.addEventListener('touchend'   , documentTouchEndHandler   , false);
      
      // Keyboard events
      document.addEventListener('keydown', documentKeyDownHandler, false);
      
      // UI events
      document.getElementById('increaseSpeed' ) .addEventListener('click' , increaseSpeedClickHandler , false ) ;
      document.getElementById('decreaseSpeed' ) .addEventListener('click' , decreaseSpeedClickHandler , false ) ;
      document.getElementById('reset'         ) .addEventListener('click' , resetClickHandler         , false ) ;
      document.getElementById('randomize'     ) .addEventListener('click' , randomizeClickHandler     , false ) ;
      
      // Other events
      window.addEventListener('resize', windowResizeHandler, false);
      
      playhead = new Playhead();
      
      // Update the speed with a zero offset, this will enforce the max/min limits
      updateSpeed(0);
      
      // Force a window resize to position all elements
      windowResizeHandler();
      
      // Try to create keys from a possible deep link
      createKeysFromHash('488x845_311x688_193x505_213x329_338x237_477x333_622x229_774x331_763x523_677x684_2' );
      
      // If there are no keys, show a intro to explain the usage
      if( keys.length == 0 ) {
        intro.style.display = 'block';
      }
      
      setInterval( loop, 1000 / 40 );
    }
  };

  function documentMouseMoveHandler(event) {
    updateMousePosition( event );
    
    lastMouseMoveTime = new Date().getTime();
  }
  
  function documentMouseDownHandler(event) {
    event.preventDefault();
    
    mouseIsDown = true;
    updateMousePosition( event );
    
    startDragging();
  }
  
  function documentDoubleClickHandler(event) {
    event.preventDefault();
    
    mouseIsDown = true;
    updateMousePosition( event );
    
    createKey( mouseX, mouseY );
    
    updateKeysInHash();
  }
  
  function documentMouseUpHandler(event) {
    mouseIsDown = false;
    
    stopDragging();
    
    updateKeysInHash();
  }
  
  function documentTouchStartHandler(event) {
    if(event.touches.length == 1) {
      event.preventDefault();
      
      mouseIsDown = true;
      
      updateMousePosition( event );
    }
  }
  
  function documentTouchMoveHandler(event) {
    if(event.touches.length == 1) {
      event.preventDefault();

      updateMousePosition( event );
    }
    
    lastMouseMoveTime = new Date().getTime();
  }
  
  function documentTouchEndHandler(event) {
    mouseIsDown = false;
  }
  
  function documentKeyDownHandler(event) {
    switch( event.keyCode ) {
      case 40:
        updateSpeed( -1 );
        event.preventDefault();
        break;
      case 38:
        updateSpeed( 1 );
        event.preventDefault();
        break;
    }
  }
  
  function windowResizeHandler() {
    worldRect.width  = window.innerWidth;
    worldRect.height = window.innerHeight;
    
    canvas.width  = worldRect.width;
    canvas.height = worldRect.height;
    
    canvas.style.position = 'absolute';
    canvas.style.left     = (window.innerWidth - canvas.width) * .5 + 'px';
    canvas.style.top      = (window.innerHeight - canvas.height) * .5 + 'px';
    
    paused.style.position = 'absolute';
    intro.style.position  = 'absolute';

    paused.style.top  = (window.innerHeight - 60) * .5 + 'px';
    paused.style.left = (window.innerWidth - worldRect.width) * .5 + 'px';
    
    intro.style.top  = (window.innerHeight - 60) * .5 + 'px';
    intro.style.left = (window.innerWidth - worldRect.width) * .5 + 'px';
  }
  
  // Convenience method called from many mouse event handles to update the current mouse position
  function updateMousePosition(event) {
    mouseX = event.clientX - (window.innerWidth - worldRect.width) * .5;
    mouseY = event.clientY - (window.innerHeight - worldRect.height) * .5;
  }
  
  // Updates the keys in the hash (url suffix) to reflect the current state
  function updateKeysInHash() {
    var hash = '';
    
    for (var i = 0, len = keys.length; i < len; i++) {
      if( i > 0 ) {
        hash += '_';
      }
      
      // Scale the position to 0-1*100 and append to the hash.
      // (0-1 for scalabilty of the UI and *100 to avoid decimals in the hash)
      hash += Math.round((keys[i].position.x/worldRect.width)*1000) + 'x' + Math.round((keys[i].position.y/worldRect.height)*1000);
    }
    
    // If a valid hash has been generated, append the speed
    if( hash != '' ) {
      hash += '_'+playheadSpeed.toString();
    }
    
    document.location.href = '#' + hash;
  }
  
  function createKeysFromHash(overrideHash) {
    // Split the hash by its delimiter
    var rawKeys = document.location.href.slice(document.location.href.indexOf('#') + 1).split('_');
    
    if(overrideHash){
        rawKeys = overrideHash.split('_');
    } 
      
    var k, x, y;
    
    while( rawKeys && rawKeys.length ) {
      
      // Fetch the next key and split it by the delimiter resulting in [x,y]
      k = rawKeys.shift().split( 'x' );
      
      // If there's two values in this segment, we are looking at a key position
      if( k.length == 2 ) {
        // The position is in a 0-1*100 scale, revert that into pixels
        x = parseInt(k[0]) / 1000 * worldRect.width;
        y = parseInt(k[1]) / 1000 * worldRect.height;
        
        if( !isNaN(x) && !isNaN(y) ) {
          createKey( x, y );
        }
      }
      else {
        // Get the speed value if any
        if( !isNaN( parseInt( k[0] ) ) ) {
          playheadSpeed = parseInt( k[0] );
          updateSpeed(0); // Update with a zero offset to force bounds check
        }
      }
    }
  }
  
  function resetClickHandler(event) {
    event.preventDefault();
    keys = [];
    
    updateKeysInHash();
  }
  
  function randomizeClickHandler(event) {
    event.preventDefault();
    keys = [];
    
    intro.style.display = 'none';
    
    var q = Math.round( 4 + Math.random() * 8 );
    
    while( q-- ) {
      var key = new Key();
      
      key.position.x = 40 + (Math.random() * worldRect.width - 80);
      key.position.y = 40 + (Math.random() * worldRect.height - 80);
      
      keys.push( key );
    }
    
    playheadSpeed = PLAYHEAD_MIN_SPEED;
    
    updateSpeed( Math.round( Math.random() * (PLAYHEAD_MAX_SPEED-PLAYHEAD_MIN_SPEED) ) );
    
    updateKeysInHash();
  }
  
  function increaseSpeedClickHandler(event) {
    event.preventDefault();
    updateSpeed(1);
    
    updateKeysInHash();
  }
  function decreaseSpeedClickHandler(event) {
    event.preventDefault();
    updateSpeed(-1);
    
    updateKeysInHash();
  }
  
  // Updates the current speed while restricting to limits, also updates the UI to reflect the change
  function updateSpeed( offset ) {
    playheadSpeed += offset;
    playheadSpeed = Math.min( Math.max( playheadSpeed, PLAYHEAD_MIN_SPEED ), PLAYHEAD_MAX_SPEED );
    
    document.getElementById( 'speedDisplay' ).innerHTML = playheadSpeed + '/' + PLAYHEAD_MAX_SPEED;
  }
  
  function startDragging() {
    for (var i = 0, len = keys.length; i < len; i++) {
      if (keys[i].distanceTo({ x: mouseX, y: mouseY }) < 40) {
        keys[i].dragging = true;
        break;
      }
    }
  }
  
  function stopDragging() {
    for (var i = 0, len = keys.length; i < len; i++) {
      keys[i].dragging = false;
    }
  }
  
  // Returns a cell from a point. This point must be within the worldRect
  function getCellFromPoint( p ) {
    var i, j;
    
    var cellW = worldRect.width / (NUMBER_OF_COLS-1);
    var cellH = worldRect.height / (NUMBER_OF_ROWS);
    
    exitLoop: for( i = 0; i < NUMBER_OF_ROWS; i++ ) {
      for( j = 0; j < NUMBER_OF_COLS-1; j++ ) {
        if( p.x > j * cellW && p.x < j * cellW + cellW && p.y > i * cellH && p.y < i * cellH + cellH ) {
          break exitLoop;
        }
      }
    }
    
    return { x: j, y: i };
  }
  
  function createKey( x, y ) {
    intro.style.display = 'none';
    
    var key = new Key();
    
    key.position.x = x;
    key.position.y = y;
    
    keys.push( key );
  }
  
  // Updates the color of a key to reflect a position [left = red, mid = green, right = blue]
  function updateKeyColor( key, x, y ) {
    var centerX = (worldRect.width / 2);
    
    key.color.r = 63 + Math.round( ( 1 - Math.min( x / centerX, 1 ) ) * 189 );
    key.color.g = 63 + Math.round( Math.abs( (x > centerX ? x-(centerX*2) : x) / centerX ) * 189 );
    key.color.b = 63 + Math.round( Math.max(( ( x - centerX ) / centerX ), 0 ) * 189 );
  }
  
  function playChord( index ) {
    audioChannels[0].pause();
    
    audioChannels[0].src = audioChords[index].src;
    audioChannels[0].load();
    audioChannels[0].play();
    
    // Rotate the channels
    audioChannels.push( audioChannels.shift() );
  }

  function loop() {
    if( new Date().getTime() - lastMouseMoveTime > 1000 * 50 && keys.length > 1 ) {
      paused.style.display = 'block';
      return;
    }
    else {
      paused.style.display = 'none';
    }
    
    var dirtySpread = 60;
    context.clearRect(dirtyRegion.left-dirtySpread,dirtyRegion.top-dirtySpread,dirtyRegion.right-dirtyRegion.left+(dirtySpread*2),dirtyRegion.bottom-dirtyRegion.top+(dirtySpread*2));
    
    // Reset the dirty region so that it can be expanded anew
    dirtyRegion = { left: worldRect.x + worldRect.width, top: worldRect.y + worldRect.height, right: 0, bottom: 0 };
    
//    context.fillStyle = 'rgba(0,0,0,0.3)';
//    context.fillRect(worldRect.x, worldRect.y, worldRect.width, worldRect.height);
    
    var key, particle, color, i, ilen, j, jlen;
    var deadKeys = [];
    
    for (i = 0, ilen = keys.length; i < ilen; i++) {
      key = keys[i];
      
      // Are there any particles we need to process for this key?
      if( key.particles.length > 0 ) {
        
        for (j = 0, jlen = key.particles.length; j < jlen; j++) {
          if( Math.random()>0.4) {
            particle = key.particles[j];
            
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
            
            particle.velocity.x *= 0.97;
            particle.velocity.y *= 0.97;
            
            particle.rotation += particle.velocity.r;
            
            var x = particle.position.x + Math.cos( particle.rotation ) * particle.rotationRadius;
            var y = particle.position.y + Math.sin( particle.rotation ) * particle.rotationRadius;
            
            context.fillStyle = 'rgba('+key.color.r+','+key.color.g+','+key.color.b+','+(0.3+(Math.random()*0.7))+')';
            context.fillRect(x, y, 1, 1);
            
            // Expand the dirty rect if needed
            dirtyRegion.left   = Math.min(dirtyRegion.left, particle.position.x);
            dirtyRegion.top    = Math.min(dirtyRegion.top, particle.position.y);
            dirtyRegion.right  = Math.max(dirtyRegion.right, particle.position.x);
            dirtyRegion.bottom = Math.max(dirtyRegion.bottom, particle.position.y);
          }
        }
        
        if( Math.random() > 0.8 ) {
          key.particles.shift();
        }
        
        while( key.particles.length > 50 ) {
          key.particles.shift();
        }
        
        // TODO: There is a bug causing the next shape drawn after this point to flicker, 
        // resetting the fill to a full alpha color works for now
        context.fillStyle = "#ffffff";
      }
      
      color = context.createRadialGradient(key.position.x, key.position.y, 0, key.position.x, key.position.y, key.size.current);
      color.addColorStop(0,'rgba('+key.color.r+','+key.color.g+','+key.color.b+','+key.color.a+')');
      color.addColorStop(1,'rgba('+key.color.r+','+key.color.g+','+key.color.b+','+key.color.a*0.7+')');
      
      // Scaling is applied depending on tone
      var scale = 0.5;
      scale += key.position.y/worldRect.height; // top = light tones, bottom = heavy tones
      scale += key.position.x/worldRect.width*0.1; // left = lighter tones, right = heavier tones
      
      context.beginPath();
      context.fillStyle = color;
      context.arc(key.position.x, key.position.y, key.size.current*scale, 0, Math.PI*2, true);
      context.fill();
      
      if( key.dragging ) {
        key.position.x += ( mouseX - key.position.x ) * 0.2;
        key.position.y += ( mouseY - key.position.y ) * 0.2;
      }
      else if( key.position.x < worldRect.x || key.position.x > worldRect.width || key.position.y < worldRect.y || key.position.y > worldRect.height ) {
        deadKeys.push( i );
      }
      
      key.cloudSize.current += ( key.cloudSize.target - key.cloudSize.current ) * 0.04;
      key.size.current += ( key.size.target - key.size.current ) * 0.2;
      
      // Sync the color of the key with the current position
      updateKeyColor( key, key.position.x, key.position.y );
      
      // Expand the dirty rect if needed
      dirtyRegion.left   = Math.min(dirtyRegion.left, key.position.x - key.cloudSize.current);
      dirtyRegion.top    = Math.min(dirtyRegion.top, key.position.y - key.cloudSize.current);
      dirtyRegion.right  = Math.max(dirtyRegion.right, key.position.x + key.cloudSize.current);
      dirtyRegion.bottom = Math.max(dirtyRegion.bottom, key.position.y + key.cloudSize.current);
    }
    
    while (deadKeys.length) {
      keys.splice( deadKeys.pop(), 1 );
    }
    
    // The playhead can only be rendered if there are at least two keys
    if( keys.length > 1 ) {
      if( playhead.index > keys.length - 1 ) {
        playhead.index = 0;
      }
      
      var attractor = keys[playhead.index];
      
      var point = { x: playhead.getPosition().x, y: playhead.getPosition().y };
      point.x  += ( attractor.position.x - playhead.getPosition().x ) * playheadSpeed / 10;
      point.y  += ( attractor.position.y - playhead.getPosition().y ) * playheadSpeed / 10;
      
      playhead.addPosition( point );
      
      // Expand the dirty rect if needed
      dirtyRegion.left   = Math.min(dirtyRegion.left, point.x);
      dirtyRegion.top    = Math.min(dirtyRegion.top, point.y);
      dirtyRegion.right  = Math.max(dirtyRegion.right, point.x);
      dirtyRegion.bottom = Math.max(dirtyRegion.bottom, point.y);
      
      if( playhead.distanceTo( attractor.position ) < 10 ) {
        playhead.index ++;
        
        // Inherit color from the attractor
        playhead.color = attractor.color;
        
        if( playhead.index > keys.length - 1 ) {
          playhead.index = 0;
        }
        
        // Emit any extra effects at collision
        attractor.emit( keys[playhead.index].position );
        
        // Determine which cell the attractor key is in
        var cell = getCellFromPoint( { x: attractor.position.x, y: attractor.position.y } );
        
        // Play back the chord representing the cell that the attractor is in
        playChord( (cell.y * NUMBER_OF_COLS) + cell.x + 1 );
      }
      
      // Set the color of the playhead
      color = 'rgba('+playhead.color.r+','+playhead.color.g+','+playhead.color.b+',1)';
      
      var cp = playhead.positions[ 0 ];
      var np = playhead.positions[ 1 ];
      
      // Expand the dirty rect if needed
      dirtyRegion.left   = Math.min(dirtyRegion.left, cp.x);
      dirtyRegion.top    = Math.min(dirtyRegion.top, cp.y);
      dirtyRegion.right  = Math.max(dirtyRegion.right, cp.x);
      dirtyRegion.bottom = Math.max(dirtyRegion.bottom, cp.y);
      
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = playhead.size;
      
      if( cp && np ) {
        context.moveTo( cp.x + ( np.x - cp.x ) / 2, cp.y + ( np.y - cp.y ) / 2 );
        
        for( i = 1, len = playhead.positions.length-1; i < len; i++ ) {
          cp = playhead.positions[i];
          np = playhead.positions[i+1];
          
          context.quadraticCurveTo( cp.x, cp.y, cp.x + ( np.x - cp.x ) / 2, cp.y + ( np.y - cp.y ) / 2 );
          context.stroke();
        }
      }
      
      context.lineTo(np.x,np.y);
    } 
    
  }
    
  
};

/**
 * 
 */
function Point() {
  this.position = { x: 0, y: 0 };
}
Point.prototype.distanceTo = function(p) {
  var dx = p.x-this.position.x;
  var dy = p.y-this.position.y;
  return Math.sqrt(dx*dx + dy*dy);
};
Point.prototype.clonePosition = function() {
  return { x: this.position.x, y: this.position.y };
};

/**
 * 
 */
function Key() {
  this.position  = { x: 0, y: 0              } ;
  this.color     = { r: 0, g: 0, b: 0, a: 1  } ;
  this.size      = { current: 0, target: 11  } ;
  this.cloudSize = { current: 50, target: 50 } ;
  this.dragging  = false;
  this.particles = [];
}
Key.prototype = new Point();
Key.prototype.emit = function( direction ) {
  
  this.size.current      = 32;
  this.cloudSize.current = 100;
  
  var q = 30 + Math.round( Math.random()*20 );
  var i, p, dx, dy;
  
  for( i = 0; i < q; i++ ) {
    p = new Particle();
    
    p.position = this.clonePosition();
    
    dx = direction.x - p.position.x;
    dy = direction.y - p.position.y;
    
    p.position.x += dx * (0.6*(i/q));
    p.position.y += dy * (0.6*(i/q));
    
    var rr = 20 * ((i/q));
    
    p.position.x += -rr + Math.random() * (rr+rr);
    p.position.y += -rr + Math.random() * (rr+rr);
    
    p.velocity.x = dx/(100+(Math.random()*500));
    p.velocity.y = dy/(100+(Math.random()*500));
    p.velocity.r = -0.1 + Math.random() * 0.2;
    
    p.rotationRadius = Math.random() * 20;
    
    this.particles.push( p );
  }
};

/**
 * 
 */
function Particle() {
  this.position = { x: 0, y: 0 };
  this.velocity = { x: 0, y: 0, r: 0 };
  this.rotation = 0;
  this.rotationRadius = 0;
}
Particle.prototype = new Point();

/**
 * 
 * @returns {Playhead}
 */
function Playhead() {
  this.positions = [ {x:0, y:0} ];
  this.index     = 0;
  this.size      = 2;
  this.length    = 5;
  this.color     = { r: 0, g: 0, b: 0, a: 0.8 };
}
Playhead.prototype.distanceTo = function(p) {
  var position = this.getPosition();
  
  var dx = p.x-position.x;
  var dy = p.y-position.y;
  return Math.sqrt(dx*dx + dy*dy);
};
Playhead.prototype.addPosition = function(p) {
  while( this.positions.length > this.length ) {
    this.positions.shift();
  }
  
  this.positions.push( p );
};
Playhead.prototype.getPosition = function() {
  return this.positions[this.positions.length-1];
};



KeylightWorld.init();
  
 

