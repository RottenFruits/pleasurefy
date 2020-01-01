import * as THREE from 'three';
import * as dat from 'dat.gui'

export class Control {
    public controls: any;
    public camera: any;

    constructor (camera: any) {
        this.camera = camera;
    }
    public initControls(): void{
        const gui = new dat.GUI();
        this.controls = {
            'setX':this.camera.position.x,
            'setY':this.camera.position.y,
            'setZ':this.camera.position.z
        };
    
        const Camera = gui.addFolder("Camera");
        Camera.add(this.controls, 'setX', -500, 500).onChange((e) => this.camera.position.setX(e));
        Camera.add(this.controls, 'setY', -500, 500).onChange((e) => this.camera.position.setY(e));
        Camera.add(this.controls, 'setZ', -500, 500).onChange((e) => this.camera.position.setZ(e));

        return this.controls
    }
}
