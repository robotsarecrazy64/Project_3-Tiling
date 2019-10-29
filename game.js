// Renderer
var gameport = document.getElementById( "gameport" );
var renderer = PIXI.autoDetectRenderer( { width: 1000, height: 500, backgroundColor: 0x000033 } );
gameport.appendChild( renderer.view );

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
PIXI.Loader.shared
  .add( "assets.json" )
  .add("it_burns.mp3")
  .add("ninja.mp3")
  .add("main_song.mp3")
  .add("winning.mp3")
  .add("Hallowwin.mp3")
  .add("Spoopy_whoosh.mp3")
  .add("Evil_laugh.mp3")
  .load( generateLevel );

// Containers
var master_stage = new PIXI.Container();
var startScreen = new PIXI.Container();
var difficultyScreen = new PIXI.Container();
var instructScreen = new PIXI.Container();
var creditScreen = new PIXI.Container();
var winScreen = new PIXI.Container();
var loseScreen = new PIXI.Container();
var back = new PIXI.Container();
var game_stage = new PIXI.Container();

// Assets
var filter;
var cave;
var ground;
var lava;
var player;
var goal;
var dash;
var burny_stuff;
var music;
var win;
var spooky_win;
var spooky_dash;
var spooky_laugh;
var skulls;
var ground_tiles;
var lava_tiles;
var winner = false;
var game_active = false;

// Variables to improve readability
var ground_level = 423;
var end_of_map = renderer.width*5;
var floor_position = 470;
var tile_size = 50;
var count = 2;
var offset = 0;
var current_level = 0;
var end_goal = end_of_map - 100;
var back_space = 999;
var sound_check = 1;
var game_mode;
var calm = 1;
var moody = 2;
var angry = 3;
var spooky = 4;
const MAX_SKULL_HEIGHT = 250;
var GAME_WIDTH = renderer.width;
var GAME_HEIGHT = renderer.height;
var GAME_SCALE = 1;
master_stage.scale.x = GAME_SCALE;
master_stage.scale.y = GAME_SCALE;

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
	clearStage();
	sound_check = 1;
	offset = 0;
	ground_tiles = [];
	skulls = [];
	lava_tiles = [];
	
	if ( game_mode == spooky ) { player = createSprite( 0, ground_level, 1, 1, "spoopy_player1.png");	}
	else { player = createSprite( 0, ground_level, 1, 1, "player1.png"); }
	goal = createSprite( end_goal, ground_level, 1, 1, "door.png" );
	
	// Set up sound elements
	dash = PIXI.sound.Sound.from("ninja.mp3");
	burny_stuff = PIXI.sound.Sound.from("it_burns.mp3");
	music = PIXI.sound.Sound.from("main_song.mp3");
	win = PIXI.sound.Sound.from("winning.mp3");
	spooky_win = PIXI.sound.Sound.from("Hallowwin.mp3");
	spooky_dash = PIXI.sound.Sound.from("Spoopy_whoosh.mp3");
	spooky_laugh = PIXI.sound.Sound.from("Evil_laugh.mp3");

	// Set up Background	
	generateBackground();
	game_stage.addChild( back );
	
	if ( game_active ) {
		// Generate Floor Tiles
		ground = new PIXI.Texture.from( "groundtile.png" );
		lava = new PIXI.Texture.from( "lavatile.png" );
		ground_tiles = generateFloorArray();
		generateGroundTiles();

		// Set up End goal	
		game_stage.addChild( goal );

		// Set up Player
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
	}

	master_stage.addChild( game_stage );	
	buildScreens();	
	update();
}

