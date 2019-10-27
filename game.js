// Renderer
var gameport = document.getElementById( "gameport" );
var renderer = PIXI.autoDetectRenderer( { width: 1000, height: 500, backgroundColor: 0x000033 } );
gameport.appendChild( renderer.view );

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

PIXI.Loader.shared
  .add( "assets.json" )
  .add("it_burns.mp3")
  .add("ninja.mp3")
  .load( generateLevel );

// Containers
var master_stage = new PIXI.Container();
var startScreen = new PIXI.Container();
//var difficultyScreen = new PIXI.Container();
var instructScreen = new PIXI.Container();
var creditScreen = new PIXI.Container();
var winScreen = new PIXI.Container();
var loseScreen = new PIXI.Container();
var back = new PIXI.Container();
var game_stage = new PIXI.Container();

// Assets
var world;
var cave;
var ground;
var lava;
var player;
var goal;
var dash;
var burny_stuff;
var skulls = [];
var numOfSkulls = 25;
const MAX_SKULL_HEIGHT = 200;
var game_active = false;
var GAME_WIDTH = renderer.width;
var GAME_HEIGHT = renderer.height;
var GAME_SCALE = 1;
master_stage.scale.x = GAME_SCALE;
master_stage.scale.y = GAME_SCALE;

// Variables to improve readability
var ground_level = 423;
var end_of_map = renderer.width*5;

var floor_position = 470;
var tile_size = 50;
var count = 2;
var offset = 0;
var winner = false;
var current_level = 1;
var end_goal = end_of_map - 100;
var back_space = 999;
var sound_check = 1;
var game_mode;
var calm = 1;
var moody = 2;
var angry = 3;

var spooky = 4;


// -------------------- STYLES ----------------------------------------------------
// Texts that are titles on screens
const titleStyle = new PIXI.TextStyle({ fontSize: 100,
                                        fontWeight: 'bold',
                                        fontFamily: 'Calibri',
                                        fill: '#ffffff',
                                        align: 'center' });

// Texts that are options on a screen
const selectionStyle = new PIXI.TextStyle({ fontSize: 40,
                                            fontFamily: 'Calibri', 
                                            fill: '#ffffff' });
                                            
// Back "buttons"
const backStyle = new PIXI.TextStyle({ fontSize: 25,
                                            fontFamily: 'Calibri', 
                                            fontWeight: 'bold',
                                            fill: '#ffffff' });
        
// End game title        
const endStyle = new PIXI.TextStyle({ fontSize: 50,
                                            fontFamily: 'Calibri', 
                                            fontWeight: 'bold',
                                            align: 'center',
                                            fill: '#ffffff' });


/**
	Initializes the Game Elements
*/
function generateLevel() {
	// Setup Game Elements
	clearStage ();
	current_level++;
	sound_chek = 1;
	offset = 0;
	game_mode = calm;

	// Set up sound elements
	dash = PIXI.sound.Sound.from("ninja.mp3");
	burny_stuff = PIXI.sound.Sound.from("it_burns.mp3");

	// Set up Background	
	generateBackground();
	game_stage.addChild( back );

	// Generate Floor Tiles
	ground = new PIXI.Texture.from( "groundtile.png" );
	lava = new PIXI.Texture.from( "lavatile.png" );

	var start_tile = new PIXI.TilingSprite( ground, tile_size, tile_size ); 
	start_tile.position.x = 0;
	start_tile.position.y = floor_position;
	start_tile.tilePosition.x = 0;
	start_tile.tilePosition.y = 0;
	var end_tile = new PIXI.TilingSprite( ground, tile_size, tile_size ); 
	end_tile.position.x = end_of_map - ( 2 * tile_size );
	end_tile.position.y = floor_position;	
	game_stage.addChild( start_tile );
	generateGroundTiles();
	game_stage.addChild( end_tile );

	// Set up End goal
	goal = createSprite( end_goal, ground_level, 1, 1, "door.png" );
	game_stage.addChild( goal );


	// Set up Player
	player = createSprite( 0, ground_level, 1, 1, "player1.png");
	player.interactive = true;
	game_stage.addChild( player );
	
	// Set up enemies
	switch( game_mode ) {
		case calm:
			createSkulls(getRand(6) + 4);
			break;
		case moody:
			createSkulls(getRand(6) + 9);
			break;
		
		case angry:
			createSkulls(getRand(6) + 14);
			break;
		
		case spooky:
			createSkulls(getRand(25));
			break;
	}
	
	
        master_stage.addChild( game_stage );
	buildScreens();
	
	update();
}

