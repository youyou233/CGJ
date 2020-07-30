import ResourceManager from "../manager/resouce_manager";
import config from "../../config";
import PoolManager from "../manager/pool_manager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {


    speed: number = 750;

    // LIFE-CYCLE CALLBACKS:
    onLoad () {}

    update (dt) {
        //TODO: destory on edge
        // if (this.node.x >= 600 || this.node.x <= -600) {
        //     this.putInPool();
        // }

        this.node.x += this.speed * dt;
    }

    init(playerFacing: number, playerPos: number) {
        // console.log('initializing');
        this.speed = playerFacing * this.speed
        this.node.scaleX = -playerFacing
        this.node.x = playerPos + playerFacing * 30;
    }

    putInPool() {
        this.speed = 750;
        PoolManager.instance.removeObjectByName("bullet", this.node)
    }

    onCollisionEnter() {
        this.putInPool();
    }

}
