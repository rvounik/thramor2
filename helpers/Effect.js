import Effects from './../constants/Effects.js';

export default class Effect {

    /** createSmoke
     *
     * Creates the impression of a cloud of smoke at given position for given character
     *
     * @param {float} startX: x position
     * @param {float} startY: y position
     * @param {string} color: color of the smoke
     * @param {Object} affectedCharacter: object containing x,y of character which the cloud should hover
     * @param {Array} effects: reference to collection of effects
     *
     * @example
     * createSmoke(
     *     200,
     *     300,
     *     '#dddddd,
     *     { x: 200, y: 300 },
     *     []
     * );
     */
    static createSmoke(startX, startY, color, affectedCharacter, effects) {
        for (let c = 0; c < 25; c++) {
            effects.push({
                type: Effects.SMOKE,
                counter: 0,
                alpha: 1,
                x: startX + 50 + (25 - (50 * Math.random())),
                y: startY + 50 + (25 - (50 * Math.random())),
                startX,
                startY,
                startAffectedCharacterX: affectedCharacter.x,
                startAffectedCharacterY: affectedCharacter.y,
                color,
                radius: 15 + (10 * Math.random()),
                placement: 'over'
            });
        }
    }

    /** createCoins
     *
     * Creates the impression of coins dropping underneath the character at given position
     *
     * @param {float} startX: x position
     * @param {float} startY: y position
     * @param {Object} affectedCharacter: object containing x,y of character which the cloud should hover
     * @param {Array} effects: reference to collection of effects
     *
     * @example
     * createCoins(
     *     200,
     *     300,
     *     { x: 200, y: 300 },
     *     []
     * );
     */
    static createCoins(startX, startY, affectedCharacter, effects) {
        for (let c = 0; c < 15; c++) {
            const x = startX + 25 + (15 - (30 * Math.random()));
            const y = startY + 35 + (5 - (10 * Math.random()));
            const addX = x < (startX + 25) ? -(1 + Math.random()) : (1 + Math.random());

            effects.push({
                type: Effects.COINS,
                counter: 1,
                x,
                y,
                startX,
                startY,
                startAffectedCharacterX: affectedCharacter.x,
                startAffectedCharacterY: affectedCharacter.y,
                radius: 5,
                addX,
                placement: 'under'
            });
        }
    }
}