function generateBackground() {
	for ( var screen_size = 0; screen_size < ( ( end_of_map/1000 ) ); screen_size++ ) {
		var cave = createSprite( back_space*screen_size, 0, 1, 1, "cave_background.png");
		back.addChild( cave );
	}
}


/**
 * generates a given number of skulls to be added to the game.
 * @param {*} numOfSkulls the number of skulls that will be generated
 * also affects the spacing of the skulls as they are evenly spaced
 */
function createSkulls(numOfSkulls){
	var spacing = end_of_map/numOfSkulls
	for (let index = 1; index <= numOfSkulls; index++) {
		createSkull(spacing * index); 	 	
	}
}

/**
	Creates a skull animatedSprite seting its x position based on the xPos
	the y position in randomly generated to be greater than the floor level
	the y velocity is also randomly generated to be from 1-12
	@var skulls: the generated skull is added to this global array.
*/
function createSkull( position ) {
	var skull = createMovieClip( 0, 0, 1.25, 1.25, "laughing_skull", 1, 2 );
	skull.interactive = true;
	skull.position.x = position;
	skull.y = ground_level - ( 75 + (getRand(9) * 10)) ;
	skull.vy = getRand(11) + 1 ;
	game_stage.addChild( skull );
	skulls.push(skull)
}

/**
 * changes the skulls direction based on if they reach the floor level or reach an arbitrary height
 * after checking the bounds the funcion updates each skulls y position based on their velocity.
 */
function animateSkulls(){

	for(var i in skulls){
		var skull = skulls[i];

		if(skull.position.y > floor_position - skull.height){
			skull.vy = (-1 * skull.vy);
		}
		if(skull.position.y < MAX_SKULL_HEIGHT){
			skull.vy = (-1 * skull.vy);
		}
		
		skull.position.y += skull.vy
	}
}

/**
 * checks every collision with every skull to see if it collides with the player
 * using checkRectangleCollision function
 */
function checkSkullPlayerCollisions(){

	for(var i in skulls){
		var skull = skulls[i];
		if(checkRectangleCollision(player, skull)){
			return true;
		}
	}

	return false;
}

/**
 * checks for collision of two objects using there rectangle dimensions
 * @param {*} object a PIXi.Container Object of subclass
 * @param {*} otherObject a PIXi.Container Object of subclass
 * @returns true if there is collisoin; false if otherwise
 */
function checkRectangleCollision(object, otherObject){

	let collision = false, combinedHalfWidths, xVector, yVector

	//Find the center points of each sprite
	object.centerX = object.x +  object.width / 2;
	object.centerY = object.y + object.height / 2;

	otherObject.centerX = otherObject.x + otherObject.width / 2;
	otherObject.centerY = otherObject.y + otherObject.height / 2;

	//finding half widths and half heights
	object.halfWidth = object.width / 2;
  	object.halfHeight = object.height / 2;
  	otherObject.halfWidth = otherObject.width / 2;
	otherObject.halfHeight = otherObject.height / 2;

	//Calculate the distance vector between the sprites
	xVector = object.centerX - otherObject.centerX;
	yVector = object.centerY - otherObject.centerY;

	//Figure out the combined half-widths(with a more leaniate threshold for gameplay)
	//and half-heights
  	combinedHalfWidthsAdjusted = object.halfWidth + otherObject.halfWidth - 20;
  	combinedHalfHeights = object.halfHeight + otherObject.halfHeight;

	//Check for a collision on the x axis
	if (Math.abs(xVector) < (combinedHalfWidthsAdjusted) && Math.abs(yVector) < combinedHalfHeights) {
		collision = true;	
	}

	return collision;
}

/**
	Builds the Floor Tiles Recursively
*/
function generateGroundTiles() {
	offset += tile_size;
	
	if ( offset < ( end_of_map - (2*tile_size ) ) ) {
		addTile( offset );
		addEnemy();
		generateGroundTiles();
	}

}

