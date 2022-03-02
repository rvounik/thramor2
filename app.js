
// helpers
import helpers from './helpers/index.js';

// data
import area from './assets/data/area.js';
import tiles from './assets/data/tiles.js';
import objects from './assets/data/objects.js';
import characters from './assets/data/characters.js';
import spriteSheets from './assets/data/spriteSheets.js';

// constants
import Structures from './constants/Structures.js';

let start = null;
let progress = 0;

// innerMap dimensions (range: x = 200 - 600, y = 100 - 500) and player coordinates relative to it
const innerMap = {
    w: 400,
    h: 300,
    x: 355,
    y: 325
}

const playerWidth = 50;
const playerHeight = 50;
const playerSpeed = 3;

const player = {
    x: 910,
    y: 930,
    speed: playerSpeed,
    width: playerWidth,
    height: playerHeight,
    direction: 'down',
}

const engine = {
    debug: false,
    fpsTimer: [],
    rasterLines: true,
    tileWidth: 50,
    tileHeight: 50,
    keys: {
        right: false,
        left: false,
        up: false,
        down: false
    }
}

// keep track of sprite sheet animations (player, enemies etc)
const animations = [];

let hitAnimations = [];

// holds the reduced objects, only the ones that are (almost) in view
let tempObjects = []; // todo: rename visibleObjects?

// holds the reduced characters, only the ones that are (almost) in view
let tempCharacters = []; // todo: rename visibleCharacters?

// set some vars that handle key mapping
let KEYCODE_LEFT = 37,
    KEYCODE_UP = 38,
    KEYCODE_RIGHT = 39,
    KEYCODE_DOWN = 40,
    KEYCODE_DEBUG = 68;

// get the canvas context
const context = document.getElementById('canvas').getContext('2d');

const handleKeyDown = e => {
    engine.keys.right = false;
    engine.keys.left = false;
    engine.keys.up = false;
    engine.keys.down = false;

    switch (e.keyCode) {
        case KEYCODE_LEFT:
            engine.keys.left = true;
            player.direction = 'left';
            registerAnimation('hero_sheet_left', 1);
            break;
        case KEYCODE_RIGHT:
            engine.keys.right = true;
            player.direction = 'right';
            registerAnimation('hero_sheet_right', 1);
            break;
        case KEYCODE_UP:
            engine.keys.up = true;
            player.direction = 'up';
            registerAnimation('hero_sheet_up', 1);
            break;
        case KEYCODE_DOWN:
            engine.keys.down = true;
            player.direction = 'down';
            registerAnimation('hero_sheet_down', 1);
            break;
    }
}

const handleKeyUp = e => {
    switch (e.keyCode) {
        case KEYCODE_LEFT:
            engine.keys.left = false;
            helpers.Animation.unRegisterAnimation( 1, animations);
            break;
        case KEYCODE_RIGHT:
            engine.keys.right = false;
            helpers.Animation.unRegisterAnimation( 1, animations);
            break;
        case KEYCODE_UP:
            engine.keys.up = false;
            helpers.Animation.unRegisterAnimation(1, animations);
            break;
        case KEYCODE_DOWN:
            engine.keys.down = false;
            helpers.Animation.unRegisterAnimation(  1, animations);
            break;
        case KEYCODE_DEBUG:
            engine.debug = engine.debug !== true;
            break;
    }
}

let assetsLoaded = false;

const clickHandler = event => {
}

// load the image assets by setting image.img.src to image.src
const loadImage = image => {
    image['img'].src = image['src']
}

const checkLoadedAssets = () => {
    let loaded = true;

    // check if tiles have dimensions (and are thus loaded)
    for (let loadedTile = 0; loadedTile < tiles.length; loadedTile++) {
        if (!tiles[loadedTile] || !tiles[loadedTile].img.naturalWidth) {
            loaded = false;
        }
    }

    // check if objects have dimensions (and are thus loaded)
    for (let loadedObject = 0; loadedObject < objects.length; loadedObject++) {
        if (!objects[loadedObject] || !objects[loadedObject].img.naturalWidth) {
            loaded = false;
        }
    }

    return loaded;
}

