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
			alert( "You have successfully escaped the cave! Click OK to keep playing (forever)." );
			generateLevel();
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
	master_stage.removeChild( game_stage );
}
