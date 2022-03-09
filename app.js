
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
import Effects from './constants/Effects.js';

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
    attacking: false,
    strength: 10,
    coins: 100
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

// objects defining graphical effects
const effects = [];

// holds the reduced objects, only the ones that are (almost) in view
let tempObjects = []; // todo: rename visibleObjects?

// holds the reduced characters, only the ones that are (almost) in view
let tempCharacters = []; // todo: rename visibleCharacters?

// set some vars that handle key mapping
let KEYCODE_LEFT = 37,
    KEYCODE_UP = 38,
    KEYCODE_RIGHT = 39,
    KEYCODE_DOWN = 40,
    KEYCODE_SPACE = 32,
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
        case KEYCODE_SPACE:
            if (!player.attacking) {

                // stop walking animation
                helpers.Animation.unRegisterAnimation(1, animations);

                // set flag so you cannot attack when already doing so
                player.attacking = true;

                registerAnimation(
                    `hero_sheet_${player.direction}`,
                    1, // hardcoded for 1, which is player
                    {
                        startFrame: 8,
                        frame: 8, // override current frame
                        endFrame: 12,
                        callback: id => {
                            handleAfterAttack(id);
                        }
                    });

                helpers.Sound.playSound('assets/sounds/swish.wav');
            }

            break;
    }
}

const handleKeyUp = e => {
    if (player.attacking) {

        // ensure the attack anim has fully played before player can switch direction
        return false;
    }

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

const handleAfterAttack = id => {
    // remove this animation instance after it has finished playing
    helpers.Animation.unRegisterAnimation(id, animations);

    // reset the flag so you can attack again
    player.attacking = false;

    let char = null;

    if (player.direction === 'right') { char = helpers.Character.getCharacterForGridPosition(helpers.Grid.xToGridX(player.x + 25) + 1, helpers.Grid.yToGridY(player.y + 25), tempCharacters); }
    if (player.direction === 'left') { char = helpers.Character.getCharacterForGridPosition(helpers.Grid.xToGridX(player.x + 25) - 1, helpers.Grid.yToGridY(player.y + 25), tempCharacters);}
    if (player.direction === 'up') { char = helpers.Character.getCharacterForGridPosition(helpers.Grid.xToGridX(player.x + 25), helpers.Grid.yToGridY(player.y + 25) -1, tempCharacters); }
    if (player.direction === 'down') { char = helpers.Character.getCharacterForGridPosition(helpers.Grid.xToGridX(player.x + 25), helpers.Grid.yToGridY(player.y + 25) +1, tempCharacters); }

    if (char) {
        char.health -= player.strength;

        if (char.health < 0) {
            helpers.Effect.createSmoke(
                char.x,
                char.y,
                '#000000',
                { x: char.x, y: char.y },
                effects
            );

            const nextId = findNextUnusedId(animations);

            // construct coin object
            const coinObj =
                {
                    id: nextId,
                    gridX: helpers.Grid.xToGridX(char.x),
                    gridY: helpers.Grid.yToGridY(char.y),
                    handle: 'coin',
                    src: '/assets/objects/103_coin.png',
                    img: new Image(), // this is not initialised when you push it like this
                    structure: Structures.PICKUP, // trap, item etc. todo: or just solid, liquid etc?
                    status: 'shown' // picked up etc. todo: can be removed?
                };

            // ensure the source is loaded
            coinObj['img'].src = coinObj['src'];

            // push to objects
            objects.push(coinObj);

            // remove defeated character
            helpers.Character.removeCharacterById(char.id, characters);

            // register the coin animation
            registerAnimation('coin', nextId);
        } else {
            helpers.Effect.createSmoke(
                char.x,
                char.y,
                '#ccccff',
                { x: char.x, y: char.y },
                effects
            );
        }
    }
}

// todo: move to utils
const findNextUnusedId = arr => {
    let a = 2; // skip 1 since that is hard-coded to be used for player anim

    while (arr.filter(entry => entry.id === a) && arr.filter(entry => entry.id === a)[0]) {
        a++;
    }

    return a;
}

// it only updates the frame counter, nothing more
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

// todo: move to Animation.js
const registerAnimation = (animationHandle, animationId, options) => {
    const spriteSheet = helpers.SpriteSheet.getSpriteSheetByHandle(animationHandle, spriteSheets);
    const animationObj = helpers.Animation.getAnimationByIdAndHandle(animationId, animationHandle, animations);

    // only push if it did not exist already, or it will keep repeating the first frame
    if (!animationObj) {
        animations.push(
            {
                // id: spriteSheet,
                id: animationId,
                handle: animationHandle,
                frame: spriteSheet.startFrame,
                startFrame: spriteSheet.startFrame,
                endFrame: spriteSheet.endFrame,
                timeOut: spriteSheet.timeOut,
                lastUpdate: 0,
                ...options
            }
        );
    }
}

// draws the player on screen
const drawPlayer = () => {
    let spriteHandle;

    switch (player.direction) {
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
    let animationOffset = helpers.Animation.getAnimationOffset(1, spriteHandle, animations); // hardcoded for 1, which is player

    context.save();

    // move context to match innerMap coordinates
    context.translate(innerMap.x, innerMap.y);

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
        let animationOffset = helpers.Animation.getAnimationOffset(obj.id, obj.handle, animations);

        // the clip dimensions, x, y set the starting position (upper-left corner) and width, height are the final sprite dimensions
        context.drawImage(
            obj.img,
            animationOffset * 50,
            0,
            50,
            50,
            (obj.gridX * engine.tileWidth) - player.x + innerMap.x,
            (obj.gridY * engine.tileHeight) - player.y + innerMap.y,
            50,
            50
        );
    });
}

