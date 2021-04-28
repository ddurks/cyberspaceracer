class Racer extends Phaser.Scene {
    constructor() {
        super('Racer');
        this.road=[
            {ct:10,tu:0},
            {ct:6,tu:-0.25},
            {ct:8,tu:0},
            {ct:4,tu:0.375},
            {ct:10,tu:0.05},
            {ct:4,tu:0},
            {ct:5,tu:-0.25},
        ];
        this.camcnr = 1;
        this.camseg = 1;
        this.camx = 0; this.camy = 0; this.camz = 0;
        this.segments = new Array();
    }

    preload() {
        this.load.image('test', 'assets/clown_online_.png');
    }

    create() {
        this.generateSegments();
        this.sumct = 0;
        this.road.forEach(cnr => {
            cnr.sumct = this.sumct;
            this.sumct += cnr.ct;
        })
    }

    generateSegments() {
        for(let i = 0; i < 30; i++) {
            let ground = this.add.rectangle(0, 0, 1, 5, 0xffffff);
            let road = this.add.rectangle(0, 0, 1, 5, 0xffffff);
            this.segments.push({
                ground: ground,
                road: road
            });
        }
    }

    draw() {
        let camang = this.camz*this.road[this.camcnr].tu;
        let xd = -camang;
        let yd = 0;
        let zd = 1;

        let [cx, cy, cz] = this.skew(this.camx, this.camy, this.camz, xd, yd);

        let x = -cx;
        let y = -cy + 2;
        let z = -cz + 2;

        let cnr = this.camcnr
        let seg = this.camseg;

        let [ ppx, ppy, pscale ] = this.project(x, y, z);
        let [ px, py, scale ] = this.project(x, y, z);

        let sp = new Array();

        let righttree = true;
        for (let i = 0; i < 30; i++) {
            x += xd;
            y += yd;
            z += zd;
            
            [ px, py, scale ] = this.project(x, y, z);

            let sumct = this.getsumct(cnr, seg);

            this.drawroad(i,px,py,scale,ppx,ppy,pscale,sumct);
            // line(px-width, py, px+width, py)
            let width = 3 * scale;
            this.segments[i].road.x = px;
            this.segments[i].road.y = py;
            this.segments[i].road.displayWidth = 2*width;

            if ((sumct%3)===0) {
                let tx = px - 4.5 * scale;
                let ty = py;
                let tw = 1.5*scale;
                let th = 3*scale;
                if(righttree) {
                    tx = px * 4.5 * scale;
                    righttree = !righttree;
                }
                sp.push({
                    x:tx,y:ty,w:tw,h:th
                })
            }

            xd+=this.road[cnr].tu;

            [ cnr, seg ] = this.advance(cnr, seg);

            // -- track previous projected position
            // ppx,ppy,pscale=px,py,scale
            ppx = px;
            ppy = py;
            pscale = scale;
        }
    }

    update() {
        this.draw();
        this.camz += 0.3;
        if (this.camz > 1) {
            this.camz-=1
            let [ tempcamcnr, tempcamseg ] = this.advance(this.camcnr, this.camseg);
            this.camcnr = tempcamcnr;
            this.camseg = tempcamseg;
        }
    }

    project(x, y, z) {
        let scale = (GAME.SIZE/2)/z;
        return [ x * scale + (GAME.SIZE/2), y * scale + (GAME.SIZE/2), scale ];
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

    skew(x, y, z, xd, yd) {
        return [ x + z * xd, y + z * yd, z ];
    }

    drawroad(i, x1,y1,scale1,x2,y2,scale2,sumct) {
        if (Math.floor(y2) < Math.ceil(y1)) {
            return;
        }

        let gndcol = (sumct%6)>=3 ? 0x00008b : 0x0000cd;
        this.drawRect(i, GAME.SIZE/2, y1, GAME.SIZE, Math.floor(y2) - Math.ceil(y1), gndcol);
        //this.drawRoad(i, GAME.SIZE/2, y1, 3*scale1, Math.floor(y2) - Math.ceil(y1), 0x00ffff);
    }

    drawRect(i, px, py, width, height, color) {
        this.segments[i].ground.x = px;
        this.segments[i].ground.y = py;
        this.segments[i].ground.displayWidth = width;
        this.segments[i].ground.displayHeight = height <= 250 ? height : 250;
        this.segments[i].ground.fillColor = color;    
    }

    drawRoad(i, px, py, width, height, color) {
        this.segments[i].road.x = px;
        this.segments[i].road.y = py;
        this.segments[i].road.displayWidth = width;
        this.segments[i].road.displayHeight = height <= 250 ? height : 250;
        this.segments[i].road.fillColor = color;    
    }

    getsumct(cnr, seg) {
        return this.road[cnr].sumct+seg-1;
    }
}

const GAME = {
    SIZE: 512
}

var gameConfig = {
    backgroundColor: 0x00008b,
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