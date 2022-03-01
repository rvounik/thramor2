import helpers from './helpers/index.js';

import Structures from './constants/Structures.js';
import CharacterTypes from './constants/CharacterTypes.js';

let start = null;
let progress = 0;

// player coordinates on innerMap (200 - 600, 100 - 500)
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

// note the outside 4 grid units are not traversable, therefore its turned into water
let area = [
    [900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900],
    [900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900],
    [900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900],
    [900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,902,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,901,902,901,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,902,901,901,901,901,901,903,903,901,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,903,903,901,901,901,901,901,901,902,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,902,901,901,901,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,902,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,902,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,901,901,902,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,111,902,901,901,901,901,901,112,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,108,901,901,901,901,107,107,109,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,108,901,901,901,110,104,104,105,901,902,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,108,901,901,901,110,101,113,102,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,106,107,107,107,109,901,902,901,901,901,901,901,901,901,901,901,901,902,900,900,900,900],
    [900,900,900,900,901,902,901,901,103,104,104,104,105,901,901,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,100,101,101,101,102,901,901,901,901,901,901,901,901,901,901,902,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,901,901,901,901,901,902,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,902,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,901,902,901,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,902,901,902,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,901,901,901,902,901,901,901,901,901,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,901,902,901,901,901,901,901,900,900,900,900],
    [900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900],
    [900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900],
    [900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900],
    [900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900,900]
];

// all non-playing characters are stored here
let characters = [
    {
        id: 100, // give each one a unique id. this is required for the animations
        startGridX: 17,
        startGridY: 6,
        x: helpers.Grid.gridXtoX(17),
        y: helpers.Grid.gridYtoY(6),
        destX: null,
        destY: null,
        speed: 1,
        handlePrefix: 'bandit_sheet',
        handle: 'bandit_sheet_down',
        type: CharacterTypes.ENEMY,
        lineOfSight: 10
    },
    {
        id: 101, // give each one a unique id. this is required for the animations
        startGridX: 18,
        startGridY: 6,
        x: helpers.Grid.gridXtoX(18),
        y: helpers.Grid.gridYtoY(6),
        destX: null,
        destY: null,
        speed: 1,
        handlePrefix: 'bandit_sheet',
        handle: 'bandit_sheet_down',
        type: CharacterTypes.ENEMY,
        lineOfSight: 10
    },
    {
        id: 102, // give each one a unique id. this is required for the animations
        startGridX: 19,
        startGridY: 6,
        x: helpers.Grid.gridXtoX(19),
        y: helpers.Grid.gridYtoY(6),
        destX: null,
        destY: null,
        speed: 1,
        handlePrefix: 'bandit_sheet',
        handle: 'bandit_sheet_down',
        type: CharacterTypes.ENEMY,
        lineOfSight: 10
    },
];

let objects = [
    {
        id: 100,
        gridX: 7,
        gridY: 7,
        handle: '103_rock_front_top_left',
        src: '/assets/objects/100_rock_a.png',
        img: new Image(),
        structure: Structures.BLOCK, // trap, item etc.
        status: 'shown' // picked up etc.
    },
]

// holds the reduced objects, only the ones that are (almost) in view
let tempObjects = [];

// holds the reduced characters, only the ones that are (almost) in view
let tempCharacters = [];

// set some vars that handle key mapping
let KEYCODE_LEFT = 37,
    KEYCODE_UP = 38,
    KEYCODE_RIGHT = 39,
    KEYCODE_DOWN = 40,
    KEYCODE_DEBUG = 68;

// get the canvas context
const context = document.getElementById('canvas').getContext('2d');

const handleKeyDown = e => {
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
            unRegisterAnimation( 'hero_sheet_left', 1);
            break;
        case KEYCODE_RIGHT:
            engine.keys.right = false;
            unRegisterAnimation( 'hero_sheet_right', 1);
            break;
        case KEYCODE_UP:
            engine.keys.up = false;
            unRegisterAnimation('hero_sheet_up', 1);
            break;
        case KEYCODE_DOWN:
            engine.keys.down = false;
            unRegisterAnimation(  'hero_sheet_down', 1);
            break;
        case KEYCODE_DEBUG:
            engine.debug = engine.debug !== true;
            break;
    }
}

let assetsLoaded = false;

