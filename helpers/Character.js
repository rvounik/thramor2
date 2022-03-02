import helpers from './index.js';

export default class Character {

    static getOrientatedCharacterHandle(character, player) {
        if (helpers.Grid.xToGridX(player.x) < helpers.Grid.xToGridX(character.x)) {
            return `${character.handlePrefix}_left`;
        } else if (helpers.Grid.xToGridX(player.x) > helpers.Grid.xToGridX(character.x)) {
            return `${character.handlePrefix}_right`;
        } else if (helpers.Grid.yToGridY(player.y) > helpers.Grid.yToGridY(character.y)) {
            return `${character.handlePrefix}_down`;
        } else if (helpers.Grid.yToGridY(player.y) < helpers.Grid.yToGridY(character.y)) {
            return `${character.handlePrefix}_up`;
        }
    }

    static getCharacterForCurrentGridPosition(player, tempCharacters) {
        const tileX = helpers.Grid.xToGridX(player.x);
        const tileY = helpers.Grid.yToGridY(player.y);

        for (let obj = 0; obj < tempCharacters.length; obj++) {
            if (helpers.Grid.xToGridX(tempCharacters[obj].x) === tileX &&
                helpers.Grid.yToGridY(tempCharacters[obj].y) === tileY) {
                return tempCharacters[obj];
            }
        }

        return null;
    }

    static getCharacterById(characterId, characters) {
        const character = characters.filter(char => char.id === characterId);

        if (character && character[0]) {
            return character[0];
        }

        return null;
    }
}
