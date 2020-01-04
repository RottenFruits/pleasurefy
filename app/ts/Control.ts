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
            'width':2,
            'move_speed':this.lines[0].move_speed,
            'wave_updown_speed':this.lines[0].wave_updown_speed
        };
    
        const Camera = gui.addFolder("Camera");
        Camera.add(this.controls, 'setX', -500, 500).onChange((e) => this.camera.position.setX(e));
        Camera.add(this.controls, 'setY', -500, 500).onChange((e) => this.camera.position.setY(e));
        Camera.add(this.controls, 'setZ', -500, 500).onChange((e) => this.camera.position.setZ(e));

        const Line = gui.addFolder("Line");
        Line.add(this.controls, 'width', 0.1, 2.0).onChange((e) => {
            for(let i= 0; i < this.lines.length; i++){
                this.lines[i].width = e;
                this.lines[i].mesh.geometry = new THREE.TubeBufferGeometry(this.lines[i].curve, 20, this.lines[i].width, 8, false );
            }
        });
        Line.add(this.controls, 'move_speed', 0.1, 5).onChange((e) => {
            for(let i= 0; i < this.lines.length; i++){
                this.lines[i].move_speed = e;
            }
        });
        Line.add(this.controls, 'wave_updown_speed', 0.01, 1.0).onChange((e) => {
            for(let i= 0; i < this.lines.length; i++){
                this.lines[i].wave_updown_speed = e;
            }
        });

        return this.controls
    }
}