const updateAnimations = () => {
    const now = Date.now();

    animations.forEach(animation => {
        if (now - animation.timeOut > animation.lastUpdate) {
            animation.frame++;

            if (animation.frame === animation.endFrame) {
                animation.frame = animation.startFrame;

                if (animation.callback) {
                    animation.callback(animation.id, animation.id);
                }
            }

            animation.lastUpdate = now;
        }
    })
}

const registerAnimation = (handle, characterId, options) => {
    const spriteSheet = helpers.SpriteSheet.getSpriteSheetByHandle(handle, spriteSheets);
    const animation = helpers.Animation.getAnimationById(characterId, animations);

    if (!animation) {
        animations.push(
            {
                id: characterId,
                handle: handle,
                frame: spriteSheet.startFrame,
                startFrame: spriteSheet.startFrame,
                endFrame: spriteSheet.endFrame,
                timeOut: spriteSheet.timeOut,
                lastUpdate: 0, // timestamp
                ...options
            }
        );
    }
}

// draws the player on screen
const drawPlayer = () => {
    let spriteHandle;

    switch(player.direction) {
        case 'left':
            spriteHandle = 'hero_sheet_left';
            break;
        case 'right':
            spriteHandle = 'hero_sheet_right';
            break;
        case 'up':
            spriteHandle = 'hero_sheet_up';
            break;
        case 'down':
        default:
            spriteHandle = 'hero_sheet_down';
            break;
    }

    const imageObject = helpers.SpriteSheet.getSpriteSheetByHandle(spriteHandle, spriteSheets);
    const animationOffset = helpers.Animation.getAnimationOffset(1, animations); // hardcoded for 1, which is player

    context.save();

    // move context to match innerMap coordinates
    context.translate(innerMap.x, innerMap.y);

    // manually tweak the positioning of the player sprite so it becomes centered in relation to the tile
    const centeredX = -engine.tileWidth / 2;
    const centeredY = -engine.tileHeight / 2;
    context.translate(centeredX, centeredY);

    // ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
    // only if you include all these params, are you able to clip the image. clip start is sx, sy, sWidth and sHeight determine
    // the clip dimensions, x, y set the starting position (upper-left corner) and width, height are the final sprite dimensions
    context.drawImage(imageObject.img, animationOffset * 50, 0, player.width, player.height, 0, 0, player.width, player.height);

    // show player hit box
    if (engine.debug) {
        context.strokeStyle = '#ff0000';
        context.strokeRect(0, 0, 50, 50);
    }

    context.restore();
}


// draws all tiles within range
const drawTiles = () => {
    for (let y = -engine.tileHeight; y < 800; y += engine.tileHeight) {
        for (let x = -engine.tileWidth; x < (800 + 2 * engine.tileWidth); x += engine.tileWidth) {
            const tileX = Math.floor((player.x + x - innerMap.x) / engine.tileWidth);
            const tileY = Math.floor((player.y + y - innerMap.y) / engine.tileHeight);

            if (tileX < 0 || tileY < 0 || tileX > (area[0].length - 1) || tileY > (area.length - 1)) {

                // nothing to render here: at the edge of the map and trying to render a tile beyond the area limits

            } else {
                const tileId = area[tileY][tileX];

                let posX, posY;

                if (innerMap.x >= 400) {
                    const diffToX = innerMap.x - 400;
                    const startX = (player.x - diffToX) - 400;
                    posX = x - (startX % engine.tileWidth);
                } else {
                    const diffToX = 400 - innerMap.x;
                    const startX = 400 - (player.x + diffToX);
                    posX = x + (startX % engine.tileWidth);
                }

                if (innerMap.y >= 300) {
                    const diffToY = innerMap.y - 300;
                    const startY = (player.y - diffToY) - 300;
                    posY = y - (startY % engine.tileHeight);
                } else {
                    const diffToY = 300 - innerMap.y;
                    const startY = 300 - (player.y + diffToY);
                    posY = y + (startY % engine.tileHeight);
                }

                helpers.Tile.drawTileAt(posX, posY, helpers.Tile.getTileById(tileId, tiles), engine, context);
            }
        }
    }
}

