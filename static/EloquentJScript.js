var thePlan =
  ["############################",
   "#      #    #      o      ##",
   "#                          #",
   "#          #####           #",
   "##         #   #    ##     #",
   "###           ##     #     #",
   "#           ###      #     #",
   "#   ####                   #",
   "#   ##       o             #",
   "# o  #         o       ### #",
   "#    #                     #",
   "############################"];
   
function Point(x, y){ 
  if ( !(this instanceof Point) ) 
    return new Point(x, y); 
   
  this.x = x;
  this.y = y;
  
  this.add = function(inPoint){
  				sum = Point(this.x + inPoint.x, this.y + inPoint.y);
  				return sum;  				
  			 }
  this.isEqualTo = function(inPoint){
  				   		return this.x == inPoint.x && this.y == inPoint.y;
  				   }
}

 