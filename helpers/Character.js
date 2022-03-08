import helpers from './index.js';

export default class Character {

    static getOrientatedCharacterHandle(character, player) {
        if (helpers.Grid.xToGridX(player.x + 25) < helpers.Grid.xToGridX(character.x + 25)) {
            return `${character.handlePrefix}_left`;
        } else if (helpers.Grid.xToGridX(player.x +25) > helpers.Grid.xToGridX(character.x + 25)) {
            return `${character.handlePrefix}_right`;
        } else if (helpers.Grid.yToGridY(player.y +25) > helpers.Grid.yToGridY(character.y + 25)) {
            return `${character.handlePrefix}_down`;
        } else if (helpers.Grid.yToGridY(player.y +25) < helpers.Grid.yToGridY(character.y + 25)) {
            return `${character.handlePrefix}_up`;
        }
    }

    static getCharacterForGridPosition(tileX, tileY, tempCharacters) {
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

    static removeCharacterById(characterId, characters) {
        const characterIndex = characters.findIndex(char => char.id === characterId);

        if (characterIndex || characterIndex === 0) {
            characters.splice(characterIndex, 1);
        }

        return null;
    }
}