// draws all objects within range
const drawObjects = () => {

    // determine range
    let startGridX = Math.floor((player.x - innerMap.x) / engine.tileWidth);
    let endGridX = Math.floor((player.x + 900 - innerMap.x) / engine.tileWidth);
    let startGridY = Math.floor((player.y - innerMap.y) / engine.tileHeight);
    let endGridY = Math.floor((player.y + 800 - innerMap.y) / engine.tileHeight);

    // reduce objects collection
    tempObjects = objects.filter(obj =>
        obj.gridX >= startGridX &&
        obj.gridX <= endGridX &&
        obj.gridY >= startGridY &&
        obj.gridY <= endGridY);

    // draw objects
    tempObjects.forEach(obj => {
        context.drawImage(
            obj.img,
            (obj.gridX * engine.tileWidth) - player.x + innerMap.x,
            (obj.gridY * engine.tileHeight) - player.y + innerMap.y,
            obj['img'].width,
            obj['img'].height
        );
    });
}

const getPathToPlayer = character => {

    // you need to re-instantiate the grid for each call! see https://github.com/qiao/PathFinding.js/issues/109
    const grid = createPathfindingGrid();

    return finder.findPath(
        helpers.Grid.xToGridX(character.x),
        helpers.Grid.yToGridY(character.y),
        helpers.Grid.xToGridX(player.x),
        helpers.Grid.yToGridY(player.y),
        grid
    );
}

// draws all characters within range
const drawCharacters = () => {

    // determine range
    let startX = Math.floor((player.x - innerMap.x - 100));
    let endX = Math.floor((player.x + 900 - innerMap.x));
    let startY = Math.floor((player.y - innerMap.y - 100));
    let endY = Math.floor((player.y + 800 - innerMap.y));

    tempCharacters = characters.filter(char =>
        char.x >= startX &&
        char.x <= endX &&
        char.y >= startY &&
        char.y <= endY);

    // draw characters
    tempCharacters.forEach(char => {
        let spriteSheetOffset = helpers.Animation.getAnimationOffset(char.id, animations);

        // unlike objects, the characters are animated and its image object resides therefore not in the main characters
        // nor the tempCharacters, but the image collection
        let imgData = helpers.SpriteSheet.getSpriteSheetByHandle(char.handle, spriteSheets);

        context.drawImage(
            imgData.img,
            (spriteSheetOffset * 50),
            0,
            50, // fixed for now
            50, // fixed for now
            char.x - player.x + innerMap.x,
            char.y - player.y + innerMap.y,
            50,
            50
        );
    });
}

