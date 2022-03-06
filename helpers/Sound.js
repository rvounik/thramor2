export default class Sound {
    static playSound(sound) {
        let audio = new Audio();
        audio.src = sound;
        audio.play();
    }
}
