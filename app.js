import Structures from './constants/Structures.js';

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
const playerSpeed = 10;

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
    tileWidth: 50,
    tileHeight: 50,
    keys: {
        right: false,
        left: false,
        up: false,
        down: false
    }
}

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

let objects = [
    {
        id: 100,
        x: 7,
        y: 7,
        handle: '103_rock_front_top_left',
        src: '/assets/objects/100_rock_a.png',
        img: new Image(),
        structure: Structures.BLOCK, // trap, item etc.
        status: 'shown' // picked up etc.
    },
]

let tempObjects = [];

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
            break;
        case KEYCODE_UP:
            engine.keys.up = true;
            player.direction = 'up';
            break;
        case KEYCODE_RIGHT:
            engine.keys.right = true;
            player.direction = 'right';
            break;
        case KEYCODE_DOWN:
            engine.keys.down = true;
            player.direction = 'down';
            break;
    }
}

const handleKeyUp = e => {
    switch (e.keyCode) {
        case KEYCODE_LEFT:
            engine.keys.left = false;
            break;
        case KEYCODE_RIGHT:
            engine.keys.right = false;
            break;
        case KEYCODE_UP:
            engine.keys.up = false;
            break;
        case KEYCODE_DOWN:
            engine.keys.down = false;
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
        img: new Image()
    },
    {
        handle: 'hero_sheet_right',
        src: '/assets/characters/hero/hero_sheet_right.png',
        img: new Image()
    },
    {
        handle: 'hero_sheet_up',
        src: '/assets/characters/hero/hero_sheet_up.png',
        img: new Image()
    },
    {
        handle: 'hero_sheet_down',
        src: '/assets/characters/hero/hero_sheet_down.png',
        img: new Image()
    }
]

const clickHandler = event => {
}

// load the image assets by setting image.img.src to image.src
const loadImage = image => {
    image['img'].src = image['src']
}

const areAllImageAssetsLoaded = () => {
    let loaded = true;

    // check tiles
    for (let loadedTile = 0; loadedTile < tiles.length; loadedTile++) {
        if (!tiles[loadedTile] || !tiles[loadedTile].img.naturalWidth) {
            loaded = false;
        }
    }

    // check objects
    for (let loadedObject = 0; objects < objects.length; objects++) {
        if (!objects[objects] || !objects[objects].img.naturalWidth) {
            loaded = false;
        }
    }

    return loaded;
}

const findTileById = id => {

    // todo: what ugly lookup is this?! fix it!
    for (let tile = 0; tile < tiles.length; tile++) {
        if (tiles[tile]['id'] === id) {
            return tiles[tile];
        }
    }
}

const getSpriteSheetByHandle = handle => {
    for (let imageObject = 0; imageObject < spriteSheets.length; imageObject++) {
        if (spriteSheets[imageObject]['handle'] === handle) {
            return spriteSheets[imageObject];
        }
    }
}

const getSprite = infix => {
    if (player.direction === 'left') { return `${infix}_left` }
    if (player.direction === 'right') { return `${infix}_right` }
    if (player.direction === 'up') { return `${infix}_up` }
    if (player.direction === 'down') { return `${infix}_down` }

    return `${infix}_down`;
}

const drawPlayer = () => {
    const sheetOffset = 0;
    let sprite = getSprite('hero_sheet');

    const imgData = getSpriteSheetByHandle(sprite).img;

    context.save();

    // move player to innerMap coordinates
    context.translate(innerMap.x, innerMap.y);

    // manually tweak the positioning of the player sprite
    const centeredX = -engine.tileWidth / 2;
    const centeredY = -engine.tileHeight / 2;
    context.translate(centeredX, centeredY);

    // ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
    // only if you include all these params, are you able to clip the image. clip start is sx, sy, sWidth and sHeight determine
    // the clip dimensions, x, y set the starting position (upper-left corner) and width, height are the final sprite dimensions
    context.drawImage(imgData, sheetOffset, 0, player.width, player.height, 0, 0, player.width, player.height);

    if (engine.debug) {
        context.strokeStyle = 'red';
        context.strokeRect(0, 0, 50, 50);
    }

    context.restore();
}

const drawTileAt = (x, y, tileType) => {
    context.drawImage(tileType['img'], x, y, tileType['img'].width, tileType['img'].height);
    context.strokeStyle='#000000';

    if (engine.debug) {
        context.lineWidth = 1;
        context.strokeRect(x, y, engine.tileWidth, engine.tileHeight);
    }
}


