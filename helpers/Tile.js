import helpers from './index.js';

export default class Tile {
    static getTileById = (id, tiles) => {
        const tile = tiles.filter(tile => tile.id === id);

        if (tile && tile[0]) {
            return tile[0];
        }
    }

    static getTileForGridPosition(gridX, gridY, area, tiles) {
        return helpers.Tile.getTileById(area[gridY][gridX], tiles);
    }

    // todo: wasnt there a way to make context globally available?
    static drawTileAt(x, y, tileType, engine, context) {
        context.drawImage(tileType['img'], x, y, tileType['img'].width, tileType['img'].height);
        context.strokeStyle = '#000000';

        if (engine.debug) {
            context.save();
            context.lineWidth = 1;
            context.strokeRect(x, y, engine.tileWidth, engine.tileHeight);
            context.globalAlpha= .5;
            context.fillStyle = '#333333';
            context.fillRect(x + 15 , y + 15, 25, 15);
            context.font = '10px monospace';
            context.fillStyle = '#ffffff';
            context.fillText(tileType.id, x+20, y+25);
            context.restore();
        }
    }
}