const moveCharacters = () => {

    // work solely with tempCharacters which is already limited to characters that are (almost) on screen
    tempCharacters.forEach(character => {
        const directPath = getPathToPlayer(character);

        if (!character.destX || !character.destY) {
            if (directPath && directPath.length > 2) {

                // if within range, skip first (own position) and last (player position) and set it as new destination
                if (directPath.length < character.lineOfSight) {
                    directPath.pop();
                    let nextDest = directPath[1];
                    character.destX = nextDest[0];
                    character.destY = nextDest[1];
                } else {

                    // player is too far away, reset destination to starting coordinates
                    character.destX = character.startGridX;
                    character.destY = character.startGridY;
                }
            } else {

                // rotate towards player
                character.handle = helpers.Character.getOrientatedCharacterHandle(character, player);

            }
        } else {
            const speed = character.speed;
            const destX = character.destX;
            const destY = character.destY;

            // move character towards destination, preventing overflow, and using the correctly orientated spriteSheet
            if (character.x < helpers.Grid.gridXtoX(destX)) {
                character.x += speed;
                if (character.x > helpers.Grid.gridXtoX(destX)) { character.x = helpers.Grid.gridXtoX(destX) }
                character.handle = `${character.handlePrefix}_right`;
                helpers.Animation.unRegisterUnusedAnimations(character.handle, character.id, animations);
                registerAnimation(`${character.handlePrefix}_right`, character.id);
            } else if (character.x > helpers.Grid.gridXtoX(destX)) {
                character.x -= speed;
                if (character.x < helpers.Grid.gridXtoX(destX)) { character.x = helpers.Grid.gridXtoX(destX) }
                character.handle = `${character.handlePrefix}_left`;
                helpers.Animation.unRegisterUnusedAnimations(character.handle, character.id, animations);
                registerAnimation(`${character.handlePrefix}_left`, character.id);
            } else if (character.y < helpers.Grid.gridYtoY(destY)) {
                character.y += speed;
                if (character.y > helpers.Grid.gridYtoY(destY)) { character.y = helpers.Grid.gridYtoY(destY) }
                character.handle = `${character.handlePrefix}_down`;
                helpers.Animation.unRegisterUnusedAnimations(character.handle, character.id, animations);
                registerAnimation(`${character.handlePrefix}_down`, character.id);
            } else if (character.y > helpers.Grid.gridYtoY(destY)) {
                character.y -= speed;
                if (character.y < helpers.Grid.gridYtoY(destY)) { character.y = helpers.Grid.gridYtoY(destY) }
                character.handle = `${character.handlePrefix}_up`;
                helpers.Animation.unRegisterUnusedAnimations(character.handle, character.id, animations);
                registerAnimation(`${character.handlePrefix}_up`, character.id);
            }

            // prevent moving to the exact tile the player is at
            if (character.destX === helpers.Grid.xToGridX(player.x) && character.destY === helpers.Grid.yToGridY(player.y)) {
                character.destX = character.startGridX;
                character.destY = character.startGridY;
            }

            // destination is reached: stop animation
            if (character.x === helpers.Grid.gridXtoX(destX) && character.y === helpers.Grid.gridYtoY(destY)) {
                helpers.Animation.unRegisterUnusedAnimations(null, character.id, animations);

                // prevent moving to the exact tile the player is at
                if (helpers.Grid.xToGridX(character.x) === helpers.Grid.xToGridX(player.x) && helpers.Grid.yToGridY(character.y) === helpers.Grid.yToGridY(player.y)) {
                    character.destX = character.startGridX;
                    character.destY = character.startGridY;
                } else {

                    // destination is reached: clear destination coordinates
                    character.destX = null;
                    character.destY = null;

                    // check if within attack range, if so, call attack helper function
                    const path = getPathToPlayer(character);

                    if (path && path.length > 0 && path.length <= 2) {
                        attackPlayer(character);
                    }
                }
            }

            // destination is set back to starting position (happens on reset, or when player is out of range)
            if (character.destX === character.startGridX && character.destY === character.startGridY) {
                if (directPath && directPath.length > 2) {

                    // if within range, skip first (own position) and last (player position) and set it as new destination
                    if (directPath.length < character.lineOfSight) {
                        directPath.pop();
                        let nextDest = directPath[1];
                        character.destX = nextDest[0];
                        character.destY = nextDest[1];
                    }
                }
            }
        }
    });
}

const checkAttackRange = (id, characterId) => {
    const character = helpers.Character.getCharacterById(characterId, characters)
    const path = getPathToPlayer(character);

    if (path && path.length <= 2 && path.length > 0) {

        // re-register attack since still in range
        attackPlayer(character);
    }
}

const attackPlayer = character => {
    registerAnimation(
        character.handle,
        character.id,
        {
            startFrame: 8,
            frame: 8, // also set frame so it begins at this
            endFrame: 12,
            callback: id => {
                helpers.Animation.unRegisterAnimation(id, animations);
                checkAttackRange(id, character.id);
            }
        });

    createHitAnimation(player.x, player.y)
}

const createHitAnimation = (x, y) => {
    const xPos = x - player.x + innerMap.x - 25;
    const yPos = y - player.y + innerMap.y - 25;

    hitAnimations.push({
        x: xPos,
        y: yPos,
        timer: 0
    })
}

const drawHitAnimations = () => {
    hitAnimations.forEach((hitAnimation, index) => {
        context.fillStyle = "#ff0000";
        context.fillRect(hitAnimation.x, hitAnimation.y, 50/hitAnimation.timer, 50/hitAnimation.timer);
        hitAnimation.timer++;

        if (hitAnimation.timer > 10) {
            hitAnimations.splice(index, 1);
        }
    })
}