/**
	Update function to animate game assets
*/
function update() {
 
      //document.addEventListener( 'keydown', keydownEventHandler );
      // Updates the player status
	if ( player.position.y < ground_level ) { movePlayer( player.position.x + ( tile_size/2 ), ground_level ); } // fix y position
	if ( !winner ) { checkWinCondition(); } // checks for win condition
	if ( ( player.position.x > ( end_of_map - tile_size )) && winner ) { player.position.x = 0;} // allow the game to loop during free play
	
	//if the player is hit by a skull the game is over
	if(checkSkullPlayerCollisions()){
			//console.log("hit");
			if ( sound_check == 1 ) {
				burny_stuff.play();
				sound_check--;
			}
			loseScreen.x = player.x;
			loseScreen.visible = true;
			game_active = false;

	};
	animateSkulls();
	
	updateCamera();
   if( game_active ) { document.addEventListener( 'keydown', keydownEventHandler ); }
   else { document.removeEventListener( 'keydown', keydownEventHandler ); }

   // Update renderer
   renderer.render( master_stage );
   requestAnimationFrame( update );
}

/**
	Helper function that adds a random tile element to the stage
*/
function addTile( x ) {
	var ground_tile = createTile( x, floor_position, tile_size, ground );
	var lava_tile = createTile( x, floor_position, tile_size, lava );
	
	var rand_num = getRand( 5 ); // get a random number (1 or 2)
	
	if ( rand_num < 4 ) { game_stage.addChild( ground_tile ); } // adds a ground tile
	
	else { game_stage.addChild( lava_tile ); } // adds a lava tile
}

/**
	Helper function that returns a random number from 1 to max
*/
function getRand( max ) {
	return Math.floor(( Math.random() * max ) + 1 );
}

/**
	Event Handler for Key events
*/
function keydownEventHandler(event) {
  	if ( event.keyCode == 68 ) { // D key
		swapPlayer( player.position.x + tile_size, player.position.y, 1, 1, "player1.png");
		dash.play(); 
		if ( ( player.position.x > goal.x ) ) { player.position.x == goal.x;}
  	}

  	if ( event.keyCode == 65 ) { // A key
		swapPlayer( player.position.x - tile_size, player.position.y, 1, 1, "player2.png");
		dash.play(); 
		if( player.position.x < 0) {player.position.x = 0;}
  	}
}

/**
	Helper function that adds enemies to the stage
*/
function addEnemy() {
	var bat = createMovieClip( getRand( end_of_map - tile_size ), getRand( ground_level - tile_size ), .75, .75, "bat", 1, 2 );
	var tiny_skull = createSprite( getRand( end_of_map - tile_size ), getRand( ground_level - tile_size ), 1, 1, "flaming_skull.png" );
	var randomize = getRand( 2 );
	if ( randomize == 1 ) {
		bat.anchor.x = 0;
		bat.anchor.y = 0;
		game_stage.addChild( bat );
	}
	
	else {
		tiny_skull.anchor.x = 0;
		tiny_skull.anchor.y = 0;
		game_stage.addChild( tiny_skull );

	}
}

/**
	Checks if the player reached the End Goal
*/
function checkWinCondition () {
	if( player.x > goal.x ) {
		winner = true;
		winScreen.visible = true;
		game_active = false;
	}


}

/**
	Helper function that swaps the player sprite
*/
function swapPlayer ( x, y, scale_x, scale_y, image ) {
	var temp_x = x;
	var temp_y = y;
	game_stage.removeChild( player );
	player = createSprite( temp_x, temp_y, scale_x, scale_y, image );
	game_stage.addChild( player );
}

/**
	Helper function that creates a sprite
*/
function createSprite (x, y, scale_x, scale_y, image ) {
	var sprite = new PIXI.Sprite( PIXI.Texture.from( image ) );
	sprite.position.x = x;
	sprite.position.y = y;
	sprite.scale.x = scale_y;
	sprite.scale.y = scale_x;
	return sprite;
}
/**

*/
function createShape() {
   var graphics = new PIXI.Graphics();
   graphics.beginFill('0x000000');
   graphics.drawRect(0, 0, 1000, 500);
   graphics.endFill();
   return graphics;
}

