"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
var pn = __importStar(require("perlin-noise"));
var Line = /** @class */ (function () {
    function Line(y, width, amp, index, size, fftData) {
        this.size = size;
        this.width = width;
        this.amp = amp;
        this.index = index;
        this.points = this.generatedPoints(fftData);
        this.geometry = new THREE.Geometry();
        this.geometry.vertices = this.points;
        this.material = new THREE.LineBasicMaterial({ color: 0xFFFFFF, linewidth: 3 });
        ;
        this.mesh = new THREE.Line(this.geometry, this.material);
        this.mesh.position.y = -20 + (y || 0);
        this.mesh.position.z = (8 - index) * -this.width || 0;
        this.counter = 0;
    }
    Line.prototype.update = function (fftData, index) {
        var wave_updown_speed = 0.05;
        // return
        if (!this.geometry.vertices)
            return;
        this.points = this.generatedPoints(fftData);
        for (var i = this.geometry.vertices.length - 1; i >= 0; i--) {
            this.geometry.vertices[i].y += (this.points[i].y - this.geometry.vertices[i].y) * wave_updown_speed;
        }
        ;
        this.mesh.geometry.verticesNeedUpdate = true;
    };
    Line.prototype.rotation = function (speed, direction, min, max) {
        if (direction) {
            if (max < this.mesh.position.z) {
                this.mesh.position.z = min - this.width;
            }
            else {
                this.mesh.position.z += speed;
            }
        }
        else {
            if (this.mesh.position.z < min) {
                this.mesh.position.z = max + this.width;
            }
            else {
                this.mesh.position.z -= speed;
            }
        }
    };
    Line.prototype.generatedPoints = function (fftData) {
        var both_side = 36;
        if (!fftData)
            return;
        var i;
        var straightLines = pn.generatePerlinNoise(1, both_side);
        for (i = straightLines.length - 1; i >= 0; i--) {
            straightLines[i] *= 10;
        }
        ;
        // console.log(fftData)
        // var noise = perlin.generatePerlinNoise(1, 128);
        var noise = [];
        var order = this.index < 11 ? 10 - this.index : this.index;
        // both side noise
        var range = 512 / 8;
        var start = range * (order % 11);
        for (i = range + start; i >= start; i--) {
            var a = fftData[i] / 5;
            a = a > 20 ? a * 1.5 : a / 50;
            a = Math.max(5, a);
            noise.push(a);
        }
        ;
        noise = straightLines.concat(noise);
        var invertedPerlin = noise.slice(0);
        invertedPerlin = invertedPerlin.reverse();
        noise = noise.concat(invertedPerlin);
        var spline = [];
        i = 0;
        var ratio = this.size[0] / noise.length;
        while (i < noise.length) {
            spline.push(new THREE.Vector3(-this.size[0] / 2 + (ratio * i), noise[i], 0));
            i++;
        }
        ;
        var curve = new THREE.CatmullRomCurve3(spline);
        return curve.getPoints(511);
        return spline;
    };
    return Line;
}());
exports.Line = Line;
