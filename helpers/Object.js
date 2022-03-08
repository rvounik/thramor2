import helpers from './index.js';

export default class Object {

    // returns object instance for grid x, y (if it exists)
    static getObjectForGridPosition(tileX, tileY, tempObjects) {
        for (let obj = 0; obj < tempObjects.length; obj++) {
            if (tempObjects[obj].gridX === tileX && tempObjects[obj].gridY === tileY ) {
                return tempObjects[obj];
            }
        }

        return null;
    }
}
