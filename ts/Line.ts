import * as THREE from 'three';
const pn = require('perlin-noise');

export class Line {
    public size: number[];
    public width: number;
    public amp: number;
    public index: number;
    public points: THREE.Vector3[];

    public geometry: THREE.Geometry;
    public mesh: THREE.Line;
    public material: THREE.LineBasicMaterial;

    constructor (y:number, width:number, amp:number, index: number, size: number[], fftData: number[]) {
        this.size = size;
        this.width = width;
        this.amp = amp;
        this.index = index;
        this.points = this.generatedPoints(fftData);
        
        this.geometry = new THREE.Geometry();
        this.geometry.vertices = this.points;

        this.material = new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 3});;
        
        this.mesh = new THREE.Line(this.geometry, this.material);
        this.mesh.position.y = -20 + (y || 0);
        this.mesh.position.z = (8 - index) * -this.width || 0;
    }

    public update(fftData: number[], index: number): void{
        const wave_updown_speed = 0.05;

        if(!this.geometry.vertices) return;
    
        this.points = this.generatedPoints(fftData);
    
        for (let i = this.geometry.vertices.length - 1; i >= 0; i--) {
            this.geometry.vertices[i].y += (this.points[i].y - this.geometry.vertices[i].y) * wave_updown_speed;
        };
    
        (this.mesh as any).geometry.verticesNeedUpdate = true;
    }

    public rotation(speed: number, direction: number, min: number, max: number): void{
        if(direction){
            if(max < this.mesh.position.z){
                this.mesh.position.z = min - this.width;
            }else{
                this.mesh.position.z += speed;
            }
        }else{
            if(this.mesh.position.z < min){
                this.mesh.position.z = max + this.width;
            }else{
                this.mesh.position.z -= speed;
            }
        }
    }

    public generatedPoints(fftData: number[]): THREE.Vector3[]{
        const both_side = 36;

        let tmp = [];
        tmp.push(new THREE.Vector3(0, 0, 0));
        if(!fftData) return tmp;

        let straightLines = pn.generatePerlinNoise(1, both_side);
        for (let i = straightLines.length - 1; i >= 0; i--) {
            straightLines[i] *= 10;
        };
        // console.log(fftData)
    
        // let noise = perlin.generatePerlinNoise(1, 128);
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
        return curve.getPoints(511);
    
        return spline
    }
}