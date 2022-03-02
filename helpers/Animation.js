import helpers from './index.js';

export default class Animation {
    static getAnimationIndexForId = (id, animations) => {
        return animations.findIndex(animation => animation.id === id);
    }

    static unRegisterAnimation(id, animations) {
        const animId = this.getAnimationIndexForId(id, animations);

        if (animId >= 0) {
            animations.splice(animId, 1);
        }
    }

    static unRegisterUnusedAnimations(handle, id, animations) {
        const spriteSheetsForId = animations.filter(animation => animation.id === id);

        if (spriteSheetsForId && spriteSheetsForId.length) {
            spriteSheetsForId.forEach(spriteSheet => {
                if (!handle || (spriteSheet.handle !== handle)) {
                    this.unRegisterAnimation(spriteSheet.id, animations);
                }
            })
        }
    }

    static getAnimationById(id, animations) {
        const animation = animations.filter(animation => animation.id === id);

        if (animation && animation[0]) {
            return animation[0];
        }

        return null;
    }

    static getAnimationOffset(id, animations) {
        const animation = helpers.Animation.getAnimationById(id, animations);

        if (animation) {
            return animation.frame
        }

        return 0;
    }
}
