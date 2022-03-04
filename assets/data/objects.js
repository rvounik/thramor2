import Structures from './../../constants/Structures.js';

const Objects = [
    {
        id: 100,
        gridX: 7,
        gridY: 7,
        handle: '103_rock_front_top_left',
        src: '/assets/objects/100_rock_a.png',
        img: new Image(),
        structure: Structures.BLOCK, // trap, item etc.
        status: 'shown' // picked up etc.
    },
];

export default Objects;