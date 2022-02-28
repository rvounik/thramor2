
// todo: better than passing on the engine object. perhaps make it an external thing at some point
const tile_width = 50;
const tile_height = 50;

export default class Grid {

// todo: find other places in code that can use this
    static xToGridX(x) {
        return Math.floor(x / tile_width);
    }

// todo: find other places in code that can use this
    static yToGridY(y) {
        return Math.floor(y / tile_height);
    }

// todo: find other places in code that can use this
    static gridXtoX(gridX) {
        return gridX * tile_width;
    }

// todo: find other places in code that can use this
    static gridYtoY(gridY) {
        return gridY * tile_height;
    }
}