const tiles = [
    {
        id: 100,
        handle: '100_rock_front_bottom_left',
        src: '/assets/tiles/rock/100_rock_front_bottom_left.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 101,
        handle: '101_rock_front_bottom_center',
        src: '/assets/tiles/rock/101_rock_front_bottom_center.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 102,
        handle: '102_rock_front_bottom_right',
        src: '/assets/tiles/rock/102_rock_front_bottom_right.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 103,
        handle: '103_rock_front_top_left',
        src: '/assets/tiles/rock/103_rock_front_top_left.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 104,
        handle: '104_rock_front_top_center',
        src: '/assets/tiles/rock/104_rock_front_top_center.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 105,
        handle: '105_rock_front_top_right',
        src: '/assets/tiles/rock/105_rock_front_top_right.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 106,
        handle: '106_rock_left_bottom',
        src: '/assets/tiles/rock/106_rock_left_bottom.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 107,
        handle: '107_rock_center_bottom',
        src: '/assets/tiles/rock/107_rock_center_bottom.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 108,
        handle: '108_rock_left_middle',
        src: '/assets/tiles/rock/108_rock_left_middle.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 109,
        handle: '109_rock_right_bottom',
        src: '/assets/tiles/rock/109_rock_right_bottom.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 110,
        handle: '110_rock_right_middle',
        src: '/assets/tiles/rock/110_rock_right_middle.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 111,
        handle: '111_rock_left_top',
        src: '/assets/tiles/rock/111_rock_left_top.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 112,
        handle: '112_rock_right_top',
        src: '/assets/tiles/rock/112_rock_right_top.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 113,
        handle: '113_rock_entrance',
        src: '/assets/tiles/rock/113_rock_entrance.png',
        img: new Image(),
        structure: Structures.SOLID
    },
    {
        id: 900,
        handle: 'sea',
        src: '/assets/tiles/900_sea.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 901,
        handle: 'grass_a',
        src: '/assets/tiles/901_grass_a.png',
        img: new Image(),
        structure: Structures.SOLID
    },
    {
        id: 902,
        handle: 'grass_b',
        src: '/assets/tiles/902_grass_b.png',
        img: new Image(),
        structure: Structures.SOLID
    },
    {
        id: 903,
        handle: '903_pond',
        src: '/assets/tiles/903_pond.png',
        img: new Image(),
        structure: Structures.LIQUID
    }
];

const spriteSheets = [
    {
        handle: 'hero_sheet_left',
        src: '/assets/characters/hero/hero_sheet_left.png',
        img: new Image(),
        timeOut: 100,
        totalFrames: 8
    },
    {
        handle: 'hero_sheet_right',
        src: '/assets/characters/hero/hero_sheet_right.png',
        img: new Image(),
        timeOut: 100,
        totalFrames: 8
    },
    {
        handle: 'hero_sheet_up',
        src: '/assets/characters/hero/hero_sheet_up.png',
        img: new Image(),
        timeOut: 100,
        totalFrames: 8
    },
    {
        handle: 'hero_sheet_down',
        src: '/assets/characters/hero/hero_sheet_down.png',
        img: new Image(),
        timeOut: 100,
        totalFrames: 8
    },
    {
        handle: 'bandit_sheet_left',
        src: '/assets/characters/bandit/bandit_sheet_left.png',
        img: new Image(),
        timeOut: 100,
        totalFrames: 8
    },
    {
        handle: 'bandit_sheet_right',
        src: '/assets/characters/bandit/bandit_sheet_right.png',
        img: new Image(),
        timeOut: 100,
        totalFrames: 8
    },
    {
        handle: 'bandit_sheet_up',
        src: '/assets/characters/bandit/bandit_sheet_up.png',
        img: new Image(),
        timeOut: 100,
        totalFrames: 8
    },
    {
        handle: 'bandit_sheet_down',
        src: '/assets/characters/bandit/bandit_sheet_down.png',
        img: new Image(),
        timeOut: 100,
        totalFrames: 8
    }
]

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

// returns the sprite identifier based on the direction of the player
// todo: extend this when dealing with npc's
// todo: rename prefix
const getSpriteHandle = infix => {
    if (player.direction === 'left') { return `${infix}_left` }
    if (player.direction === 'right') { return `${infix}_right` }
    if (player.direction === 'up') { return `${infix}_up` }
    if (player.direction === 'down') { return `${infix}_down` }

    return `${infix}_down`;
}

const updateAnimations = () => {
    const now = Date.now();

    animations.forEach(animation => {
        if (now - animation.timeOut > animation.lastUpdate) {
            animation.frame++;

            if (animation.frame >= animation.totalFrames) {
                animation.frame = 0;
            }

            animation.lastUpdate = now;
        }
    })
}

const getAnimationById = id => {
    const animation = animations.filter(animation => animation.id === id);

    if (animation && animation[0]) {
        return animation[0];
    }

    return null;
}

const getSpriteSheetOffset = id => {
    const animation = getAnimationById(id);

    if (animation) {
        return animation.frame
    }

    return 0;
}