/**
	Builds the different screens of the game
*/
function buildScreens() {
   difficultyScreen.visible = false;
   instructScreen.visible = false;
   creditScreen.visible = false;
   winScreen.visible = false;
   loseScreen.visible = false;

    // Text for titles
   var gameTitleText = new PIXI.Text( "Cave Escape!", titleStyle );
   var gameDifficultyTitleText = new PIXI.Text( "Difficulty", titleStyle );
   var gameInstructTitleText = new PIXI.Text( "Instructions", titleStyle );
   var gameCreditTitleText = new PIXI.Text( "Credits", titleStyle );
   var gameWinText = new PIXI.Text( "Game over!\nYou win!", endStyle );
   var gameLoseText = new PIXI.Text("Game over!\nThe skulls of the cave overtake you.", endStyle);

   // Text for title screen options
   var gameStartText = new PIXI.Text( "Start", selectionStyle );
   var calmModeText = new PIXI.Text( "Calm", selectionStyle );
   var moodyModeText = new PIXI.Text( "Moody", selectionStyle );
   var angryModeText = new PIXI.Text( "Angry", selectionStyle );
   var spookyModeText = new PIXI.Text( "Spooky", selectionStyle ); 
   var gameInstructText = new PIXI.Text( "Instructions", selectionStyle );
   var gameCredText = new PIXI.Text( "Credits", selectionStyle );  
   var gameCredBackText = new PIXI.Text( "<- Back", backStyle );
   var gameInstructBackText = new PIXI.Text( "<- Back", backStyle );
   var gameRestartText = new PIXI.Text( "Play again", selectionStyle );
   var gameReturnTitleText = new PIXI.Text( "Back to title screen", selectionStyle );
   var gameLoseRestartText = new PIXI.Text( "Play again", selectionStyle );
   var gameLoseReturnTitleText = new PIXI.Text( "Back to title screen", selectionStyle );

   
   // Adds regular text
   var gameInstructDesc = new PIXI.Text( "The goal of the game is to navigate the cave and" + 
      " make it\nto the end! The character is moved using the A and D keys to move forward and backward and the space key to dash forward two spaces.\n\nMove the character" + 
      " to the end of the cave to win.", selectionStyle );
   var gameCredDesc = new PIXI.Text( "Authors: John Jacobelli\nJesse Rodriguez\nTyler Pehringer\nDarius Dumel\n\nRenderer used: PixiJS", 
      selectionStyle );

   // Declare texts interactable
   gameStartText.interactive = true;
   calmModeText.interactive = true;
   moodyModeText.interactive = true;
   angryModeText.interactive = true;
   spookyModeText.interactive = true;
   gameInstructText.interactive = true;
   gameCredText.interactive = true;
   gameCredBackText.interactive = true;
   gameInstructBackText.interactive = true;
   gameRestartText.interactive = true;
   gameReturnTitleText.interactive = true;
   gameLoseRestartText.interactive = true;
   gameLoseReturnTitleText.interactive = true;

   
   // Declares interactable text functions
   gameStartText.click = function(event) { difficultyScreen.visible = true;
                                           startScreen.visible = false; }
                                           
   calmModeText.click = function(event) { difficultyScreen.visible = false;
                                           game_active = true;
                                           game_mode = calm;
                                           generateLevel(); }
                                           
   moodyModeText.click = function(event) { difficultyScreen.visible = false;
                                           game_active = true;
                                           game_mode = moody;
                                           generateLevel(); }
                                           
   angryModeText.click = function(event) { difficultyScreen.visible = false;
                                           game_active = true;
                                           game_mode = angry;
                                           generateLevel(); }
                                             
   spookyModeText.click = function(event) { difficultyScreen.visible = false;
                                           game_active = true; 
                                           game_mode = spooky;
                                           generateLevel(); }
                                           
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
                                             sound_check = 1;
                                             player.position.x = 0;
                                             game_active = true; 
                                             winner = false;
                                             generateLevel(); }
                                             
   gameReturnTitleText.click = function(event) { startScreen.visible = true;
                                                 winScreen.visible = false;
                                                 loseScreen.visible = false; 
						                                     sound_check = 1;
                                                 player.position.x = 0;
                                                 winner = false;
						                                     game_mode = 1; }
                                                 
   gameLoseRestartText.click = function(event) { winScreen.visible = false;
                                             loseScreen.visible = false; 
                                             sound_check = 1;
                                             player.position.x = 0;
                                             game_active = true; 
                                             winner = false;
                                             generateLevel(); }
                                             
   gameLoseReturnTitleText.click = function(event) { startScreen.visible = true;
                                                 winScreen.visible = false;
                                                 loseScreen.visible = false; 
						 						 						 						 sound_check = 1;
                                                 player.position.x = 0;
                                                 winner = false;
						                                     game_mode = 1; }
    
   
   // Create background for screens screen
   var graphics = createShape();
   startScreen.addChild( graphics );
   difficultyScreen.addChild( graphics );
   instructScreen.addChild( graphics );
   creditScreen.addChild( graphics );
   winScreen.addChild( createShape() );
   loseScreen.addChild( graphics );

   // Add text to screens
   startScreen.addChild( gameTitleText );
   startScreen.addChild( gameStartText );
   startScreen.addChild( gameInstructText );
   startScreen.addChild( gameCredText );
   difficultyScreen.addChild( gameDifficultyTitleText );
   difficultyScreen.addChild( calmModeText );
   difficultyScreen.addChild( moodyModeText );
   difficultyScreen.addChild( angryModeText );
   difficultyScreen.addChild( spookyModeText );
   instructScreen.addChild( gameInstructTitleText );
   instructScreen.addChild( gameInstructDesc );
   instructScreen.addChild( gameInstructBackText );
   creditScreen.addChild( gameCredBackText );
   creditScreen.addChild( gameCreditTitleText );
   creditScreen.addChild( gameCredDesc );
   winScreen.addChild( gameWinText );
   winScreen.addChild( gameRestartText );
   winScreen.addChild( gameReturnTitleText );
   loseScreen.addChild( gameLoseText );
   loseScreen.addChild( gameLoseRestartText );
   loseScreen.addChild( gameLoseReturnTitleText );
   
   // Set anchors for text
   gameTitleText.anchor.set( .5 );
   gameStartText.anchor.set( .5 );
   gameDifficultyTitleText.anchor.set( .5 );
   calmModeText.anchor.set( .5 );
   moodyModeText.anchor.set( .5 );
   angryModeText.anchor.set( .5 );
   spookyModeText.anchor.set( .5 );
   gameInstructText.anchor.set( .5 );
   gameCredText.anchor.set( .5 );
   gameInstructTitleText.anchor.set( .5 );
   gameInstructBackText.anchor.set( 1 );
   gameCredBackText.anchor.set( 1 );
   gameCreditTitleText.anchor.set( .5 );
   gameWinText.anchor.set( .5 );
   gameRestartText.anchor.set( .5 );
   gameReturnTitleText.anchor.set( .5 );
   gameLoseRestartText.anchor.set( .5 );
   gameLoseReturnTitleText.anchor.set( .5 );

   // Place Text
   gameTitleText.x = renderer.width/2; gameTitleText.y = renderer.height/4;
   gameStartText.x = renderer.width/6; gameStartText.y = renderer.height/4 * 3;
   gameDifficultyTitleText.x = renderer.width/2; gameDifficultyTitleText.y = renderer.height/4;
   calmModeText.x = renderer.width/8; calmModeText.y = renderer.height/4 * 3;
   moodyModeText.x = renderer.width/8 * 3; moodyModeText.y = renderer.height/4 * 3;
   angryModeText.x = renderer.width/8 * 5; angryModeText.y = renderer.height/4 * 3;
   spookyModeText.x = renderer.width/8 * 7; spookyModeText.y = renderer.height/4 * 3;
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
   gameLoseRestartText.x = renderer.width/2; gameLoseRestartText.y = renderer.height/2 + 50;
   gameLoseReturnTitleText.x = renderer.width/2; gameLoseReturnTitleText.y = renderer.height/2 + 100;
   
   // Add screens to stage
   master_stage.addChild( startScreen );
   master_stage.addChild( difficultyScreen );
   master_stage.addChild( instructScreen );
   master_stage.addChild( creditScreen );
   master_stage.addChild( winScreen );
   master_stage.addChild( loseScreen );
   winScreen.x = end_goal - 950;
}

