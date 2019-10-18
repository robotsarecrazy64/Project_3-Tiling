// Renderer
var gameport = document.getElementById( "gameport" );
var renderer = PIXI.autoDetectRenderer( { width: 1000, height: 500, backgroundColor: 0x000033 } );
gameport.appendChild( renderer.view );

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Loads the assets from the sprite sheet
PIXI.Loader.shared
  .add( "assets.json" )
  .load( generateLevel );

// Containers
var master_stage = new PIXI.Container();
var startScreen = new PIXI.Container();
//var difficultyScreen = new PIXI.Container();
var instructScreen = new PIXI.Container();
var creditScreen = new PIXI.Container();
var endScreen = new PIXI.Container();
var back = new PIXI.Container();
var skull_a = new PIXI.Container();
var skull_b = new PIXI.Container();
var skull_c = new PIXI.Container();
var game_stage = new PIXI.Container();

// Assets
var cave;
var ground;
var lava;
var player;
var goal;
var big_skull_a;
var big_skull_b;
var big_skull_c;
var game_active = false;

// Variables to improve readability
var ground_level = 423;
var end_of_map = renderer.width;
var floor_position = 470;
var tile_size = 50;
var count = 2;
var offset = 0;
var winner = false;
var current_level = 1;

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
	clearStage ();
	current_level++;
	offset = 0; // enables the game to loop without issues
	
	// Set up Background
	cave = createSprite( 0, 0, 1, 1, "cave_background.png");
	back.scale.x = end_of_map/100;
	back.scale.y = back.scale.x/2;
	back.addChild( cave );
	game_stage.addChild( back );

	// Generate Floor Tiles
	ground = new PIXI.Texture.from( "ground.png" );
	
	lava = new PIXI.Texture.from( "lava.png" );
	

	var start_tile = new PIXI.TilingSprite( ground, tile_size, tile_size ); // ensures start tile is not a lava tile
	start_tile.position.x = 0;
	start_tile.position.y = floor_position;
	start_tile.tilePosition.x = 0;
	start_tile.tilePosition.y = 0;
	var end_tile = new PIXI.TilingSprite( ground, tile_size, tile_size ); // ensures end tile is not a lava tile
	end_tile.position.x = end_of_map - tile_size;
	end_tile.position.y = floor_position;	game_stage.addChild( start_tile );
	generateGroundTiles();
	game_stage.addChild( end_tile );

	// Set up End goal
	goal = createSprite( end_of_map - 40, ground_level, 1, 1, "door.png" );
	game_stage.addChild( goal );


	// Set up Player
	player = createSprite( 0, ground_level, 1, 1, "player1.png");
	player.interactive = true;
	document.addEventListener( 'keydown', keydownEventHandler );
	game_stage.addChild( player );
	
	// Set up enemies
        big_skull_a = createSkull( skull_a, end_of_map/4 );
	big_skull_b = createSkull( skull_b, end_of_map/2 );
	big_skull_c = createSkull ( skull_c, ( 3 * end_of_map ) / 4 );
	
        master_stage.addChild( game_stage );
	buildScreens();
	
	update();
}

/**
	Creates the enemy sprite
*/
function createSkull( stage, position ) {
	var skull = createMovieClip( 0, 0, 1.25, 1.25, "laughing_skull", 1, 2 );
	skull.anchor.x = 0.5;
	skull.anchor.y = 0.5;
	skull.interactive = true;
	stage.position.x = position;
	stage.position.y = ground_level - ((tile_size*3)/2);
	stage.pivot.x = tile_size;
	stage.pivot.y = tile_size;
        stage.rotation = 0;
	stage.addChild( skull );
	game_stage.addChild( stage );
	return skull;
}
/**
	Builds the Floor Tiles Recursively
*/
function generateGroundTiles() {
	offset += tile_size;
	
	if ( offset < ( end_of_map - tile_size ) ) {
		addTile( offset );
		addEnemy();
		generateGroundTiles();
	}
}

