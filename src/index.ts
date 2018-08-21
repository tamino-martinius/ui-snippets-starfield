import { GUI } from 'dat.gui'

declare var dat: any;

interface Star {
  x: number;
  y: number;
  size: number;
  angle: number;
  velocity: number;
}

const PI2 = Math.PI * 2;

class Starfield {
  settings = {
    count: 1000,
    debug: false,
    colors: [
      '#B24A35',
      '#9CB235',
      '#36B24A',
      '#369DB2',
      '#4A35B2',
    ],
    size: {
      min: 0.1,
      max: 3,
      diff: 0,
    },
    speed: 100,
  };

  positionOffset = 0;
  colorSwitchCount = 200;
  width: number = window.innerWidth;
  height: number = window.innerHeight;
  currentCount: number = 0;
  currentSpeed: number = 100;
  stars: Star[] = [];
  canvas = document.getElementsByTagName('canvas')[0] || document.createElement('canvas');
  ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw 'failed to get context';
    this.ctx = ctx;
    this.initGui();
    this.initStarCount();
    this.initSize();
  }

  get starAttributes(): Star {
    return {
      size: Math.random(),
      x: Math.random(),
      y: Math.random(),
      angle: Math.random() * PI2,
      velocity: Math.random(),
    };
  }

  initStarCount() {
    if (this.currentCount < this.settings.count) {
      const neededCount = this.settings.count - this.currentCount;
      const recycleCount = Math.min(neededCount, this.stars.length - this.currentCount);
      const recycleIndex = this.currentCount + recycleCount;
      const newCount = neededCount - recycleCount;
      for (let i = this.currentCount; i < recycleIndex; i += 1) {
        this.stars[i] = this.starAttributes;
      }
      this.stars.push(...Array.from({ length: newCount }).map(() => this.starAttributes));
    }
    this.currentCount = this.settings.count;
    this.colorSwitchCount = ~~(this.currentCount / 5);
  }

  initSize() {
    this.settings.size.diff = this.settings.size.max - this.settings.size.min;
  }

  initSpeed() {
    const oldPosition = Date.now() / this.currentSpeed;
    const newPosition = Date.now() / this.settings.speed;
    this.positionOffset += oldPosition - newPosition;
    this.currentSpeed = this.settings.speed;
  }

  initGui() {
    const gui: GUI = new dat.GUI();
    gui.add(this.settings, 'count', 1e2, 1e4, 10).onChange(() => {
      this.initStarCount();
    });
    gui.add(this.settings, 'speed', 1, 100, 1).onChange(() => {
      this.initSpeed();
    });
    const size = gui.addFolder('size');
    size.open();
    size.add(this.settings.size, 'min', 0.1, 2, 0.1).onChange(() => {
      this.initSize();
    });
    size.add(this.settings.size, 'max', 2, 5, 0.1).onChange(() => {
      this.initSize();
    });
    colors.open();
    colors.addColor(this.settings.colors, '0');
    colors.addColor(this.settings.colors, '1');
    colors.addColor(this.settings.colors, '2');
    colors.addColor(this.settings.colors, '3');
    colors.addColor(this.settings.colors, '4');
    gui.add(this.settings, 'debug').onChange(() => {
      // init
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    let colorIndex = 0;
    const position = this.positionOffset + Date.now() / this.currentSpeed;
    const baseWidth = Math.ceil(position) * this.width;
    const baseHeight = Math.ceil(position) * this.height;
    for (let i = 0; i < this.currentCount; i += 1) {
      const star = this.stars[i];
      const x = (baseWidth + star.x * this.width + Math.sin(star.angle) * position) % this.width;
      const y = (baseHeight + star.y * this.height + Math.cos(star.angle) * position) % this.height;
      if (i % this.colorSwitchCount === 0) {
        this.ctx.fill();
        this.ctx.fillStyle = this.settings.colors[colorIndex];
        colorIndex += 1;
        this.ctx.beginPath();
      }
      this.ctx.moveTo(x, y);
      this.ctx.arc(x, y, star.size * this.settings.size.diff + this.settings.size.min, 0, 360);
    };
    this.ctx.fill();
  }
}

const starfield = new Starfield();
const draw = starfield.draw.bind(starfield);

console.log(starfield);

function run() {
  requestAnimationFrame(run);
  draw();
}

run();