const getPathToPlayer = character => {

    // you need to re-instantiate the grid for each call! see https://github.com/qiao/PathFinding.js/issues/109
    const grid = createPathfindingGrid();

    return finder.findPath(
        helpers.Grid.xToGridX(character.x),
        helpers.Grid.yToGridY(character.y),
        helpers.Grid.xToGridX(player.x + 25),
        helpers.Grid.yToGridY(player.y + 25),
        grid
    );
}

// draws all characters within range
const drawCharacters = mode => {

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
        const spriteSheetOffset = helpers.Animation.getAnimationOffset(char.id, char.handle, animations);
        const imgData = helpers.SpriteSheet.getSpriteSheetByHandle(char.handle, spriteSheets);
        const yPos = char.y - player.y + innerMap.y;

        if (mode === 'under' && yPos <= innerMap.y) {
            context.drawImage(
                imgData.img,
                (spriteSheetOffset * 50),
                0,
                50, // fixed for now
                50, // fixed for now
                char.x - player.x + innerMap.x,
                yPos,
                50,
                50
            );
        }

        if (mode === 'over' && yPos > innerMap.y) {
            context.drawImage(
                imgData.img,
                (spriteSheetOffset * 50),
                0,
                50, // fixed for now
                50, // fixed for now
                char.x - player.x + innerMap.x,
                yPos,
                50,
                50
            );
        }
    });
}

