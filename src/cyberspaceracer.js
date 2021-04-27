class Racer extends Phaser.Scene {
    constructor() {
        super('Racer');
        this.road=[
            {ct:10,tu:0, sumct: 0},
            {ct:6,tu:-1, sumct: 10},
            {ct:8,tu:0, sumct: 16},
            {ct:4,tu:1.5, sumct: 24},
            {ct:10,tu:0.2, sumct: 28},
            {ct:4,tu:0, sumct: 38},
            {ct:5,tu:-1, sumct: 42},
        ];
        this.camcnr = 0;
        this.camseg = 0;
        this.camx = 0; this.camy = 0; this.camz = 0;
        this.rectangles = new Array();
    }

    create() {
        this.generateRectangles();
    }

    generateRectangles() {
        for(let i = 0; i < 30; i++) {
            let rect = this.add.rectangle(0, 0, 1, 10, 0xffffff);
            this.rectangles.push(rect);
        }
    }

    draw() {
        let camang = this.camz*this.road[this.camcnr].tu;
        let xd = -camang;
        let yd = 0;
        let zd = 1;

        let [cx, cy, cz] = this.skew(this.camx, this.camy, this.camz, xd, yd);

        let x = -cx;
        let y = -cy + 1;
        let z = -cz + 1;

        let cnr = this.camcnr
        let seg = this.camseg;

        for (let i = 0; i < 30; i++) {
            let [ px, py, scale ] = this.project(x, y, z);

            let width = 3 * scale;

            let sumct = this.getsumct(cnr, seg);

            // line(px-width, py, px+width, py)
            this.rectangles[i].x = px;
            this.rectangles[i].y = py;
            this.rectangles[i].displayWidth = 2*width;

            x += xd;
            y += yd;
            z += zd;

            xd+=this.road[cnr].tu;

            [ cnr, seg ] = this.advance(cnr, seg);
        }
    }

    update() {
        this.draw();
        this.camz += 0.1;
        if (this.camz > 1) {
            this.camz-=1
            let [ tempcamcnr, tempcamseg ] = this.advance(this.camcnr, this.camseg);
            this.camcnr = tempcamcnr;
            this.camseg = tempcamseg;
        }
    }

    advance(cnr, seg) {
        seg+=1;
        if (seg > this.road[cnr].ct) {
            seg = 1;
            cnr += 1;
            if (cnr > this.road.length - 1) {
                cnr = 0;
            }
        }
        return [ cnr, seg ];
    }

    project(x, y, z) {
        let scale = (GAME.SIZE/2)/z;
        return [ x * scale + (GAME.SIZE/2), y * scale + (GAME.SIZE/2), scale ];
    }

    skew(x, y, z, xd, yd) {
        return [ x + z * xd, y + z * yd, z ];
    }

    getsumct(cnr, seg) {
        return this.road[cnr].sumct+seg-1;
    }
}

const GAME = {
    SIZE: 512
}

var gameConfig = {
	render: {
		roundPixels: true,
		pixelArt: true,
		antialias: false,
	},
	scale: {
		parent: 'phaser-div',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: GAME.SIZE,
		height: GAME.SIZE
	},
	parent: "phaser-div",
	dom: {
		createContainer: true
	},	  
    physics: {
		default: 'arcade',
		arcade: {
			debug: false,
		}
    },
	scene: [Racer]
}
var game = new Phaser.Game(gameConfig);
window.focus();