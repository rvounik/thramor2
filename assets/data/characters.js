import helpers from './../../helpers/index.js';
import CharacterTypes from './../../constants/CharacterTypes.js';

const Characters = [
    {
        id: 100, // give each one a unique id. this is required for the animations
        startGridX: 17,
        startGridY: 12,
        x: helpers.Grid.gridXtoX(17),
        y: helpers.Grid.gridYtoY(12),
        destX: null,
        destY: null,
        speed: 1.5,
        handlePrefix: 'bandit_sheet',
        handle: 'bandit_sheet_down',
        handle_attacking: 'bandit_sheet_attack_down',
        type: CharacterTypes.ENEMY,
        lineOfSight: 10,
        attackInterval: 100, // timeout in ticks
        attackTimer: 0,
        health: 35
    },
    {
        id: 101, // give each one a unique id. this is required for the animations
        startGridX: 18,
        startGridY: 12,
        x: helpers.Grid.gridXtoX(18),
        y: helpers.Grid.gridYtoY(12),
        destX: null,
        destY: null,
        speed: 1.5,
        handlePrefix: 'bandit_sheet',
        handle: 'bandit_sheet_down',
        handle_attacking: 'bandit_sheet_attack_down',
        type: CharacterTypes.ENEMY,
        lineOfSight: 10,
        attackInterval: 100, // timeout in ticks
        attackTimer: 0,
        health: 35
    },
];

export default Characters;
