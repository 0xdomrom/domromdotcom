
var obstacle_str =
`XXXXXXXXXXXXXXXXXXXX
X    X X  X        X
X X  X X   XXX XXX X
X XX     XX    XXX X
X  XXXXX       X   X
X      X XX    Xs XX
XXX    XXXXX   XXXXX
XXX  XXXX XXXXXXXXXX
X    X X  X        X
X X  X X   XXX XXX X
X XX     XX    XXX X
X  XXXXX       X   X
X      X XX    Xg XX
XXXXXXXXXXXXXXXXXXXX`;



class PathFinder {
    constructor() {
        this.canvas = document.getElementById("pathfinder");
        this.context = this.canvas.getContext("2d");
        this.old_time = Date.now();
        this.fps = 60;
        this.holdfps = 60;
        this.frames = 0;
        this.setup();
        this.canvas.width = this.map.width();
        this.canvas.height = this.map.height();
        this.run_loop = this.run_loop.bind(this);
        this.run_loop();
    }

    setup() {
        this.setup_grid();

        let grid_settings = {
            width: this.obstacles[0].length,
            height: this.obstacles.length,
            block_size: 30
        };
        this.no_flyers = 500;
        this.map = new Map(this.obstacles, grid_settings);
        this.add_flyers();



    }

    setup_grid() {
        this.obstacles = [];
        let y = 0;
        for (let line of obstacle_str.split("\n")) {
            this.obstacles.push([]);
            for (var x = 0, len = line.length; x < len; x++) {
                if (line[x] == "X") {
                    this.obstacles[this.obstacles.length-1].push(new Obstacle(x, y));
                    continue;
                } else {
                    this.obstacles[this.obstacles.length-1].push(null);
                }

                if (line[x] == "s") {
                    this.start = {'x':x, 'y':y}
                }

                if (line[x] == "g") {
                    this.goal = {'x':x, 'y':y}
                }
            }

            y += 1;
        }

    }

    add_flyers() {
        this.flyers = [];
        let x_pos = this.start.x*this.map.grid_block_size+this.map.grid_block_size/2;
        let y_pos = this.start.y*this.map.grid_block_size+this.map.grid_block_size/2;
        for (let i=0; i < this.no_flyers; i++)
            this.flyers.push(new Flyer(this,x_pos,y_pos,3));

    }

    run_loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.run_loop);
    }

    update() {
        this.frames += 1;
        let delta = Date.now() - this.old_time;
        this.old_time += delta;
        this.fps = 1000/delta;
        for (let flyer of this.flyers) {
            flyer.update();
        }
    }

    draw() {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.map.draw(this.context);

        this.context.fillStyle = "cyan";
        this.context.shadowBlur = 4;
        this.context.shadowColor = "green";
        for (let flyer of this.flyers) {
            flyer.draw(this.context);
        }

        this.context.shadowBlur = 0;
        this.context.fillStyle = "black";
        if (this.frames%10 == 0) {
            this.holdfps = this.fps;
        }
        this.context.fillText(this.holdfps.toFixed(1), 10, 10);
    }

    Astar() {


    }
}


class Obstacle {
    constructor(grid_pos_x, grid_pos_y) {
        this.x = grid_pos_x;
        this.y = grid_pos_y;
    }

    get_coords() {
        return {x:this.x, y:this.y}
    }
}


class Map {
    constructor(obstacles, grid_size) {
        this.map = obstacles;
        this.obstacles = [];
        for (let row of obstacles) {
            for (let i of row) {
                if (i != null) {
                    this.obstacles.push(i);
                }
            }
        }
        this.grid_width = grid_size['width'];
        this.grid_height = grid_size['height'];
        this.grid_block_size = grid_size.block_size;
    }

    width() {
        return this.grid_width*this.grid_block_size;
    }

    height() {
        return this.grid_height*this.grid_block_size;
    }

    draw(context) {
        context.fillStyle = "red";
        for (let line of this.map) {
            for (let block of line) {
                if (block != null) {
                    context.beginPath();
                    let block_pos = block.get_coords();
                    context.fillRect(block_pos.x * this.grid_block_size,
                        block_pos.y * this.grid_block_size,
                        this.grid_block_size,
                        this.grid_block_size);
                    context.fill();
                }
            }
        }
    }

}


class Flyer {
    constructor(parent, pos_x, pos_y, size) {
        this.parent = parent
        this.x = pos_x;
        this.y = pos_y;
        this.size = size;
        this.acceleration = {x:0, y:0};
        this.speed = {x:0, y:0};
        this.frame = 0;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x,this.y,this.size,0,2*Math.PI);
        context.fill();
    }

    update() {
        if (this.frame%10) {
            this.acceleration = {x:Math.random()*32-16,y:Math.random()*32-16}
        }
        this.speed = {x:this.speed.x+this.acceleration.x/180.0, y:this.speed.y+this.acceleration.y/180.0};
        this.old_x = this.x;
        this.old_y = this.y;
        this.x += this.speed.x;
        this.y += this.speed.y;
        this.frame += 1;
        this.check_collision()
    }

    check_collision() {
        let grid_block_size = this.parent.map.grid_block_size;
        let x_coord = this.x/grid_block_size;
        let y_coord = this.y/grid_block_size;
        let grid_obj = this.parent.map.map[Math.floor(y_coord)][Math.floor(x_coord)];
        if (grid_obj != null) {
            if (this.x % grid_block_size < 4) {
                this.x = this.old_x;
                this.acceleration.x = 0;
                this.speed.x = 0;
            } else if (this.x % grid_block_size > grid_block_size-4) {
                this.x = this.old_x;
                this.acceleration.x = 0;
                this.speed.x = 0;
            }
            if (this.y % grid_block_size < 4) {
                this.y = this.old_y;
                this.acceleration.y = 0;
                this.speed.y = 0;
            }
            if (this.y % grid_block_size > grid_block_size-4) {
                this.y = this.old_y;
                this.acceleration.y = 0;
                this.speed.y = 0;
            }
        }
    }
}



x = new PathFinder();