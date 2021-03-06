import { Emitter } from "../utils/emmiter"
import MainManager from "../manager/main_manager"
import MainUIManager from "../ui/main_ui_manager";
import ResourceManager from "../manager/resouce_manager";
import { ResType, GameStatus } from "../utils/enum";
import config from "../../config";
import JsonManager from "../manager/json_manager";
import { instance } from "../joystick/Joystick";
import AudioManager from "../manager/audio_manager";
import FailUIManager from "../ui/fail_ui_manager";

const { ccclass, property } = cc._decorator;

enum arrEnum {
    none = 0,
    up = 1,
    down = 2,
    left = 3,
    right = 4,
    upLeft = 5,
    upRight = 6,
    downRight = 8,
    downLeft = 7,
}
@ccclass
export default class PlayerItem extends cc.Component {

    walkSoundTimer = null
    speed: number = 0;
    xHat: number = 0;
    yHat: number = 0;
    normalSpd: number = 100;
    surrounding: cc.Node = null;
    holding: cc.Node = null;
    @property(cc.Animation)
    playerAnima: cc.Animation = null
    _hp: number = 3
    @property(cc.Node)
    camara: cc.Node = null
    set hp(val: number) {
        if (this.isProtect && val < this._hp) return
        this._hp = val
        MainUIManager.instance.showHp(val)
        this.checkDie()
    }
    get hp() {
        return this._hp
    }

    @property(cc.Node)
    hand: cc.Node = null
    // LIFE-CYCLE CALLBACKS:
    react: number[] = []

    isWechat: boolean = cc.sys.platform == cc.sys.WECHAT_GAME
    animaName: string[][] = [
        [],
        []
    ]
    onLoad() {
        this.animaName = [
            ['player_silder_run', 'player_idle'],
            ['player_success_run', 'player_success_idle']
        ]
        // Movement control
        Emitter.register("rightArrowDown", this.moveRight, this)
        Emitter.register("leftArrowDown", this.moveLeft, this)
        Emitter.register("upArrowDown", this.moveUp, this)
        Emitter.register("downArrowDown", this.moveDown, this)
        Emitter.register("rightArrowUp", this.xOnStay, this)
        Emitter.register("leftArrowUp", this.xOnStay, this)
        Emitter.register("upArrowUp", this.yOnStay, this)
        Emitter.register("downArrowUp", this.yOnStay, this)
        instance.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        instance.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        setTimeout(() => {
            ResourceManager.instance.getAnimation('player_silder_run', config.aniConfig['player_silder_run']).then((res: cc.AnimationClip) => {
                this.playerAnima.addClip(res)
            })
            ResourceManager.instance.getAnimation('player_idle', config.aniConfig['player_idle']).then((res: cc.AnimationClip) => {
                this.playerAnima.addClip(res)
            })
            ResourceManager.instance.getAnimation('player_success_run', config.aniConfig['player_success_run']).then((res: cc.AnimationClip) => {
                this.playerAnima.addClip(res)
            })
            ResourceManager.instance.getAnimation('player_success_idle', config.aniConfig['player_success_idle']).then((res: cc.AnimationClip) => {
                this.playerAnima.addClip(res)
            })
        });

    }
    moveDir: cc.Vec2 = cc.v2(0, 0)
    moveType: number = 0
    onTouchMove(event: cc.Event.EventTouch, data) {
        this.moveType = data.speedType
        this.moveDir = data.moveDistance
    }
    onTouchEnd(event: cc.Event.EventTouch, data) {
        //console.log('data', data)
        this.moveType = data.speedType
        this.moveDir = cc.v2(0, 0)
    }
    init() {
        this.isProtect = 0
        this.node.setPosition(JsonManager.instance.getConfig('playerPosition')[0], JsonManager.instance.getConfig('playerPosition')[1])
        // this.node.setPosition(0, -100)
        this.hp = 3// JsonManager.instance.getConfig('playerHp')
        this.normalSpd = JsonManager.instance.getConfig('playerSpd')
        this.speed = this.normalSpd
        let playerPos = JsonManager.instance.getConfig('playerPosition')
        let range = JsonManager.instance.getConfig('canMoveRange')
        this.react = [//上下左右
            range[1] / 2 + playerPos[1] / 2 - 93,
            -range[1] / 2 + playerPos[1] / 2 + 62,
            range[0] / 2 + playerPos[0] / 2 - 120,
            -range[0] / 2 + playerPos[0] / 2 + 120
        ]
        console.log(this.react)
    }
    update(dt) {
        if (MainManager.instance.gameStatus != GameStatus.start) return
        if (this.isWechat && this.moveDir != null) {
            this.node.x += this.moveDir.x * dt * this.speed;
            this.node.y += this.moveDir.y * dt * this.speed;
            this.node.scaleX = this.moveDir.x > 0 ? -1 : 1
            if (this.moveDir.x != 0 || this.moveDir.y != 0) {
                if (!this.playerAnima.getAnimationState(this.animaName[this.isProtect][0]).isPlaying) {
                    this.playerAnima.play(this.animaName[this.isProtect][0])
                }
            }
            if (this.moveType == 0) {
                if (!this.playerAnima.getAnimationState(this.animaName[this.isProtect][1]).isPlaying) {
                    this.playerAnima.play(this.animaName[this.isProtect][1])
                }
            }
        } else {
            this.node.x += this.xHat * this.speed * dt;
            this.node.y += this.yHat * this.speed * dt;
            if (this.xHat != 0 || this.yHat != 0) {
                if (!this.playerAnima.getAnimationState(this.animaName[this.isProtect][0]).isPlaying) {
                    this.playerAnima.play(this.animaName[this.isProtect][0])
                }
            }
            if (this.xHat == 0 && this.yHat == 0) {
                if (!this.playerAnima.getAnimationState(this.animaName[this.isProtect][1]).isPlaying) {
                    this.playerAnima.play(this.animaName[this.isProtect][1])
                }
            }
            if (this.xHat != 0 && this.yHat != 0) {
                this.speed = this.normalSpd / Math.sqrt(2);
            } else {
                this.speed = this.normalSpd;
            }
        }
        if (this.node.x < this.react[3]) {
            if (this.isProtect) MainManager.instance.onSuccess(0)
            this.node.x = this.react[3]
        }
        if (this.node.y > this.react[0]) {
            if (this.isProtect) MainManager.instance.onSuccess(0)
            this.node.y = this.react[0]
        }
        if (this.node.x > this.react[2]) {
            if (this.isProtect) MainManager.instance.onSuccess(0)
            this.node.x = this.react[2]
        }
        if (this.node.y < this.react[1]) {
            if (this.isProtect) MainManager.instance.onSuccess(0)
            this.node.y = this.react[1]
        }
        this.camara.setPosition(this.node.position)
    }

