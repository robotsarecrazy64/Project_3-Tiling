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

// Variables to improve readability
var ground_level = 423;
var end_of_map = renderer.width;
var floor_position = 470;
var tile_size = 50;
var count = 2;
var offset = 0;
var winner = false;

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
	goal = createSprite( end_of_map - tile_size, ground_level, 1, 1, "door.png" );
	game_stage.addChild( goal );


	// Set up Player
	player = createSprite( 0, ground_level, 1, 1, "Player.png");
	player.interactive = true;
	document.addEventListener( 'keydown', keydownEventHandler );
	game_stage.addChild( player );
	
	// Set up enemies
	big_skull_a = createSprite( 0, 0, 1, 1, "big_flaming_skull.png" );
	big_skull_a.anchor.x = 0.5;
	big_skull_a.anchor.y = 0.5;
	big_skull_a.interactive = true;
	skull_a.position.x = end_of_map/4;
	skull_a.position.y = ground_level - tile_size;
	skull_a.pivot.x = 50;
	skull_a.pivot.y = 50;
	skull_a.addChild( big_skull_a );
	game_stage.addChild( skull_a );

	big_skull_b = createSprite( 0, 0, 1, 1, "big_flaming_skull.png" );
	big_skull_b.anchor.x = 0.5;
	big_skull_b.anchor.y = 0.5;
	big_skull_b.interactive = true;
	skull_b.position.x = end_of_map/2;
	skull_b.position.y = ground_level - tile_size;
	skull_b.pivot.x = 50;
	skull_b.pivot.y = 50;
	skull_b.addChild( big_skull_b );
	game_stage.addChild( skull_b );

	big_skull_c = createSprite( 0, 0, 1, 1, "big_flaming_skull.png" );
	big_skull_c.anchor.x = 0.5;
	big_skull_c.anchor.y = 0.5;
	big_skull_c.interactive = true;
	skull_c.position.x = ( 3 * end_of_map ) / 4;
	skull_c.position.y = ground_level - tile_size;
	skull_c.pivot.x = 50;
	skull_c.pivot.y = 50;
	skull_c.addChild( big_skull_c );
	game_stage.addChild( skull_c );
	
	master_stage.addChild( game_stage );
   master_stage.addChild( startScreen );
   master_stage.addChild( instructScreen );
   master_stage.addChild( creditScreen );
   master_stage.addChild( endScreen );
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
   var gameInstructDesc = new PIXI.Text( "The goal of the game is to navigate the maze and" + 
      " make it\nto the end! The character is moved using the arrow keys.\n\nMove the character" + 
      " to the end of the maze to win.", selectionStyle );
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
   gameStartText.click = function(event) { startScreen.visible = false; }
   gameInstructText.click = function(event) { instructScreen.visible = true;
                                              startScreen.visible = false; }
   gameCredText.click = function(event) { creditScreen.visible = true;
                                          startScreen.visible = false; }
   gameCredBackText.click = function(event) { startScreen.visible = true;
                                              creditScreen.visible = false; }
   gameInstructBackText.click = function(event) { startScreen.visible = true;
                                                  instructScreen.visible = false; }
   gameRestartText.click = function(event) { endScreen.visible = false; 
                                             player.position.x = 0; 
                                             winner = false; 
                                             clearStage();
                                             generateLevel(); }
   gameReturnTitleText.click = function(event) { startScreen.visible = true;
                                                 endScreen.visible = false; 
                                                 player.position.x = 0; 
                                                 winner = false; }
   
   // Create backgrounds for screens screen
   var graphics = new PIXI.Graphics();
   graphics.beginFill(0x000000);
   graphics.drawRect(0, 0, 1000, 500);
   graphics.endFill();
   startScreen.addChild( graphics );
   
   var graphics1 = new PIXI.Graphics();
   graphics1.beginFill(0x000000);
   graphics1.drawRect(0, 0, 1000, 500);
   graphics1.endFill();
   instructScreen.addChild( graphics1 );
   
   var graphics2 = new PIXI.Graphics();
   graphics2.beginFill(0x000000);
   graphics2.drawRect(0, 0, 1000, 500);
   graphics2.endFill();
   creditScreen.addChild( graphics2 );
   
   var graphics3 = new PIXI.Graphics();
   graphics3.beginFill(0x000000);
   graphics3.drawRect(renderer.width/8, renderer.height/8, renderer.width * .75, renderer.height * .75);
   graphics3.endFill();
   endScreen.addChild( graphics3 );

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
	
	update();
}

/**
	Builds the Floor Tiles Recursively
*/
function generateGroundTiles() {
	offset += tile_size;
	
	if ( offset < ( end_of_map - tile_size ) ) {
		addTile( offset );
		addEnemy( "flaming_skull.png" );
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
	big_skull_a.rotation -= 0.0025;
	skull_a.rotation += 0.0025;
	big_skull_b.rotation += 0.0025;
	skull_b.rotation -= 0.0025;
	big_skull_c.rotation -= 0.0025;
	skull_c.rotation += 0.0025;

	// Update renderer
	renderer.render( master_stage );
	requestAnimationFrame( update );
   
   if( endScreen.visible == false )
   { document.addEventListener( 'keydown', keydownEventHandler ); }
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
		player.position.x += ( tile_size );
  	}

  	if ( event.keyCode == 65 ) { // A key
		player.position.x -= ( tile_size );
  	}
}

/**
	Helper function that adds enemies to the stage
*/
function addEnemy( image ) {
	var skull = new createSprite (  getRand( end_of_map ), getRand( ground_level ), 1, 1, image );
	skull.anchor.x = 0;
	skull.anchor.y = 0;
	game_stage.addChild( skull );
}

/**
	Checks if the player reached the End Goal
*/
function checkWinCondition () {
	if( player.x >= goal.x ) {
		
		if(( count % 2 ) == 0 ) { // prevents excessive alerts
			winner = true;
			//alert( "You have successfully escaped the cave! Click OK to keep playing (forever)." );
         endScreen.visible = true;
		}
		
			
		count += 1;
	}
}

/**
	Helper function that swaps the player sprite
*/
function swapPlayer ( x, y, scale_x, scale_y, image ) {
	game_stage.removeChild( player );
	player = createSprite( x, y, scale_x, scale_y, image );
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
	Helper function that creates a tile
*/
function createTile (x, y, size, sprite ) {
	var tile = new PIXI.TilingSprite( sprite, size, size );
	
	tile.position.x = x;
	tile.position.y = y;
	return tile;
}

function clearStage () {
   
   skull_a.removeChildren();
   skull_b.removeChildren();
   skull_c.removeChildren();
   startScreen.removeChildren();
   instructScreen.removeChildren();
   creditScreen.removeChildren();
   endScreen.removeChildren();
   back.removeChildren();
   game_stage.removeChildren();
   master_stage.removeChildren();
   /*
   for ( var position = 0; position < game_stage.children.length - 1; position++ )
   {
      delete game_stage.children[position];
   }
   ///*
   for ( var position = 0; position < master_stage.children.length - 1; position++ )
   {
      master_stage.removeChild( master_stage.children[position] );
   }
   */
}
