import Structures from './constants/Structures.js';

let start = null;
let progress = 0;

// player coordinates on innerMap (200 - 600, 100 - 500)
const innerMap = {
    w: 400,
    h: 300,
    x: 400,
    y: 300
}

const playerWidth = 75;
const playerHeight = 48;
const playerSpeed = 10;

const player = {
    x: innerMap.x,
    y: innerMap.y,
    rotation: 0,
    speed: playerSpeed,
    width: playerWidth,
    height: playerHeight
}

// todo: should move to 50x50
const tile = {
    w: 100,
    h: 100
}

const engine = {
    showGrid: false
}

const animations = [];

// note the outside 2 grid units are not traversable, therefore its turned into water
let area = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,2,2,2,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,3,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,3,4,7,4,4,7,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,6,8,0,6,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// set some vars that handle key mapping
let KEYCODE_LEFT = 37,
    KEYCODE_UP = 38,
    KEYCODE_RIGHT = 39,
    KEYCODE_DOWN = 40,
    leftHeld = false,
    rightHeld = false,
    upHeld = false,
    downHeld = false;

// get the canvas context
const context = document.getElementById('canvas').getContext('2d');

const handleKeyDown = e => {
    switch (e.keyCode) {
        case KEYCODE_LEFT:
            leftHeld = true;
            player.rotation = 0;
            break;
        case KEYCODE_UP:
            upHeld = true;
            player.rotation = 90;
            break;
        case KEYCODE_RIGHT:
            rightHeld = true;
            player.rotation = 180;
            break;
        case KEYCODE_DOWN:
            downHeld = true;
            player.rotation = 270;
            break;
    }
}

const handleKeyUp = e => {
    switch (e.keyCode) {
        case KEYCODE_LEFT:
            leftHeld = false;
            leftHeldTimer = 0;
            break;
        case KEYCODE_RIGHT:
            rightHeld = false;
            rightHeldTimer = 0;
            break;
        case KEYCODE_UP:
            upHeld = false;
            upHeldTimer = 0;
            break;
        case KEYCODE_DOWN:
            downHeld = false;
            downHeldTimer = 0;
            break;
    }
}

let assetsLoaded = false;

// define image assets
const images = [
    {
        id: 0,
        handle: 'grass',
        src: 'grass.png',
        img: new Image(),
        structure: Structures.SOLID
    },
    {
        id: 1,
        handle: 'water',
        src: 'blue.png',
        img: new Image(),
        structure: Structures.LIQUID
    },
    {
        id: 2,
        handle: 'floor',
        src: 'purple.png',
        img: new Image(),
        structure: Structures.SOLID
    },
    {
        id: 3,
        handle: 'rock_side_left',
        src: 'rock_side_left.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 4,
        handle: 'rock',
        src: 'rock.png',
        img: new Image(),
        structure: Structures.SOLID
    },
    {
        id: 5,
        handle: 'rock_side_right',
        src: 'rock_side_right.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 6,
        handle: 'rock_corner_left',
        src: 'rock_corner_left.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 7,
        handle: 'rock_corner_front',
        src: 'rock_corner_front.png',
        img: new Image(),
        structure: Structures.BLOCK
    },
    {
        id: 8,
        handle: 'rock_corner_right',
        src: 'rock_corner_right.png',
        img: new Image(),
        structure: Structures.BLOCK
    }
];

const characters = [
    {
        handle: 'main',
        src: 'test.png',
        img: new Image()
    }
];

const spriteSheets = [
    {
        handle: 'walk_down',
        src: 'char01.png',
        img: new Image()
    },
    {
        handle: 'walk_up',
        src: 'char02.png',
        img: new Image()
    },
    {
        handle: 'walk_left',
        src: 'char03.png',
        img: new Image()
    },
    {
        handle: 'walk_right',
        src: 'char04.png',
        img: new Image()
    },
]

const clickHandler = event => {
}

// load the image assets by setting image.img.src to image.src
const loadImage = image => {
    image['img'].src = image['src']
}

const areAllImageAssetsLoaded = () => {
    let loaded = true;

    for (let loadedBitmap = 0; loadedBitmap < images.length; loadedBitmap++) {
        if (!images[loadedBitmap] || !images[loadedBitmap].img.naturalWidth) {
            loaded = false;
        }
    }

    return loaded;
}

const findImageObjectInArrayById = id => {

    // todo: what ugly lookup is this?! also  name is poor. it does return object but why state that it does?!
    for (let imageObject = 0; imageObject < images.length; imageObject++) {
        if (images[imageObject]['id'] === id) {
            return images[imageObject];
        }
    }
}

