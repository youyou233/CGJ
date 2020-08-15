import { Emitter } from "../utils/emmiter"
import MainManager from "../manager/main_manager"

const {ccclass, property} = cc._decorator;

enum PlayerStatus {
    movingRight = 1,
    movingLeft = 2,
    movingUp = 3,
    movingDown = 4,
    onStay = 5,
}

@ccclass
export default class PlayerItem extends cc.Component {

    xSpeed: number = 0;
    ySpeed: number = 0;
    surrounding: cc.Node = null;
    holding: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // Movement control
        Emitter.register("rightArrowDown", this.moveRight, this)
        Emitter.register("leftArrowDown", this.moveLeft, this)
        Emitter.register("upArrowDown", this.moveUp, this)
        Emitter.register("downArrowDown", this.moveDown, this)
        Emitter.register("rightArrowUp", this.xOnStay, this)
        Emitter.register("leftArrowUp", this.xOnStay, this)
        Emitter.register("upArrowUp", this.yOnStay, this)
        Emitter.register("downArrowUp", this.yOnStay, this)
        // Pick up drop down
        Emitter.register("pickUp", this.pickUp, this)
        Emitter.register("dropDown", this.dropDown, this)
    }

    update (dt) {
        this.node.x += this.xSpeed * dt;
        this.node.y += this.ySpeed * dt;
    }

    moveRight(){
        this.xSpeed = 100;
    }
    moveLeft(){
        this.xSpeed = -100;
    }
    moveUp(){
        this.ySpeed = 100;
    }
    moveDown(){
        this.ySpeed = -100;
    }
    xOnStay() {
        this.xSpeed = 0;
    }
    yOnStay() {
        this.ySpeed = 0;
    }

    pickUp() {
        if (this.surrounding != null) {
            switch(this.surrounding.name) {
                case "box":
                    Emitter.fire("pickUpBox");
                    this.holding = this.surrounding;
                    // console.log("picking up box");
                    break;
                case "turret":
                    Emitter.fire("pickUpTurret");
                    this.holding = this.surrounding;
                    break;
            }
        }
    }

    dropDown() {
        if (this.holding != null) {
            this.holding.setParent(cc.find("Canvas/gamePage"))
            this.holding.setPosition(this.node.x, this.node.y - 50);
            this.holding = null;
            // console.log("dropping down");
        }
    }

    onCollisionEnter(other, self) {
        this.surrounding = other.node;
        if (other.node.name == "ant") {
            // this.surroundings = "ant";
            MainManager.instance.onFail();
        } else if (other.node.name == "box") {
            this.surrounding.opacity = 200;
            // console.log("box detected");
            // this.surroundings = "box";
        } else if (other.node.name == "turret") {
            this.surrounding.opacity = 200;
            // console.log("turret detected");
            // this.surroundings = "turret";
        } 
    }

    onCollisionExit(self, other) {
        this.surrounding.opacity = 255;
        this.surrounding = null;
    }
}