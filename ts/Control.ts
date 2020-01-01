import * as THREE from 'three';
import * as dat from 'dat.gui'

export class Control {
    public controls: any;
    public camera: any;
    public lines: any;

    constructor (camera: any, lines: any) {
        this.camera = camera;
        this.lines = lines;
    }
    public initControls(): void{
        const gui = new dat.GUI();
        this.controls = {
            'setX':this.camera.position.x,
            'setY':this.camera.position.y,
            'setZ':this.camera.position.z,
            'move_speed':1
        };
    
        const Camera = gui.addFolder("Camera");
        Camera.add(this.controls, 'setX', -500, 500).onChange((e) => this.camera.position.setX(e));
        Camera.add(this.controls, 'setY', -500, 500).onChange((e) => this.camera.position.setY(e));
        Camera.add(this.controls, 'setZ', -500, 500).onChange((e) => this.camera.position.setZ(e));

        const Line = gui.addFolder("Line");
        Line.add(this.controls, 'move_speed', 0.1, 5).onChange((e) => {
            for(let i= 0; i < this.lines.length; i++){
                this.lines[i].move_speed = e;
            }
        });

        return this.controls
    }
}