// todo: on second thought this is a bad idea
const findCharacterObjectInArrayById = id => {
    for (let imageObject = 0; imageObject < characters.length; imageObject++) {
        if (characters[imageObject]['id'] === id) {
            return characters[imageObject];
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

const drawPlayer = () => {
    const sheetOffset = 0;
    let sprite = null;

    if (leftHeld) { sprite = getSpriteSheetByHandle('walk_left')['img'] }
    if (rightHeld) { sprite = getSpriteSheetByHandle('walk_right')['img'] }
    if (downHeld) { sprite = getSpriteSheetByHandle('walk_down')['img'] }
    if (upHeld) { sprite = getSpriteSheetByHandle('walk_up')['img'] }

    if (!sprite) { sprite = getSpriteSheetByHandle('walk_down')['img'] }

    context.save();

    // move player to innerMap coordinates
    context.translate(innerMap.x, innerMap.y);

    // manually tweak the positioning of the player sprite
    const centeredX = -12;
    const centeredY = -30;
    context.translate(centeredX, centeredY);

    // ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
    // only if you include all these params, are you able to clip the image. clip start is sx, sy, sWidth and sHeight determine
    // the clip dimensions, x, y set the starting position (upper-left corner) and width, height are the final sprite dimensions
    context.drawImage(sprite, sheetOffset, 0, player.width, player.height, 0, 0, player.width, player.height);
    context.restore();
}

const drawTileAt = (x, y, tileType) => {
    context.drawImage(tileType['img'], x, y, tileType['img'].width, tileType['img'].height);
    context.strokeStyle='#000000';

    if (engine.showGrid) {
        context.lineWidth = 3;
        context.strokeRect(x, y, 100, 100);
    }
}


const drawTiles = () => {
    for (let y = -100; y < 800; y += 100) {
        for (let x = -100; x < 1000; x += 100) {
            const tileX = Math.floor((player.x + x - innerMap.x) / 100);
            const tileY = Math.floor((player.y + y - innerMap.y) / 100);

            if (tileX < 0 || tileY < 0 || tileX > 29 || tileY > 29) {
                // todo: do programmatically
                // nothing to render here: at the edge of the map and trying to render out-of-bounds tile "off-screen"
            } else {
                const tileId = area[tileY][tileX];

                let posX, posY;

                if (innerMap.x >= 400) {
                    const diffToX = innerMap.x - 400;
                    const startX = (player.x - diffToX) - 400;
                    posX = x - (startX % 100);
                } else {
                    const diffToX = 400 - innerMap.x;
                    const startX = 400 - (player.x + diffToX);
                    posX = x + (startX % 100);
                }

                if (innerMap.y >= 300) {
                    const diffToY = innerMap.y - 300;
                    const startY = (player.y - diffToY) - 300;
                    posY = y - (startY % 100);
                } else {
                    const diffToY = 300 - innerMap.y;
                    const startY = 300 - (player.y + diffToY);
                    posY = y + (startY % 100);
                }

                drawTileAt(posX, posY, findImageObjectInArrayById(tileId));
            }
        }
    }
}

const getTileType = () => {
    const tileX = Math.floor((player.x) / 100);
    const tileY = Math.floor((player.y) / 100);
    const tileId = area[tileY][tileX];

    return findImageObjectInArrayById(tileId);
}

const movePlayer = () => {
    const currentX = player.x;
    const currentY = player.y;
    const currentInnerMapX = innerMap.x;
    const currentInnerMapY = innerMap.y;
    const speed = player.speed;

    // the outerMap dimensions are as wide as the defined area minus 200 to ensure screen is always filled up with grid
    const outerMapWidth = area[0].length * 100 - 200;
    const outerMapHeight = area.length * 100 - 200;

    // innerMap limits are 200px from x, y game borders (800x600), so left & right: 200-600 and up & down: 200-400

    if (rightHeld) {
        const innerMapLimit = 600 - (tile.w / 2);
        const outerMapLimit = outerMapWidth - (tile.w / 2);
        if (player.x < outerMapLimit && (player.x + speed) < outerMapLimit) { player.x += speed }
        if (innerMap.x < innerMapLimit && (innerMap.x + speed) < innerMapLimit) { innerMap.x += speed }
    } else if (leftHeld) {
        const innerMapLimit = 200 + (tile.w / 2);
        const outerMapLimit = 200 + (tile.w / 2);
        if (player.x > outerMapLimit && (player.x - speed) > outerMapLimit) { player.x -= speed }
        if (innerMap.x > innerMapLimit && (innerMap.x - speed) > innerMapLimit) { innerMap.x -= speed }
    } else if (downHeld) {
        const innerMapLimit = 400 - (tile.h / 2);
        const outerMapLimit = outerMapHeight - (tile.h / 2);
        if (player.y < outerMapLimit && (player.y + speed) < outerMapLimit) { player.y += speed }
        if (innerMap.y < innerMapLimit && (innerMap.y + speed) < innerMapLimit) { innerMap.y += speed }
    } else if (upHeld) {
        const innerMapLimit = 200 + (tile.h / 2);
        const outerMapLimit = 200 + (tile.h / 2);
        if (player.y > outerMapLimit && (player.y - speed) > outerMapLimit) { player.y -= speed }
        if (innerMap.y > innerMapLimit && (innerMap.y - speed) > innerMapLimit) { innerMap.y -= speed }
    }

    const tileType = getTileType();

    // player moves through liquid
    if (tileType.structure === Structures.LIQUID) {
        player.speed = playerSpeed / 2;
        player.height = playerHeight / 1.4;
    } else {
        player.speed = playerSpeed;
        player.height = playerHeight;
    }

    // reset due to obstacle
    if (tileType.structure === Structures.BLOCK) {
        player.x = currentX;
        player.y = currentY;
        innerMap.x = currentInnerMapX;
        innerMap.y = currentInnerMapY;
    }
}

const clearCanvas = () => {
    context.fillStyle = '#ddd';
    context.fillRect(0, 0, 800, 600);
}

const updateCanvas = timestamp => {
    clearCanvas();

    if (assetsLoaded) {
        movePlayer();
        drawTiles();
        drawPlayer();

        const debugElem = document.querySelector('#debug');

        if (debugElem) {
            debugElem.innerHTML = `x: ${player.x} y: ${player.y}`;
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
images.map(image => {
    loadImage(image);
});

characters.map(image => {
    loadImage(image);
});

spriteSheets.map(image => {
    loadImage(image);
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

// registers keys that are held down
let leftHeldTimer = 0;
let rightHeldTimer = 0;
let downHeldTimer = 0;
let upHeldTimer = 0;

// register global window event listener for click events
window.addEventListener('click', clickHandler);

// trigger update function
window.requestAnimationFrame(updateCanvas);