// remove all spriteSheet handles from animations for given id, optionally except the given handle
const unRegisterUnusedAnimations = (handle, id) => {
    const spriteSheetsForId = animations.filter(animation => animation.id === id);

    if (spriteSheetsForId && spriteSheetsForId.length) {
        spriteSheetsForId.forEach(spriteSheet => {
            if (!handle || (spriteSheet.handle !== handle)) {
                unRegisterAnimation(spriteSheet.handle, spriteSheet.id);
            }
        })
    }
}

const registerAnimation = (handle, id) => {
    const spriteSheet = getSpriteSheetByHandle(handle);
    const animation = getAnimationById(id);

    if (!animation) {
        animations.push(
            {
                id,
                handle: handle,
                frame: 0, // current frame
                totalFrames: spriteSheet.totalFrames,
                timeOut: spriteSheet.timeOut,
                lastUpdate: 0, // timestamp
            }
        );
    }
}

const unRegisterAnimation = (handle, id) => {
    const animId = animations.findIndex(animation => animation.id === id && animation.handle === handle);

    if (animId >= 0) {
        animations.splice(animId, 1);
    }
}

// draws the player on screen
const drawPlayer = () => {
    const spriteHandle = getSpriteHandle('hero_sheet');
    const imageObject = getSpriteSheetByHandle(spriteHandle);
    let spriteSheetOffset = getSpriteSheetOffset(1); // hardcoded to have id 1

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
    context.drawImage(imageObject.img, spriteSheetOffset * 50, 0, player.width, player.height, 0, 0, player.width, player.height);

    // show player hit box
    if (engine.debug) {
        context.strokeStyle = 'red';
        context.strokeRect(0, 0, 50, 50);
    }

    context.restore();
}

const drawTileAt = (x, y, tileType) => {
    context.drawImage(tileType['img'], x, y, tileType['img'].width, tileType['img'].height);
    context.strokeStyle = '#000000';

    if (engine.debug) {
        context.lineWidth = 1;
        context.strokeRect(x, y, engine.tileWidth, engine.tileHeight);
    }
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

                drawTileAt(posX, posY, getTileById(tileId));
            }
        }
    }
}

// convert player coordinates to grid coordinates
const getTileCoordinates = () => {
    const tileX = Math.floor((player.x) / engine.tileWidth);
    const tileY = Math.floor((player.y) / engine.tileHeight);

    return [tileX, tileY];
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
        let spriteSheetOffset = getSpriteSheetOffset(char.id);

        // unlike objects, the characters are animated and its image object resides therefore not in the main characters
        // nor the tempCharacters, but the image collection
        const imgData = getSpriteSheetByHandle(char.handle);

        context.drawImage(
            imgData.img,
            spriteSheetOffset * 50,
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

        // you need to re-instantiate the grid for each call! see https://github.com/qiao/PathFinding.js/issues/109
        const grid = createPathfindingGrid();

        // char has no destX,destY, calculating path to player
        const directPath = finder.findPath(
            helpers.Grid.xToGridX(character.x),
            helpers.Grid.yToGridY(character.y),
            helpers.Grid.xToGridX(player.x),
            helpers.Grid.yToGridY(player.y),
            grid
        );

        // if no destination set recalculate path to player
        if (!character.destX || !character.destY) {
            if (directPath && directPath.length > 2) {

                if (directPath.length < character.lineOfSight) {

                    // pop the last entry since that is player position and you don't want to overlap
                    directPath.pop();

                    // take the second entry since the first is the character position and that is already reached
                    const nextDest = directPath[1];

                    character.destX = nextDest[0];
                    character.destY = nextDest[1];
                } else {
                    // player is too far away, reset dest
                    character.destX = character.startGridX;
                    character.destY = character.startGridY;
                }
            }
        } else {
            const speed = character.speed;
            const destX = character.destX;
            const destY = character.destY;

            if (character.x < helpers.Grid.gridXtoX(destX)) {
                character.x += speed;
                character.handle = `${character.handlePrefix}_right`;
                unRegisterUnusedAnimations(character.handle, character.id);
                registerAnimation(`${character.handlePrefix}_right`, character.id);
                if (character.x > helpers.Grid.gridXtoX(destX)) {
                    character.x = helpers.Grid.gridXtoX(destX)
                }
            } else if (character.x > helpers.Grid.gridXtoX(destX)) {
                character.x -= speed;
                character.handle = `${character.handlePrefix}_left`;
                unRegisterUnusedAnimations(character.handle, character.id);
                registerAnimation(`${character.handlePrefix}_left`, character.id);
                if (character.x < helpers.Grid.gridXtoX(destX)) {
                    character.x = helpers.Grid.gridXtoX(destX)
                }
            } else if (character.y < helpers.Grid.gridYtoY(destY)) {
                character.y += speed;
                character.handle = `${character.handlePrefix}_down`;
                unRegisterUnusedAnimations(character.handle, character.id);
                registerAnimation(`${character.handlePrefix}_down`, character.id);
                if (character.y > helpers.Grid.gridYtoY(destY)) {
                    character.y = helpers.Grid.gridYtoY(destY)
                }
            } else if (character.y > helpers.Grid.gridYtoY(destY)) {
                character.y -= speed;
                character.handle = `${character.handlePrefix}_up`;
                unRegisterUnusedAnimations(character.handle, character.id);
                registerAnimation(`${character.handlePrefix}_up`, character.id);
                if (character.y < helpers.Grid.gridYtoY(destY)) {
                    character.y = helpers.Grid.gridYtoY(destY)
                }
            }

            if (
                character.destX === helpers.Grid.xToGridX(player.x) &&
                character.destY === helpers.Grid.yToGridY(player.y)
            ) {
                // attempt to move to tile where player is at, reset dest
                character.destX = character.startGridX;
                character.destY = character.startGridY;
            }

            if (character.x === helpers.Grid.gridXtoX(destX) && character.y === helpers.Grid.gridYtoY(destY)) {

                // reached destination
                if (helpers.Grid.xToGridX(character.x) === helpers.Grid.xToGridX(player.x)
                    && helpers.Grid.yToGridY(character.y) === helpers.Grid.yToGridY(player.y)) {

                    // on same tile as player, reset dest
                    character.destX = character.startGridX;
                    character.destY = character.startGridY;
                }
                // remove all
                unRegisterUnusedAnimations(null, character.id);

                // reached destination, reset dest
                character.destX = null;
                character.destY = null;
            }

            if (character.destX === character.startGridX && character.destY === character.startGridY) {

                // going home, but will keep checking to see if I can reach player
                if (directPath && directPath.length > 2) {

                    if (directPath.length < character.lineOfSight) {

                        // pop the last entry since that is player position and you don't want to overlap
                        directPath.pop();

                        // take the second entry since the first is the character position and that is already reached
                        const nextDest = directPath[1];

                        character.destX = nextDest[0];
                        character.destY = nextDest[1];
                    }
                }


            }
        }
    });
}