function buildScreens() {
   instructScreen.visible = false;
   creditScreen.visible = false;
   //difficultyScreen.visible = false;
   winScreen.visible = false;
   loseScreen.visible = false;

    // Text for titles
   var gameTitleText = new PIXI.Text( "Cave Escape!", titleStyle );
   var gameInstructTitleText = new PIXI.Text( "Instructions", titleStyle );
   var gameCreditTitleText = new PIXI.Text( "Credits", titleStyle );
   var gameWinText = new PIXI.Text( "Game over!\nYou win!", endStyle );
   var gameLoseText = new PIXI.Text("Game over!\nThe skulls of the cave overtake you.", endStyle);

   // Text for title screen options
   var gameStartText = new PIXI.Text( "Start", selectionStyle );
   var gameInstructText = new PIXI.Text( "Instructions", selectionStyle );
   var gameCredText = new PIXI.Text( "Credits", selectionStyle );
   var gameCredBackText = new PIXI.Text( "<- Back", backStyle );
   var gameInstructBackText = new PIXI.Text( "<- Back", backStyle );
   var gameRestartText = new PIXI.Text( "Play again", selectionStyle );
   var gameReturnTitleText = new PIXI.Text( "Back to title screen", selectionStyle );
   
   // Adds regular text
   var gameInstructDesc = new PIXI.Text( "The goal of the game is to navigate the cave and" + 
      " make it\nto the end! The character is moved using the A and D keys.\n\nMove the character" + 
      " to the end of the cave to win.", selectionStyle );
   var gameCredDesc = new PIXI.Text( "Authors: John Jacobelli\nJesse Rodriguez\nTyler Pehringer\nDarius Dumel\n\nRenderer used: PixiJS", 
      selectionStyle );

   // Declare texts interactable
   gameStartText.interactive = true;
   gameInstructText.interactive = true;
   gameCredText.interactive = true;
   gameCredBackText.interactive = true;
   gameInstructBackText.interactive = true;
   gameRestartText.interactive = true;
   gameReturnTitleText.interactive = true;
   
   // Declares interactable text functions
   gameStartText.click = function(event) { startScreen.visible = false;
					   game_active = true; }
   gameInstructText.click = function(event) { instructScreen.visible = true;
                                              startScreen.visible = false; }
   gameCredText.click = function(event) { creditScreen.visible = true;
                                          startScreen.visible = false; }
   gameCredBackText.click = function(event) { startScreen.visible = true;
                                              creditScreen.visible = false; }
   gameInstructBackText.click = function(event) { startScreen.visible = true;
                                                  instructScreen.visible = false; }
   gameRestartText.click = function(event) { winScreen.visible = false;
					     loseScreen.visible = false; 
                                             current_level = 0;
					     sound_check = 1;
                                             player.position.x = 0;
                                             game_active = true; 
                                             winner = false; 
                                             generateLevel(); }
   gameReturnTitleText.click = function(event) { startScreen.visible = true;
                                                 current_level = 0;
												 winScreen.visible = false;
												 loseScreen.visible = false; 
                                                 player.position.x = 0; 
                                                 generateLevel();
                                                 winner = false; 
                                                 master_stage.x = 0;}
   
   // Create background for screens screen
   var graphics = createShape();
   startScreen.addChild( graphics );
   instructScreen.addChild( graphics );
   creditScreen.addChild( graphics );
   winScreen.addChild( graphics );
   loseScreen.addChild(graphics);

   // Add text to screens
   startScreen.addChild( gameTitleText );
   startScreen.addChild( gameStartText );
   startScreen.addChild( gameInstructText );
   startScreen.addChild( gameCredText );
   instructScreen.addChild( gameInstructTitleText );
   instructScreen.addChild( gameInstructDesc );
   instructScreen.addChild( gameInstructBackText );
   creditScreen.addChild( gameCredBackText );
   creditScreen.addChild( gameCreditTitleText );
   creditScreen.addChild( gameCredDesc );
   winScreen.addChild( gameWinText );
   winScreen.addChild( gameRestartText );
   winScreen.addChild( gameReturnTitleText );
   loseScreen.addChild(gameLoseText);
   loseScreen.addChild(gameRestartText);
   loseScreen.addChild(gameReturnTitleText);
   

   
   // Set anchors for text
   gameTitleText.anchor.set( .5 );
   gameStartText.anchor.set( .5 );
   gameInstructText.anchor.set( .5 );
   gameCredText.anchor.set( .5 );
   gameInstructTitleText.anchor.set( .5 );
   gameInstructBackText.anchor.set( 1 );
   gameCredBackText.anchor.set( 1 );
   gameCreditTitleText.anchor.set( .5 );
   gameWinText.anchor.set( .5 );
   gameRestartText.anchor.set( .5 );
   gameReturnTitleText.anchor.set( .5 );

   // Place Text
   gameTitleText.x = renderer.width/2; gameTitleText.y = renderer.height/4;
   gameStartText.x = renderer.width/6; gameStartText.y = renderer.height/4 * 3;
   gameInstructText.x = renderer.width/2 ; gameInstructText.y = renderer.height/4 * 3;
   gameCredText.x = renderer.width/6 * 5; gameCredText.y = renderer.height/4 * 3;
   gameInstructTitleText.x = renderer.width/2; gameInstructTitleText.y = renderer.height/4;
   gameInstructDesc.x = 25; gameInstructDesc.y = renderer.height/2;
   gameCreditTitleText.x = renderer.width/2; gameCreditTitleText.y = renderer.height/4;
   gameCredDesc.x = 25; gameCredDesc.y = renderer.height/2;
   gameInstructBackText.x = 975; gameInstructBackText.y = 475;
   gameCredBackText.x = 975; gameCredBackText.y = 475;
   gameWinText.x = renderer.width/2; gameWinText.y = renderer.height/3 + 10;
   gameLoseText.x = renderer.width/8; gameLoseText.y = renderer.height/3 + 10;
   gameRestartText.x = renderer.width/2; gameRestartText.y = renderer.height/2 + 50;
   gameReturnTitleText.x = renderer.width/2; gameReturnTitleText.y = renderer.height/2 + 100;
   
   master_stage.addChild( startScreen );
   master_stage.addChild( instructScreen );
   master_stage.addChild( creditScreen );
   master_stage.addChild( winScreen );
   master_stage.addChild( loseScreen )
   winScreen.x = end_goal - 950;
}