const movePlayer = () => {
    const oldX = player.x;
    const oldY = player.y;
    const oldInnerMapX = innerMap.x;
    const oldInnerMapY = innerMap.y;
    const speed = player.speed;

    // the outerMap dimensions are as wide as the defined area (array) minus an offset to ensure screen is always filled up with grid
    const outerMapWidth = area[0].length * engine.tileWidth - 200;
    const outerMapHeight = area.length * engine.tileHeight - 200;

    // innerMap limits are 200px from x, y game borders (800x600), so left & right: 200-600 and up & down: 200-400

    if (engine.keys.right) {
        const innerMapLimit = 600 - (engine.tileWidth / 2);
        const outerMapLimit = outerMapWidth - (engine.tileWidth / 2);
        if (player.x <= outerMapLimit && (player.x + speed) <= outerMapLimit) { player.x += speed } else { player.x = outerMapLimit }
        if (innerMap.x <= innerMapLimit && (innerMap.x + speed) <= innerMapLimit) { innerMap.x += speed } else { innerMap.x = innerMapLimit }
    } else if (engine.keys.left) {
        const innerMapLimit = 200 + (engine.tileWidth / 2);
        const outerMapLimit = 200 + (engine.tileWidth / 2);
        if (player.x >= outerMapLimit && (player.x - speed) >= outerMapLimit) { player.x -= speed } else { player.x = outerMapLimit }
        if (innerMap.x >= innerMapLimit && (innerMap.x - speed) >= innerMapLimit) { innerMap.x -= speed } else { innerMap.x = innerMapLimit }
    } else if (engine.keys.down) {
        const innerMapLimit = 400 - (engine.tileHeight / 2);
        const outerMapLimit = outerMapHeight - (engine.tileHeight / 2);
        if (player.y <= outerMapLimit && (player.y + speed) <= outerMapLimit) { player.y += speed } else { player.y = outerMapLimit }
        if (innerMap.y <= innerMapLimit && (innerMap.y + speed) <= innerMapLimit) { innerMap.y += speed } else { innerMap.y = innerMapLimit }
    } else if (engine.keys.up) {
        const innerMapLimit = 200 + (engine.tileHeight / 2);
        const outerMapLimit = 200 + (engine.tileHeight / 2);
        if (player.y >= outerMapLimit && (player.y - speed) >= outerMapLimit) { player.y -= speed } else { player.y = outerMapLimit }
        if (innerMap.y >= innerMapLimit && (innerMap.y - speed) >= innerMapLimit) { innerMap.y -= speed } else { innerMap.y = innerMapLimit }
    }

    // deal with tiles and objects, handing over the old position coordinates in case player moved to invalid tile or location
    handleTileCollision(oldX, oldY, oldInnerMapX, oldInnerMapY);
    handleObjectCollision(oldX, oldY, oldInnerMapX, oldInnerMapY);
    handleCharacterCollision(oldX, oldY, oldInnerMapX, oldInnerMapY);
}

const handleTileCollision = (oldX, oldY, oldInnerMapX, oldInnerMapY) => {
    const tileType = helpers.Tile.getTileForCurrentGridPosition(player, area, tiles);

    // player moves through liquid
    if (tileType.structure === Structures.LIQUID) {
        player.speed = playerSpeed / 2;
        player.height = playerHeight / 1.4;
    } else {
        player.speed = playerSpeed;
        player.height = playerHeight;
    }

    if (tileType.structure === Structures.BLOCK) {

        // reset due to obstacle
        player.x = oldX;
        player.y = oldY;
        innerMap.x = oldInnerMapX;
        innerMap.y = oldInnerMapY;
    } else {
        // deal with other types of tile Structures like mud, fire, snow, locked doors etc
    }
}

const handleObjectCollision = (oldX, oldY, oldInnerMapX, oldInnerMapY) => {
    let currentObject = helpers.Object.getObjectForCurrentGridPosition(player, tempObjects);

    if (currentObject && currentObject.structure === Structures.BLOCK) {

        // reset due to obstacle
        player.x = oldX;
        player.y = oldY;
        innerMap.x = oldInnerMapX;
        innerMap.y = oldInnerMapY;
    } else {
        // deal with other types of object Structures like pick-ups, death traps etc.
    }
}

