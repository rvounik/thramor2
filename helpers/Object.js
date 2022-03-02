import helpers from './index.js';

export default class Object {

    // returns object instance for grid x, y (if it exists)
    static getObjectForCurrentGridPosition(player, tempObjects) {
        const tileX = helpers.Grid.xToGridX(player.x);
        const tileY = helpers.Grid.yToGridY(player.y);

        for (let obj = 0; obj < tempObjects.length; obj++) {
            if (tempObjects[obj].gridX === tileX && tempObjects[obj].gridY === tileY ) {
                return tempObjects[obj];
            }
        }

        return null;
    }
}