// returns tile instance for given id
const getTileById = id => {
    const tile = tiles.filter(tile => tile.id === id);

    if (tile && tile[0]) {
        return tile[0];
    }
}

// returns sprite sheet instance for given handle
const getSpriteSheetByHandle = handle => {
    const spriteSheet = spriteSheets.filter(spriteSheet => spriteSheet.handle === handle);

    if (spriteSheet && spriteSheet[0]) {
        return spriteSheet[0];
    }
}

// returns tile instance for grid x, y
const getTileForCurrentGridPosition = () => {
    const tileCoords = getTileCoordinates();
    const tileX = tileCoords[0];
    const tileY = tileCoords[1];

    return getTileById(area[tileY][tileX]);
}

// returns object instance for grid x, y (if it exists)
const getObjectForCurrentGridPosition = () => {
    const tileCoords = getTileCoordinates();
    const tileX = tileCoords[0];
    const tileY = tileCoords[1];

    for (let obj = 0; obj < tempObjects.length; obj++) {
        if (tempObjects[obj].gridX === tileX && tempObjects[obj].gridY === tileY ) {
            return tempObjects[obj];
        }
    }

    return null;
}

// returns character instance for grid x, y (if it exists)
const getCharacterForCurrentGridPosition = () => {
    const tileCoords = getTileCoordinates();
    const tileX = tileCoords[0];
    const tileY = tileCoords[1];

    for (let obj = 0; obj < tempCharacters.length; obj++) {
        if (helpers.Grid.xToGridX(tempCharacters[obj].x) === tileX &&
            helpers.Grid.yToGridY(tempCharacters[obj].y) === tileY) {
            return tempCharacters[obj];
        }
    }

    return null;
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
    const tileType = getTileForCurrentGridPosition();

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
    let currentObject = getObjectForCurrentGridPosition();

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
    let currentCharacter = getCharacterForCurrentGridPosition();

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

        if (engine.rasterLines) { helpers.Canvas.rasterLines(context) }

        if (engine.debug) {
            const debugElem = document.querySelector('#debug');
            const now = performance.now();
            const coords = getTileCoordinates();

            while (engine.fpsTimer.length > 0 && engine.fpsTimer[0] <= now - 1000) { engine.fpsTimer.shift() }
            engine.fpsTimer.push(now);
            if (debugElem) { debugElem.innerHTML = `playerX: ${player.x} innerMapX: ${innerMap.x} gridX: ${coords[0]} playerY: ${player.y} innerMapY:${innerMap.y} gridY: ${coords[1]} fps: ${engine.fpsTimer.length}` }
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