/**
	Update function to animate game assets
*/
function update() {
	// Updates the player status
	if ( player.position.y < ground_level ) { movePlayer( player.position.x + ( tile_size/2 ), ground_level ); } // fix y position
	if ( !winner ) { checkWinCondition(); } // checks for win condition
	if ( ( player.position.x > ( end_of_map - tile_size )) && winner ) { player.position.x = 0; } // allow the game to loop during free play
	
	// Rotates the enemies
	big_skull_a.rotation -= 0.025;
	skull_a.rotation += 0.025;
	big_skull_b.rotation += 0.025;
	skull_b.rotation -= 0.025;
	big_skull_c.rotation -= 0.025;
	skull_c.rotation += 0.025;

	// Update renderer
	renderer.render( master_stage );
	requestAnimationFrame( update );
if( game_active ){ 
   document.addEventListener( 'keydown', keydownEventHandler );
}
else 
   { document.removeEventListener( 'keydown', keydownEventHandler ); }
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
		swapPlayer( player.position.x + (tile_size), player.position.y, 1, 1, "player1.png"); 
		if( player.position.x > (end_of_map)) {player.position.x = end_of_map;}
  	}

  	if ( event.keyCode == 65 ) { // A key
		swapPlayer( player.position.x - (tile_size), player.position.y, 1, 1, "player2.png"); 
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
		if ( current_level == 6 ) {
			winner = true;
			endScreen.visible = true;
			game_active = false;
		}
		
		else {
			generateLevel();
		}
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
   graphics.beginFill(0x000000);
   graphics.drawRect(0, 0, 1000, 500);
   graphics.endFill();
   return graphics;
}

function buildScreens() {
   instructScreen.visible = false;
   creditScreen.visible = false;
   //difficultyScreen.visible = false;
   endScreen.visible = false;

    // Text for titles
   var gameTitleText = new PIXI.Text( "Cave Escape!", titleStyle );
   var gameInstructTitleText = new PIXI.Text( "Instructions", titleStyle );
   var gameCreditTitleText = new PIXI.Text( "Credits", titleStyle );
   var gameEndText = new PIXI.Text( "Game over!\nYou win!", endStyle );

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
   var gameCredDesc = new PIXI.Text( "Authors: John Jacobelli\nJesse Rodriguez\nTyler Pehringer\n\nRenderer used: PixiJS", 
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
   gameRestartText.click = function(event) { endScreen.visible = false; 
					     current_level = 0;
                                             player.position.x = 0;
					     game_active = true; 
                                             winner = false; 
                                             generateLevel(); }
   gameReturnTitleText.click = function(event) { startScreen.visible = true;
						 current_level = 0;
                                                 endScreen.visible = false; 
                                                 player.position.x = 0; 
                                                 winner = false; }
   
   // Create background for screens screen
   var graphics = createShape();
   startScreen.addChild( graphics );
   instructScreen.addChild( graphics );
   creditScreen.addChild( graphics );
   endScreen.addChild( graphics );

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
   endScreen.addChild( gameEndText );
   endScreen.addChild( gameRestartText );
   endScreen.addChild( gameReturnTitleText );
   
   // Set anchors for text
   gameTitleText.anchor.set( .5 );
   gameStartText.anchor.set( .5 );
   gameInstructText.anchor.set( .5 );
   gameCredText.anchor.set( .5 );
   gameInstructTitleText.anchor.set( .5 );
   gameInstructBackText.anchor.set( 1 );
   gameCredBackText.anchor.set( 1 );
   gameCreditTitleText.anchor.set( .5 );
   gameEndText.anchor.set( .5 );
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
   gameEndText.x = renderer.width/2; gameEndText.y = renderer.height/3 + 10;
   gameRestartText.x = renderer.width/2; gameRestartText.y = renderer.height/2 + 50;
   gameReturnTitleText.x = renderer.width/2; gameReturnTitleText.y = renderer.height/2 + 100;
   
   master_stage.addChild( startScreen );
   master_stage.addChild( instructScreen );
   master_stage.addChild( creditScreen );
   master_stage.addChild( endScreen );
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
   for (var i = skull_a.children.length - 1; i >= 0; i--) { skull_a.removeChild(skull_a.children[i]);};
   for (var i = skull_b.children.length - 1; i >= 0; i--) { skull_b.removeChild(skull_b.children[i]);};
   for (var i = skull_c.children.length - 1; i >= 0; i--) { skull_c.removeChild(skull_c.children[i]);};
   for (var i = startScreen.children.length - 1; i >= 0; i--) { startScreen.removeChild(startScreen.children[i]);};
   for (var i = instructScreen.children.length - 1; i >= 0; i--) { instructScreen.removeChild(instructScreen.children[i]);};
   for (var i = creditScreen.children.length - 1; i >= 0; i--) { creditScreen.removeChild(creditScreen.children[i]);};
   for (var i = endScreen.children.length - 1; i >= 0; i--) { endScreen.removeChild(endScreen.children[i]);};
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
    		clips.push( PIXI.Texture.fromFrame( image + i + '.png' ) );
  	}
	
	var movie_clip = new PIXI.extras.AnimatedSprite( clips );
	movie_clip.scale.x = scale_x;
	movie_clip.scale.y = scale_y;
	movie_clip.position.x = x;
	movie_clip.position.y = y;
	movie_clip.animationSpeed = 0.075;
	movie_clip.play();
  	return movie_clip;
}

