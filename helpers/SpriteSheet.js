export default class SpriteSheet {

    // returns sprite sheet instance for given handle
    static getSpriteSheetByHandle(handle, spriteSheets) {
        const spriteSheet = spriteSheets.filter(spriteSheet => spriteSheet.handle === handle);

        if (spriteSheet && spriteSheet[0]) {
            return spriteSheet[0];
        }
    }
}