const handleCharacterCollision = (oldX, oldY, oldInnerMapX, oldInnerMapY) => {
    let currentCharacter = helpers.Character.getCharacterForCurrentGridPosition(player, tempCharacters);

    if (currentCharacter) {

        // reset due to obstacle
        player.x = oldX;
        player.y = oldY;
        innerMap.x = oldInnerMapX;
        innerMap.y = oldInnerMapY;
    }
}

const updateCanvas = timestamp => {
    helpers.Canvas.clearCanvas(context);

    if (assetsLoaded) {
        movePlayer();
        moveCharacters();
        updateAnimations();
        drawTiles();
        drawObjects();
        drawCharacters();
        drawPlayer();
        drawHitAnimations();

        if (engine.rasterLines) { helpers.Canvas.rasterLines(context) }

        if (engine.debug) {
            const debugElem = document.querySelector('#debug');
            const now = performance.now();
            const gridX = helpers.Grid.xToGridX(player.x);
            const gridY = helpers.Grid.yToGridY(player.y);

            while (engine.fpsTimer.length > 0 && engine.fpsTimer[0] <= now - 1000) { engine.fpsTimer.shift() }
            engine.fpsTimer.push(now);
            if (debugElem) { debugElem.innerHTML = `playerX: ${player.x} innerMapX: ${innerMap.x} gridX: ${gridX} playerY: ${player.y} innerMapY:${innerMap.y} gridY: ${gridY} fps: ${engine.fpsTimer.length}` }
        }
    }

    if (!assetsLoaded) {
        if (checkLoadedAssets()) {
            assetsLoaded = true;
        }

        // loader
        context.font = "30px Trebuchet MS";
        context.fillStyle = "#fff";
        context.fillText("loading", (800 / 2) - (context.measureText("loading").width / 2), 250);
    }

    if (!start) { start = timestamp }
    progress = timestamp - start;
    if (progress < 1000) { start = null }

    // re-trigger update function
    setTimeout(updateCanvas, 15); // 15ms is about 60fps. despite what I've always said: do not use requestAnimationFrame!
}

// initialise the images in tiles, spriteSheets and objects by loading the bitmap data into the placeholder objects
tiles.map(image => { loadImage(image) });
spriteSheets.map(image => { loadImage(image) });
objects.map(object => { loadImage(object) });

const createPathfindingGrid = () => {

    // 'PF' will be initialised at runtime due to html include. also note the parameters are x,y hence the [0] for x
    let internalGrid = new PF.Grid(area[0].length, area.length);

    for (let a = 0; a < area.length; a ++) {
        for (let b = 0; b < area[a].length; b ++) {
            if (area[a][b] < 901 || area[a][b] === 903) {

                // found non-traversable tile (basically everything under 901)
                internalGrid.setWalkableAt(b, a, false);
            }
        }
    }

    // check objects
    for (let c = 0;c < tempObjects.length; c ++) {
        let x = tempObjects[c].gridX;
        let y = tempObjects[c].gridY;
        internalGrid.setWalkableAt(x, y, false);
    }

    // check characters
    for (let c = 0;c < tempCharacters.length; c ++) {

    // block current paths
        let x = helpers.Grid.xToGridX(tempCharacters[c].x)
        let y = helpers.Grid.yToGridY(tempCharacters[c].y)
        internalGrid.setWalkableAt(x, y, false);

        // also block destination paths
        x = tempCharacters[c].destX;
        y = tempCharacters[c].destY;

        if (x && y) {
            internalGrid.setWalkableAt(x, y, false);
        }
    }
    return internalGrid;
}

const finder = new PF.DijkstraFinder();

// disable page movement when using the cursor keys
window.addEventListener('keydown', e => {
    if ([37, 38, 39, 40, 65, 68, 73, 77, 83, 84, 87].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

// register document key functions
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

// register global window event listener for click events
window.addEventListener('click', clickHandler);

// trigger update function once
setTimeout(updateCanvas, 0);
