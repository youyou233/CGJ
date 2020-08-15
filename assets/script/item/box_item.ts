import { Emitter } from "../utils/emmiter"

const {ccclass, property} = cc._decorator;

@ccclass
export default class BoxItem extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Emitter.register("pickUpBox", this.onPickUp, this);
    }

    onPickUp() {
        // 看看有没有更好的方法
        this.node.setParent(cc.find("Canvas/gamePage/player/hand"));
        this.node.setPosition(0,0);
    }   

    // update (dt) {}
}