/**
	Updates the camera to follow the player
*/
function updateCamera() {
	if ( player.position.x <= ( end_of_map - 1000 ) ) { master_stage.x = -player.position.x; }
	
}

/**
	Update function to animate game assets
*/
function update() {
 
      // Updates the player status
	if ( !winner ) { checkWinCondition(); } // checks for win condition
	
	//if the player is hit by a skull or lava tile the game is over
	if(checkSkullPlayerCollisions() || checkLavaPlayerCollisions() ){
			if ( sound_check == 1 ) {
				if ( game_mode == spooky ) { spooky_laugh.play(); }
				else { burny_stuff.play(); }
				sound_check--;
			}
			loseScreen.x = player.x;
			loseScreen.visible = true;
			game_active = false;

	};
	animateSkulls();
	
	updateCamera();
   if( game_active ) { 
	document.addEventListener( 'keydown', keydownEventHandler );
	//music.play();
   }
   else { document.removeEventListener( 'keydown', keydownEventHandler ); }

   // Update renderer
   renderer.render( master_stage );
   requestAnimationFrame( update );
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
	Event Handler for Key events
*/
function keydownEventHandler(event) {
  	if ( event.keyCode == 68 ) { // D key
    event.preventDefault();
		swapPlayer( player.position.x + (tile_size), player.position.y, 1, 1, "player1.png");
		if ( ( player.position.x > goal.x ) ) { player.position.x == goal.x;}
  	}
	
	if ( event.keyCode == 32 ) { // space bar
    event.preventDefault();
		dash.play(); 
		if ( ( player.position.x > goal.x ) ) { player.position.x == goal.x;}
		if ( game_mode == spooky ) { swapPlayer( player.position.x + (tile_size), player.position.y, 1, 1, "spoopy_player1.png"); }
		else { swapPlayer( player.position.x + (2*tile_size), player.position.y, 1, 1, "player1.png"); }
		if ( ( player.position.x > goal.x ) ) { player.position.x == goal.x; }
  	}

  	if ( event.keyCode == 65 ) { // A key
    event.preventDefault();
		swapPlayer( player.position.x - tile_size, player.position.y, 1, 1, "player2.png");
		if( player.position.x < 0) {player.position.x = 0;}
		if ( game_mode == spooky ) { swapPlayer( player.position.x - (tile_size), player.position.y, 1, 1, "spoopy_player2.png"); }
		else { swapPlayer( player.position.x - (tile_size), player.position.y, 1, 1, "player2.png"); }
		if( player.position.x < 0) { player.position.x = 0; }
  	}
}

/**
	Checks if the player reached the End Goal
*/
function checkWinCondition () {
	if( player.x > goal.x ) {
		if ( game_mode == spooky ) { spooky_win.play(); }
		else { win.play(); }
		winner = true;
		winScreen.visible = true;
		game_active = false;
	}
}

/**
	Generates the background images
*/
function generateBackground() {
	for ( var screen_size = 0; screen_size < ( ( end_of_map/1000 ) ); screen_size++ ) {
		var cave = createSprite( back_space*screen_size, 0, 1, 1, "cave_background.png");
		var filter = createMovieClip( back_space*screen_size, 0, 10, 10, "filter", 1, 6 );
		filter.animationSpeed = 0.05;
		back.addChild( cave );
		if ( game_mode == spooky  ) { back.addChild( filter ); }
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
 * checks every collision with every lava tile to see if it collides with the player
 * using checkRectangleCollision function
 */
function checkLavaPlayerCollisions(){

	for(var i in lava_tiles){
		var lava = lava_tiles[i];
		if(checkRectangleCollision(player, lava)){
			return true;
		}
	}

	return false;
}

/**
	Generates the floor tiles using random array
*/
function generateGroundTiles() {
	ground_tiles.forEach( element => {
		addTile( offset, element );
		addEnemy();
		offset += tile_size;
	});
}

/**
	Helper function that adds a random tile element to the stage
*/
function addTile( x, type ) {
	var ground_tile = createTile( x, floor_position, tile_size, ground );
	var lava_tile = createTile( x, floor_position, tile_size, lava );
	
	if ( type == 1 ) { game_stage.addChild( ground_tile ); } // adds a ground tile
	
	else { 
		game_stage.addChild( lava_tile ); // adds a lava tile
		lava_tiles.push( lava_tile );
	} 
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
   while(game_stage.children[0]) 
   {
      game_stage.removeChild(game_stage.children[0]); 
   }
}

/**
	Helper function that returns a random number from 1 to max
*/
function getRand( max ) {
	return Math.floor(( Math.random() * max ) + 1 );
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

/**
	Helper function that adds enemies to the stage
*/
function addEnemy() {
	var bat = createMovieClip( getRand( end_of_map - tile_size ), getRand( ground_level - tile_size ), .75, .75, "bat", 1, 2 );
	var tiny_skull = createSprite( getRand( end_of_map - tile_size ), getRand( ground_level - tile_size ), 1, 1, "flaming_skull.png" );
	var ghost = createSprite( getRand( end_of_map - tile_size ), getRand( ground_level - tile_size ), .5, .5, "ghost.png" );
	var randomize = getRand( 2 );
	if ( randomize == 1 ) {
		bat.anchor.x = 0;
		bat.anchor.y = 0;
		game_stage.addChild( bat );
	}
	
	else {
		if( game_mode == spooky ) {
			ghost.anchor.x = 0;
			ghost.anchor.y = 0;
			game_stage.addChild( ghost );

		}
		
		else {
			tiny_skull.anchor.x = 0;
			tiny_skull.anchor.y = 0;
			game_stage.addChild( tiny_skull );
		}

	}
}

/**
	Helper function that swaps the player sprite
*/
function swapPlayer ( temp_x, temp_y, scale_x, scale_y, image ) {
   game_stage.removeChild( player );
	player = createSprite( temp_x, temp_y, scale_x, scale_y, image );
	game_stage.addChild( player );
   var xHalfTween = temp_x - ( tile_size / 2 );
   createjs.Tween.get( player.position ).to( { x: xHalfTween, y: temp_y - 25 }, 100, createjs.Ease.sineOut);
   setTimeout( function() { 
      createjs.Tween.get( player.position ).to( { x: temp_x, y: temp_y }, 100, createjs.Ease.sineIn); 
      }, 101 );
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
   graphics.drawRect(0, 0, 1050, 500);
   graphics.endFill();
   return graphics;
}

/**
	Generates a random array for the floor tiles where no lava tiles are touching
*/
function generateFloorArray() {
	var floor_array = [];
	for ( var value = 0; value < ( end_of_map/tile_size ); value++ ) {
		if( value == 0 || ( value >= 98 ) ) {
			floor_array.push( 1 );
		}
		else if ( floor_array[ value - 1] == 0 ){
				floor_array.push( 1 );
		}
		
		else if ( getRand(5) <= 2 ) { 
				floor_array.push( 0 );
		}
		
		else {
			floor_array.push( 1 );
		}
	}
	
	return floor_array;
}