/**
	Helper function that creates a tile
*/
function createTile (x, y, size, sprite ) {
	var tile = new PIXI.TilingSprite( sprite, size, size );
	
	tile.position.x = x;
	tile.position.y = y;
	return tile;
}

/**
	Helper function that clears the stage
*/
function clearStage () {
   for (var i = startScreen.children.length - 1; i >= 0; i--) { startScreen.removeChild(startScreen.children[i]);};
   for (var i = instructScreen.children.length - 1; i >= 0; i--) { instructScreen.removeChild(instructScreen.children[i]);};
   for (var i = creditScreen.children.length - 1; i >= 0; i--) { creditScreen.removeChild(creditScreen.children[i]);};
   for (var i = winScreen.children.length - 1; i >= 0; i--) { winScreen.removeChild(winScreen.children[i]);};
   for (var i = back.children.length - 1; i >= 0; i--) { back.removeChild(back.children[i]);};
   for (var i = game_stage.children.length - 1; i >= 0; i--) { game_stage.removeChild(game_stage.children[i]);};
   for (var i = master_stage.children.length - 1; i >= 0; i--) { master_stage.removeChild(master_stage.children[i]);};
   delete master_stage;
}



/**
	Helper function that returns a movie clip
*/
function createMovieClip ( x, y, scale_x, scale_y, image, low, high ) {
	var clips = [];
	for ( var i = low; i <= high; i++ ) {
    		clips.push( PIXI.Texture.from( image + i + '.png' ) );
  	}
	
	var movie_clip = new PIXI.AnimatedSprite( clips );
	movie_clip.scale.x = scale_x;
	movie_clip.scale.y = scale_y;
	movie_clip.position.x = x;
	movie_clip.position.y = y;
	movie_clip.animationSpeed = 0.075;
	movie_clip.play();
  	return movie_clip;
}

function updateCamera() {
	if ( player.position.x < ( end_of_map - 1000 ) ) { master_stage.x = -player.position.x; }
	
}