const drawTiles = () => {
    for (let y = -engine.tileHeight; y < 800; y += engine.tileHeight) {
        for (let x = -engine.tileWidth; x < (800 + 2 * engine.tileWidth); x += engine.tileWidth) {
            const tileX = Math.floor((player.x + x - innerMap.x) / engine.tileWidth);
            const tileY = Math.floor((player.y + y - innerMap.y) / engine.tileHeight);

            // todo: do programmatically
            if (tileX < 0 || tileY < 0 || tileX > 29 || tileY > 29) {

                // nothing to render here: at the edge of the map and trying to render out-of-bounds tile "off-screen"

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

                drawTileAt(posX, posY, findTileById(tileId));
            }
        }
    }
}

const getTileCoordinates = () => {
    const tileX = Math.floor((player.x) / engine.tileWidth);
    const tileY = Math.floor((player.y) / engine.tileHeight);

    return [tileX, tileY];
}

const drawObjects = () => {
    let startGridX = Math.floor((player.x - innerMap.x) / engine.tileWidth);
    let endGridX = Math.floor((player.x + 900 - innerMap.x) / engine.tileWidth);
    let startGridY = Math.floor((player.y - innerMap.y) / engine.tileHeight);
    let endGridY = Math.floor((player.y + 800 - innerMap.y) / engine.tileHeight);

    tempObjects = objects.filter(obj =>
        obj.x >= startGridX &&
        obj.x <= endGridX &&
        obj.y >= startGridY &&
        obj.y <= endGridY);

    tempObjects.forEach(obj => {
        context.drawImage(
            obj.img,
            (obj.x * engine.tileWidth) - player.x + innerMap.x,
            (obj.y * engine.tileHeight) - player.y + innerMap.y,
            obj['img'].width,
            obj['img'].height
        );
    });
}

const findObjectById = id => {

}

const getTileForCurrentGridPosition = () => {

    // todo: use helper and implement in other places too
    const tileX = Math.floor((player.x) / engine.tileWidth);
    const tileY = Math.floor((player.y) / engine.tileHeight);
    const tileId = area[tileY][tileX];

    return findTileById(tileId);
}

const getObjectForCurrentGridPosition = () => {
    const tileX = Math.floor((player.x) / engine.tileWidth);
    const tileY = Math.floor((player.y) / engine.tileHeight);

    for (let obj = 0; obj < tempObjects.length; obj++) {
        if (tempObjects[obj].x === tileX && tempObjects[obj].y === tileY ) {
            return tempObjects[obj];
        }
    }
}

const movePlayer = () => {
    const currentX = player.x;
    const currentY = player.y;
    const currentInnerMapX = innerMap.x;
    const currentInnerMapY = innerMap.y;
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

    // todo: move tile & object detection below outside of this function

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
        player.x = currentX;
        player.y = currentY;
        innerMap.x = currentInnerMapX;
        innerMap.y = currentInnerMapY;
    } else {
        // deal with other types of tile Structures like water fire snow etc
    }

    let currentObject = getObjectForCurrentGridPosition();

    if (currentObject && currentObject.structure === Structures.BLOCK) {

        // reset due to obstacle
        player.x = currentX;
        player.y = currentY;
        innerMap.x = currentInnerMapX;
        innerMap.y = currentInnerMapY;
    } else {
        // deal with other types of object Structures like pick-ups, death traps etc.
    }
}


// todo: move to Helpers
const clearCanvas = () => {
    context.fillStyle = '#ddd';
    context.fillRect(0, 0, 800, 600);
}

const updateCanvas = timestamp => {
    clearCanvas();

    if (assetsLoaded) {
        movePlayer();
        drawTiles();
        drawObjects();
        drawPlayer();

        const debugElem = document.querySelector('#debug');

        if (engine.debug && debugElem) {
            const coords = getTileCoordinates();

            debugElem.innerHTML = `playerX: ${player.x} innerMapX: ${innerMap.x} gridX: ${coords[0]} playerY: ${player.y} innerMapY:${innerMap.y} gridY: ${coords[1]}`;
        }
    }

    if (!assetsLoaded) {
        if (areAllImageAssetsLoaded()) {
            assetsLoaded = true;
        }

        // loader
        context.font = "30px Trebuchet MS";
        context.fillStyle = "#fff";
        context.fillText("loading", (800 / 2) - (context.measureText("loading").width / 2), 250);
    }

    if (!start) {
        start = timestamp
    }

    progress = timestamp - start;

    if (progress < 1000) {
        start = null;
        window.requestAnimationFrame(updateCanvas);
    }
}

// call the loadImage function for each defined image
tiles.map(image => {
    loadImage(image);
});

spriteSheets.map(image => {
    loadImage(image);
});

objects.map(object => {
    loadImage(object);
});

// disable page movement using cursor keys
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

// trigger update function
window.requestAnimationFrame(updateCanvas);
