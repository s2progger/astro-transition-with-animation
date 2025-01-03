import invariant from "tiny-invariant";

const CONFIG = {
  STAR_COUNT: 800,
  SPEED: 0.1,
  STAR_SPEED_FACTOR: 0.0675,
  STAR_POSITION_FACTOR: 0.0225,
  BACKGROUND_OPACITY: 0.4,
};

export class Star {
  private x: number;
  private y: number;
  private z: number;
  private xPrev: number;
  private yPrev: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.xPrev = x;
    this.yPrev = y;
  }

  update(width: number, height: number, speed: number) {
    this.xPrev = this.x;
    this.yPrev = this.y;
    this.z += speed * CONFIG.STAR_SPEED_FACTOR;
    this.x += this.x * (speed * CONFIG.STAR_POSITION_FACTOR) * this.z;
    this.y += this.y * (speed * CONFIG.STAR_POSITION_FACTOR) * this.z;

    if (this.isOutOfBounds(width, height)) {
      this.reset(width, height);
    }
  }

  private isOutOfBounds(width: number, height: number): boolean {
    return (
      this.x > width / 2 ||
      this.x < -width / 2 ||
      this.y > height / 2 ||
      this.y < -height / 2
    );
  }

  public reset(width: number, height: number): void {
    this.x = Math.random() * width - width / 2;
    this.y = Math.random() * height - height / 2;
    this.xPrev = this.x;
    this.yPrev = this.y;
    this.z = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.z;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.xPrev, this.yPrev);
    ctx.stroke();
  }
}

export class StarField {
  private stars: Star[];
  private rafId: number;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;

  constructor() {
    this.stars = Array.from({ length: CONFIG.STAR_COUNT }, () => new Star());
    this.rafId = 0;

    this.canvas = document.querySelector(
      "#starfield-canvas",
    ) as HTMLCanvasElement;
    invariant(this.canvas, "canvas should not be null");

    this.ctx = this.canvas.getContext("2d")!;
    invariant(this.ctx, "canvas context should not be null");

    this.container = document.querySelector("#starfield") as HTMLElement;
    invariant(this.container, "container should not be null");

    new ResizeObserver(() => this.setup()).observe(this.container);
  }

  private setup(): void {
    this.rafId > 0 && cancelAnimationFrame(this.rafId);

    const { clientWidth: width, clientHeight: height } = this.container;
    this.setupCanvas(width, height);
    this.initializeStars(width, height);

    this.ctx.translate(width / 2, height / 2);
    this.ctx.fillStyle = `rgba(0, 0, 0, ${CONFIG.BACKGROUND_OPACITY})`;
    this.ctx.strokeStyle = "white";

    this.rafId = requestAnimationFrame(() => this.frame());
  }

  private setupCanvas(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
  }

  private initializeStars(width: number, height: number): void {
    this.stars.forEach((star) => star.reset(width, height));
  }

  private frame(): void {
    const { clientWidth: width, clientHeight: height } = this.container;

    this.stars.forEach((star) => {
      star.update(width, height, CONFIG.SPEED);
      star.draw(this.ctx);
    });

    this.ctx.fillRect(-width / 2, -height / 2, width, height);
    this.rafId = requestAnimationFrame(() => this.frame());
  }
}
