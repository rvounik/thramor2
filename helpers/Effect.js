import Effects from './../constants/Effects.js';

export default class Effect {
    static createCloud(xPos, yPos, color, effects) {
        for (let c = 0; c < 25; c++) {
            effects.push({
                type: Effects.SMOKE,
                counter: 0,
                alpha: 1,
                x: xPos - (25 - (50 * Math.random())),
                y: yPos - (25 - (50 * Math.random())),
                color,
                radius: 15 + (10 * Math.random())
            });
        }
    }

    static createSparks(xPos, yPos, startY, color, effects) {
        for (let c = 0; c < 5; c++) {
            effects.push({
                type: Effects.SPARKS,
                counter: Math.PI /2,
                alpha: 1,
                x: xPos - (15 - (30 * Math.random())),
                y: yPos - (10 - (20 * Math.random())),
                color,
                startY,
                radius: 5 //2 + 2 * Math.random()
            });
        }
    }
}