const moveCharacters = () => {

    // work solely with tempCharacters which is already limited to characters that are (almost) on screen
    tempCharacters.forEach(character => {
        const directPath = getPathToPlayer(character);

        if (!character.destX || !character.destY) {
            if (directPath && directPath.length > 2) {

                character.attackTimer = 50;

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

                // starting attack timer
                character.attackTimer++;

                if (character.attackTimer >= character.attackInterval) {
                    character.attackTimer = 0;

                    if (withinAttackRange(character)) {
                        attackPlayer(helpers.Character.getCharacterById(character.id, characters));
                    }
                }
            }
        } else {
            const speed = character.speed;
            const destX = character.destX;
            const destY = character.destY;

            character.attackTimer = 50;

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
            if (character.destX === helpers.Grid.xToGridX(player.x + 25) && character.destY === helpers.Grid.yToGridY(player.y + 25)) {
                character.destX = character.startGridX;
                character.destY = character.startGridY;
            }

            // destination is reached: stop animation
            if (character.x === helpers.Grid.gridXtoX(destX) && character.y === helpers.Grid.gridYtoY(destY)) {
                helpers.Animation.unRegisterUnusedAnimations(null, character.id, animations);

                // destination is reached: clear destination coordinates
                character.destX = null;
                character.destY = null;

                character.attackTimer++;

                if (character.attackTimer >= character.attackInterval) {
                    character.attackTimer = 0;

                    if (withinAttackRange(character)) {
                        attackPlayer(helpers.Character.getCharacterById(character.id, characters));
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

const withinAttackRange = character => {
    const path = getPathToPlayer(character);

    return path && path.length <= 2 && path.length > 0;
}

const attackPlayer = character => {
    registerAnimation(
        character.handle,
        character.id,
        {
            startFrame: 8,
            frame: 8, // override current frame
            endFrame: 12,
            callback: id => {

                // remove this animation instance after it has finished playing
                helpers.Animation.unRegisterAnimation(id, animations);
            }
        });

    helpers.Sound.playSound('assets/sounds/sword.wav');
    helpers.Sound.playSound('assets/sounds/coins.wav');

    helpers.Effect.createSmoke(
    innerMap.x,
    innerMap.y,
        '#ccccff',
        player,
        effects
    );

    helpers.Effect.createCoins(
        innerMap.x,
        innerMap.y,
        player,
        effects
    );

    player.coins -= 5;

    if (player.coins < 0) {
        console.log('player ded')
    }
}

const drawEffects = (mode) => {
    effects.forEach((effect, index) => {

        // calculate difference between positions now and at the time of creating the effect to avoid effects showing
        // up in the wrong places (especially when moving around after an effect was triggered)
        const mapDiffX = (player.x - innerMap.x) - (effect.startAffectedCharacterX - effect.startX);
        const mapDiffY = (player.y - innerMap.y) - (effect.startAffectedCharacterY - effect.startY);

        switch (effect.type) {
            case Effects.SMOKE:
                if (mode === effect.placement) {
                    context.save();
                    const centeredX = -engine.tileWidth / 2;
                    const centeredY = -engine.tileHeight / 2;
                    context.translate(centeredX, centeredY);
                    context.globalAlpha = .4;
                    context.beginPath();
                    context.arc(effect.x - mapDiffX, effect.y - mapDiffY, effect.radius, 0, 2 * Math.PI, false);
                    context.fillStyle = effect.color;
                    context.fill();
                    context.restore();

                    effect.counter++;
                    effect.radius > 1 && effect.radius--;
                    effect.y -= (25 - effect.radius) / 5;

                    if (effect.counter > 35) {
                        effects.splice(index, 1);
                    }
                }
                break;
            case Effects.COINS:
                if (mode === effect.placement) {
                    context.save();
                    context.beginPath();
                    context.fillStyle = '#ffd700';
                    context.arc(
                        ((effect.x += effect.addX / effect.counter)) - mapDiffX,
                        effect.y - mapDiffY,
                        effect.radius,
                        0,
                        2 * Math.PI,
                        false
                    );
                    context.fill();
                    context.strokeStyle= '#8F7900';
                    context.stroke();
                    context.globalAlpha = .4;
                    context.restore();

                    effect.counter += .2;
                    effect.y -= (((6 - effect.counter) * Math.sin(effect.counter)) / 3);

                    if (effect.counter >= 2.6 * Math.PI) {
                        effects.splice(index, 1);
                    }
                }
                break;
            default:
                break;
        }
    });
}

const movePlayer = () => {
    const oldX = player.x;
    const oldY = player.y;
    const oldInnerMapX = innerMap.x;
    const oldInnerMapY = innerMap.y;
    const speed = player.speed;

    // the outerMap dimensions are as wide as the defined area (array) minus an offset to ensure screen is always filled up with grid
    const outerMapWidth = area[0].length * engine.tileWidth - 250;
    const outerMapHeight = area.length * engine.tileHeight - 250;

    // innerMap limits are 200px from x, y game borders (800x600), so left & right: 200-600 and up & down: 200-400

    const correction = 0; // engine.tileWidth / 2;

    if (engine.keys.right) {
        const innerMapLimit = 600 - correction;
        const outerMapLimit = outerMapWidth - correction;
        if (player.x <= outerMapLimit && (player.x + speed) <= outerMapLimit) { player.x += speed } else { player.x = outerMapLimit }
        if (innerMap.x <= innerMapLimit && (innerMap.x + speed) <= innerMapLimit) { innerMap.x += speed } else { innerMap.x = innerMapLimit }
    } else if (engine.keys.left) {
        const innerMapLimit = 200 + correction;
        const outerMapLimit = 200 + correction;
        if (player.x >= outerMapLimit && (player.x - speed) >= outerMapLimit) { player.x -= speed } else { player.x = outerMapLimit }
        if (innerMap.x >= innerMapLimit && (innerMap.x - speed) >= innerMapLimit) { innerMap.x -= speed } else { innerMap.x = innerMapLimit }
    } else if (engine.keys.down) {
        const innerMapLimit = 400 - correction;
        const outerMapLimit = outerMapHeight - correction;
        if (player.y <= outerMapLimit && (player.y + speed) <= outerMapLimit) { player.y += speed } else { player.y = outerMapLimit }
        if (innerMap.y <= innerMapLimit && (innerMap.y + speed) <= innerMapLimit) { innerMap.y += speed } else { innerMap.y = innerMapLimit }
    } else if (engine.keys.up) {
        const innerMapLimit = 200 + correction;
        const outerMapLimit = 200 + correction;
        if (player.y >= outerMapLimit && (player.y - speed) >= outerMapLimit) { player.y -= speed } else { player.y = outerMapLimit }
        if (innerMap.y >= innerMapLimit && (innerMap.y - speed) >= innerMapLimit) { innerMap.y -= speed } else { innerMap.y = innerMapLimit }
    }

    // deal with tiles and objects, handing over the old position coordinates in case player moved to invalid tile or location
    handleTileCollision(oldX, oldY, oldInnerMapX, oldInnerMapY);
    handleObjectCollision(oldX, oldY, oldInnerMapX, oldInnerMapY);
    handleCharacterCollision(oldX, oldY, oldInnerMapX, oldInnerMapY);
}

const handleTileCollision = (oldX, oldY, oldInnerMapX, oldInnerMapY) => {
    const gridX = helpers.Grid.xToGridX(player.x + 25);
    const gridY = helpers.Grid.yToGridY(player.y + 25);

    const tileType = helpers.Tile.getTileForGridPosition(gridX, gridY, area, tiles);

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
    const gridX = helpers.Grid.xToGridX(player.x + 25);
    const gridY = helpers.Grid.yToGridY(player.y + 25);

    let currentObject = helpers.Object.getObjectForGridPosition(gridX, gridY, tempObjects);

    if (currentObject && currentObject.structure === Structures.BLOCK) {

        // reset due to obstacle
        player.x = oldX;
        player.y = oldY;
        innerMap.x = oldInnerMapX;
        innerMap.y = oldInnerMapY;
    } else if (currentObject && currentObject.structure === Structures.PICKUP) {
        console.log('pick up');
        player.coins += 10; // hard coded, should be determined by object somehow

        // remove it todo: call helper for this
        const objIndex = objects.findIndex(obj => obj.id === currentObject.id);

        if (objIndex) {
            objects.splice(objIndex, 1)
        }
    } else {
        // deal with other types of object Structures like pick-ups, death traps etc.
    }
}

const handleCharacterCollision = (oldX, oldY, oldInnerMapX, oldInnerMapY) => {
    let currentCharacter = helpers.Character.getCharacterForGridPosition(helpers.Grid.xToGridX(player.x + 25), helpers.Grid.yToGridY(player.y + 25), tempCharacters);

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
        drawEffects('under');
        drawCharacters('under');
        drawPlayer();
        drawCharacters('over');
        drawEffects('over');

        if (engine.rasterLines) { helpers.Canvas.rasterLines(context) }

        if (engine.debug) {
            const debugElem = document.querySelector('#debug');
            const now = performance.now();
            const gridX = helpers.Grid.xToGridX(player.x + 25);
            const gridY = helpers.Grid.yToGridY(player.y + 25);

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

            // tood: you want to store this in a lookup array somewhere
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