    moveRight() {
        this.xHat = 1;
        this.node.scaleX = -1;
        if (this.walkSoundTimer) return
        this.walkSoundTimer = setTimeout(() => {
            this.walkSoundTimer = null
        }, 1500)
        AudioManager.instance.playAudio('脚步声')
    }
    moveLeft() {
        this.xHat = -1;
        this.node.scaleX = 1
        if (this.walkSoundTimer) return
        this.walkSoundTimer = setTimeout(() => {
            this.walkSoundTimer = null
        }, 1500)
        AudioManager.instance.playAudio('脚步声')
    }
    moveUp() {
        this.yHat = 1;
        if (this.walkSoundTimer) return
        this.walkSoundTimer = setTimeout(() => {
            this.walkSoundTimer = null
        }, 1500)
        AudioManager.instance.playAudio('脚步声')
    }
    moveDown() {
        this.yHat = -1;
        if (this.walkSoundTimer) return
        this.walkSoundTimer = setTimeout(() => {
            this.walkSoundTimer = null
        }, 1500)
        AudioManager.instance.playAudio('脚步声')
    }
    xOnStay() {
        this.xHat = 0;
    }
    yOnStay() {
        this.yHat = 0;
    }

    onCollisionEnter(other, self) {
        // this.surrounding = other.node;
        if (other.node.name == "antItem") {
            // this.surroundings = "ant";
            this.hp--
            AudioManager.instance.playAudio('女孩受伤')
        } else if (other.node.name == "boxItem") {
            //  console.log('碰到箱子')
        }
    }
    onCollisionStay(other, self) {
        if (other.node.name == "boxItem") {
            //判断角度往哪个方向阻挡 
            let angle = other.node.getPosition().sub(self.node.getPosition()).angle(cc.v2(1, 0)) * 180 / Math.PI
            //     console.log('角度', angle)
            if (angle > 45 && angle < 135) {
                if (this.node.y - other.node.y < other.node.height / 2 + this.node.height / 2) {
                    if (this.node.y < other.node.y) {
                        this.node.y = other.node.y - other.node.height / 2
                    } else {
                        this.node.y = other.node.y + other.node.height / 2 + this.node.height / 2

                    }
                }
            } else {
                if (this.node.x - other.node.x < other.node.width / 2 + this.node.width / 2) {
                    if (this.node.x < other.node.x) {
                        this.node.x = other.node.x - other.node.width / 2 - this.node.width / 2
                    } else {
                        this.node.x = other.node.x + other.node.width / 2 + this.node.width / 2
                    }
                }

            }

        }
    }
    onCollisionExit(self, other) {
        // this.surrounding.opacity = 255;
        // this.surrounding = null;
    }
    checkDie() {
        if (this.hp <= 0) {
            MainManager.instance.onFail()
        }
    }
    isProtect: number = 0
    onProtect() {
        this.isProtect = 1
        MainUIManager.instance.onTip('走向房间边缘逃出房间')
        // clearInterval(MainUIManager.instance.itemGapTimer)
    }
}
