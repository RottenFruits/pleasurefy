import * as THREE from 'three';
const pn = require('perlin-noise');

export class Lines {
    public lines: any;
    public line_num: number;
    public fft_size: number;
    public line_put_width: number;
    public width: number;
    public size: number[];

    constructor(line_num: number, width: number, line_put_width: number, fft_size: number, size: number[]){
        this.line_num = line_num;
        this.width = width;
        this.line_put_width = line_put_width;
        this.fft_size = fft_size;
        this.size = size;

        this.lines = new Array(line_num)
        for (let i = 0; i < this.line_num; i++) {
            let initial_array = new Array(this.fft_size / 2);
            let move_speed = 1;
            let wave_updown_speed = 0.05;
            this.lines[i] = new Line(width, line_put_width, move_speed, wave_updown_speed, i, size, initial_array)
        }
    }

    public createLines(scene: any): void{
        for (let i = 0; i < this.lines.length; i++) {
          scene.add(this.lines[i].mesh);
        }  
      }
      
    public shuffleLines(): void{
        for (let i = 0; i < this.lines.length; i++){
            let rand = Math.floor(Math.random() * ( i + 1 ));
            let tmp = this.lines[i].mesh.position.z
            this.lines[i].mesh.position.z = this.lines[rand].mesh.position.z;
            this.lines[rand].mesh.position.z = tmp;
        }
    }

    public update(fftData: number[]): void{
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].update(fftData, i);
        }
    }

    public rotation(): void{
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].rotation(this.lines[i].move_speed, 1, -64, -64 + (this.line_num - 1) * this.line_put_width);
        }
    }
      
}

export class Line {
    public size: number[];
    public width: number;
    public line_put_width: number;
    public index: number;
    public points: any;
    public curve: any;

    public geometry: any;
    public mesh: any;
    public material: any;

    public move_speed: number;
    public wave_updown_speed: number;

    constructor (width: number, line_put_width:number, move_speed:number, wave_updown_speed:number, index: number, size: number[], fftData: number[]) {
        this.size = size;
        this.width = width;
        this.line_put_width = line_put_width; //line put width       
        this.move_speed = move_speed;
        this.wave_updown_speed = wave_updown_speed;
        this.index = index;
        this.curve = this.generatedCurve(fftData);
        this.points = this.curve.getPoints(511);
        
        this.geometry = new THREE.TubeBufferGeometry(this.curve, 64, this.width, 8, false );
        this.material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        
        const y = -this.size[1]/2 + index*0;
        this.mesh.position.y = -20 + ( y || 0);
        this.mesh.position.z = (8 - index) * -this.line_put_width || 0;
    }

    public update(fftData: number[], index: number): void{
        let tmp_curve = this.generatedCurve(fftData);

        //差分を足し合わせることでゆっくり動作させる
        for (let i = this.curve.points.length - 1; i >= 0; i--) {
            this.curve.points[i].y += (tmp_curve.points[i].y - this.curve.points[i].y) * this.wave_updown_speed
        }
        this.mesh.geometry = new THREE.TubeBufferGeometry(this.curve, 64, this.width, 8, false);
    }

    public rotation(speed: number, direction: number, min: number, max: number): void{
        if(direction){
            if(max < this.mesh.position.z){
                this.mesh.position.z = min - this.line_put_width;
            }else{
                this.mesh.position.z += speed;
            }
        }else{
            if(this.mesh.position.z < min){
                this.mesh.position.z = max + this.line_put_width;
            }else{
                this.mesh.position.z -= speed;
            }
        }
    }

    public generatedCurve(fftData: number[]): THREE.CatmullRomCurve3{
        const both_side = 36;

        let straightLines = pn.generatePerlinNoise(1, both_side);
        for (let i = straightLines.length - 1; i >= 0; i--) {
            straightLines[i] *= 10;
        };

        let noise = [];
        const order = this.index < 11 ? 10 - this.index : this.index;
    
        // both side noise
        let range = 512 / 8;
        let start = range * (order % 11)
        for (let i = range + start; i >= start; i--) {
            let a = fftData[i] / 5;
            a = a > 20 ? a * 1.5 : a / 50;
            a = Math.max(5, a);
            noise.push(a);
        };
    
        noise = straightLines.concat(noise);
        let invertedPerlin = noise.slice(0);
        invertedPerlin = invertedPerlin.reverse();
        noise = noise.concat(invertedPerlin);
    
        let spline = [];
        const ratio = this.size[0] / noise.length;
        let i = 0;
        while(i < noise.length){
            spline.push(new THREE.Vector3( -this.size[0]/2 + (ratio * i), noise[i], 0 ) )
            i++;
        };
        
        const curve = new THREE.CatmullRomCurve3(spline)
        return curve;
    }

}