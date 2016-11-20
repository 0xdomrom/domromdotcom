
var directions = [[-1,-1],[-1,0],[0,-1],[-1,1],[1,-1],[1,1],[1,0],[0,1]];

var block_str =
`XXXXXXXXXXXXXXXXXXXX
X    X X  X        X
X X  X X  XXXX XXX X
X XX     XX    XXX X
X  XXXXX       X   X
X      X XX    Xs XX
XXX    XXXXX   XXXXX
XXX  XXX  XXXXXXXXXX
X    X X  X        X
X X  X X  XXXX XXX X
X XX     XX  X XXX X
X  XXXXX     X X   X
X      X XX    Xg XX
XXXXXXXXXXXXXXXXXXXX`;


function calc_dist(p1, p2) {
    // euclidean distance
    // console.log("calc dist: "+p1.x+"-"+p1.y+" to "+p2.x+"-"+p2.y);
    // console.log(p1.x-p2.x, p1.y-p2.y);
    // console.log(Math.pow(p1.x-p2.x, 2)+Math.pow(p1.y-p2.y, 2));
    //console.log(Math.sqrt(Math.pow(p1.x-p2.x, 2)+Math.pow(p1.y-p2.y, 2)));
    return (Math.abs(p1.x-p2.x) + Math.abs(p1.y-p2.y));
    //return Math.sqrt(Math.pow(p1.x-p2.x, 2)+Math.pow(p1.y-p2.y, 2))
}




class PathFinder {
    constructor(canvas, slider) {


        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");

        this.slider = slider;

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

    restart() {
        this.setup();
        this.canvas.width = this.map.width();
        this.canvas.height = this.map.height();
    }

    setup() {
        this.start = null;
        this.goal = null;
        this.block_size = 30;

        this.setup_grid(30);
        let grid_settings = {
            width: this.blocks[0].length,
            height: this.blocks.length,
            block_size: this.block_size
        };

        this.no_flyers = this.slider.value;
        this.map = new Map(this.blocks, grid_settings);
        this.add_flyers();

        this.shortest_path = this.Astar();
        this.came_from = this.shortest_path[1];
        this.shortest_path = this.shortest_path[0];

        this.map.set_vectors(this.shortest_path, this.came_from);
    }

    setup_grid(block_size) {
        this.blocks = [];
        let y = 0;
        for (let line of block_str.split("\n")) {
            this.blocks.push([]);
            for (var x = 0, len = line.length; x < len; x++) {
                if (line[x] == "X") {
                    this.blocks[this.blocks.length-1].push(new Block(x, y, block_size, true));
                    continue;
                } else {
                    this.blocks[this.blocks.length-1].push(new Block(x, y, block_size, false));
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

        this.check_no_flyers();

        for (let flyer of this.flyers) {
            flyer.update();
        }
    }

    draw() {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.map.draw(this.context);


        for (let flyer of this.flyers) {
            flyer.draw(this.context);
        }

        this.context.shadowBlur = 0;
        this.context.fillStyle = "white";
        if (this.frames%10 == 0) {
            this.holdfps = this.fps;
        }
        this.context.fillText(this.holdfps.toFixed(1), 10, 10);



        this.context.strokeStyle = "red";
        this.context.strokeWidth = 4;
        this.context.beginPath();
        this.context.moveTo(this.shortest_path[0].x*this.block_size+12,
                            this.shortest_path[0].y*this.block_size+12);
        for (let i in this.shortest_path) {
            this.context.lineTo(
                this.shortest_path[i].x*this.block_size+12,
                this.shortest_path[i].y*this.block_size+12);
        }

        this.context.stroke();

    }


    initialiseAstar() {
        console.log("start:"+this.start.x + "-" + this.start.y);
        console.log("goal:"+this.goal.x + "-" + this.goal.y);
        var h_vals = [];

        for (let i = 0; i<this.blocks.length;i++) {
            h_vals.push([]);
            for (let j=0; j<this.blocks[0].length;j++) {
                let dist = calc_dist({x:j,y:i}, this.goal);
                h_vals[h_vals.length-1].push(dist);
            }
        }

        var came_from = [];
        for (let i = 0; i<this.blocks.length;i++) {
            came_from.push([]);
            for (let j=0; j<this.blocks[0].length;j++) {
                came_from[came_from.length-1].push(null)
            }
        }

        var gScore = [];
        // cost of getting from start to that node
        for (let i = 0; i<this.blocks.length;i++) {
            gScore.push([]);
            for (let j=0; j<this.blocks[0].length;j++) {
                gScore[gScore.length-1].push(Infinity)
            }
        }

        var closed_set = [];
        // nodes that have been visited
        for (let i = 0; i<this.blocks.length;i++) {
            closed_set.push([]);
            for (let j=0; j<this.blocks[0].length;j++) {
                closed_set[closed_set.length-1].push(false)
            }
        }

        var fScore = [];
        // For each node, the total cost of getting from the start node to the goal
        // by passing by that node
        for (let i = 0; i<this.blocks.length;i++) {
            fScore.push([]);
            for (let j=0; j<this.blocks[0].length;j++) {
                fScore[fScore.length-1].push(Infinity)
            }
        }

        fScore[this.start.y][this.start.x] = h_vals[this.start.y][this.start.x];


        return [h_vals, came_from, gScore, fScore, closed_set];
    }



    Astar() {

        var open_set = [this.blocks[this.start.y][this.start.x]];

        var init_obj = this.initialiseAstar();

        var h_vals = init_obj[0];
        var came_from = init_obj[1];
        var gScore = init_obj[2];
        var fScore = init_obj[3];
        var closed_set = init_obj[4];


        while (open_set.length != 0) {
            let current = null;
            let ind = 0;
            for (let i=0; i<open_set.length; i++) {
                if (current==null) {
                    current = open_set[i];
                    ind = i;
                } else if (fScore[open_set[i].y][open_set[i].x] <= fScore[current.y][current.x]) {
                    current = open_set[i];
                    ind = i;
                }
            }



            open_set.splice(ind, 1);
            closed_set[current.y][current.x] = true;
            for (let dir of directions) {
                let neighbor = this.blocks[current.y+dir[0]][current.x+dir[1]];
                if (closed_set[current.y+dir[0]][current.x+dir[1]] ||
                    neighbor.obstacle) {
                    continue;
                }
                let tentative_gscore = gScore[current.y][current.x] + calc_dist(current, neighbor);
                if (open_set.indexOf(neighbor) == -1) {
                    open_set.push(neighbor);
                } else if (tentative_gscore > gScore[neighbor.y][neighbor.y]) {
                    continue;
                }

                came_from[neighbor.y][neighbor.x] = current;
                gScore[neighbor.y][neighbor.y] = tentative_gscore;
                fScore[neighbor.y][neighbor.x] = tentative_gscore + h_vals[neighbor.y][neighbor.x];
            }
        }

        if (came_from[this.goal.y][this.goal.x].x != null) {
            console.log("goal found! :D");
            let at = {x:this.goal.x, y:this.goal.y};
            let path = [at];
            while (at.x != this.start.x || at.y != this.start.y) {
                at = {x:came_from[at.y][at.x].x, y:came_from[at.y][at.x].y};
                path.push(at);
            }

            return [path,came_from];
        }

    }


    check_no_flyers() {
        if (this.slider.value != this.no_flyers) {
            let diff = this.slider.value - this.no_flyers;

            if (diff < 0) {
                for (let i=0;i<Math.abs(diff);i++) {
                    this.flyers.pop();
                }
            } else {
                let x_pos = this.start.x*this.map.grid_block_size+this.map.grid_block_size/2;
                let y_pos = this.start.y*this.map.grid_block_size+this.map.grid_block_size/2;
                for (let i=0;i<diff;i++) {
                    this.flyers.push(new Flyer(this,x_pos,y_pos,3));
                }
            }
            this.no_flyers = this.slider.value;
        }
    }
}


class Block {
    constructor(grid_pos_x, grid_pos_y, block_size, is_obst) {
        this.x = grid_pos_x;
        this.y = grid_pos_y;
        this.block_size = block_size;
        this.obstacle = is_obst;
        this.dir = {'x':Math.random()*2-1, 'y':Math.random()*2-1};
        let angle = Math.atan2(this.dir.x, this.dir.y);
        this.x_force = Math.cos(angle) * this.block_size/2;
        this.y_force = Math.sin(angle) * this.block_size/2;
    }

    get_coords() {
        return {x:this.x, y:this.y}
    }

    draw(context) {
        if (!this.obstacle) {

            context.strokeStyle = "#FFE660";
            context.strokeWidth = 2;

            let block_pos = this.get_coords();

            let x_center = block_pos.x * this.block_size+this.block_size/2;
            let y_center = block_pos.y * this.block_size+this.block_size/2;

            context.beginPath();
            context.moveTo(x_center,y_center);
            context.lineTo(x_center+this.x_force,
                            y_center+this.y_force);
            context.stroke();
        }
    }

    set_dir(dir) {
        this.dir = dir;
        let angle = Math.atan2(this.dir.x, this.dir.y);
        this.x_force = Math.cos(angle) * this.block_size/2;
        this.y_force = Math.sin(angle) * this.block_size/2;
    }

    add_speed(vector) {
        if (!this.obstacle) {
            vector.y += this.y_force/this.block_size/5;
            vector.x += this.x_force/this.block_size/5;
        }
        return vector
    }
}


class Map {
    constructor(blocks, grid_size) {
        this.map = blocks;
        this.blocks = [];
        for (let row of blocks) {
            for (let i of row) {
                if (i != null) {
                    this.blocks.push(i);
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

    set_vectors(shortest_path, came_from_array) {
        this.looking_ats = [];
        for (let row of this.map) {
            for (let block of row) {
                if (!block.obstacle) {
                    var looking_at = null;
                    var closest_index_to_end = null;
                    var dir_of_closest_index = null;
                    var closest_block = null;
                    // TODO: speed up with caching lmao cbf
                    for (var dir of directions) {
                        looking_at = block;
                        while (true) {
                            looking_at = this.map[looking_at.y+dir[1]][looking_at.x+dir[0]];
                            if (looking_at.obstacle) {
                                break;
                            }
                            for (var i=0; i<shortest_path.length; i++) {
                                if (looking_at.x > shortest_path[i].x && looking_at.y == shortest_path[i].y) {
                                    if (closest_index_to_end == null) {
                                        closest_index_to_end = i;
                                        dir_of_closest_index = dir;
                                        closest_block = looking_at;
                                    }
                                    if (i > closest_index_to_end) {
                                        console.log(looking_at, block);
                                        closest_index_to_end = i;
                                        dir_of_closest_index = dir;
                                        closest_block = looking_at;
                                    }
                                }
                            }
                        }

                    }
                    this.looking_ats.push([block, closest_block]);

                    if (closest_index_to_end == null) {

                        dir = {x:came_from_array[block.y][block.x].x - block.x ,y:came_from_array[block.y][block.x].y - block.y}
                        block.set_dir(dir);
                        //console.log(dir)
                    } else {
                        dir = {x:dir_of_closest_index[0], y:dir_of_closest_index[1]}
                        block.set_dir(dir)
                    }


                }
            }
        }
    }

    draw(context) {
        for (let line of this.map) {
            for (let block of line) {
                if (block.obstacle) {
                    context.fillStyle = "#4B1C00";

                    context.beginPath();
                    let block_pos = block.get_coords();
                    context.fillRect(block_pos.x * this.grid_block_size,
                        block_pos.y * this.grid_block_size,
                        this.grid_block_size,
                        this.grid_block_size);
                    context.fill();
                } else {
                    context.fillStyle = "#B2A680";
                    context.beginPath();
                    let block_pos = block.get_coords();
                    context.fillRect(block_pos.x * this.grid_block_size,
                        block_pos.y * this.grid_block_size,
                        this.grid_block_size,
                        this.grid_block_size);
                    context.fill();

                    block.draw(context);
                }
            }
        }
        context.strokeWidth = 2;
        context.strokeStyle = "purple";
        context.fillStyle = "green";
        for (let item of this.looking_ats) {
            if (item[1] == null) {
                context.rect(item[0].x * this.grid_block_size+17, item[0].y * this.grid_block_size+17, 4, 4)
            }
            else {
                context.beginPath();
                context.moveTo(item[0].x * this.grid_block_size+17, item[0].y * this.grid_block_size+17);
                context.lineTo(item[1].x * this.grid_block_size+17, item[1].y * this.grid_block_size+17);
                context.arc(item[1].x * this.grid_block_size+17, item[1].y * this.grid_block_size+17, 4, 0, Math.PI*2);
                context.stroke();

            }
        }
    }
}


class Flyer {
    constructor(parent, pos_x, pos_y, size) {
        this.parent = parent;
        this.x = pos_x;
        this.y = pos_y;
        this.size = size;
        this.acceleration = {x:0, y:0};
        this.speed = {x:0, y:0};
        this.frame = 0;
        this.reached_end = false;
    }

    draw(context) {
        if (this.reached_end) {
            context.fillStyle = "#3F452D";
        } else {
            context.fillStyle = "#C1AE49";
        }

        context.shadowBlur = 2;
        context.shadowColor = "#006D39";
        context.beginPath();
        context.arc(this.x,this.y,this.size,0,2*Math.PI);
        context.fill();
    }

    update() {
        let grid_block_size = this.parent.map.grid_block_size;
        let x_coord = Math.floor(this.x/grid_block_size);
        let y_coord = Math.floor(this.y/grid_block_size);
        let grid_obj = this.parent.map.map[y_coord][x_coord];

        if (this.frame%10) {
            this.acceleration = {x:Math.random()*16-8,y:Math.random()*16-8}
        }
        this.speed = {x:this.speed.x+this.acceleration.x/180.0, y:this.speed.y+this.acceleration.y/180.0};

        let temp_speed = grid_obj.add_speed(this.speed);

        this.old_x = this.x;
        this.old_y = this.y;
        this.x += Math.max(-5, Math.min(5,temp_speed.x));
        this.y += Math.max(-5, Math.min(5,temp_speed.y));
        this.frame += 1;

        this.check_collision(x_coord, y_coord, grid_block_size, grid_obj);
    }

    check_collision(x_coord, y_coord, grid_block_size, grid_obj) {
        if (grid_obj.obstacle) {

            if (x_coord == 0) {
                this.x = this.old_x;
                this.speed.x = 0;
                this.acceleration.x = 0;
            }
            if (x_coord+1 == this.parent.map.map[y_coord].length) {
                this.x = this.old_x;
                this.speed.x = 0;
                this.acceleration.x = 0;
            }

            if (y_coord == 0) {
                this.y = this.old_y;
                this.speed.y = 0;
                this.acceleration.y = 0;
            }
            if (y_coord+1 == this.parent.map.map.length) {
                this.y = this.old_y;
                this.speed.y = 0;
                this.acceleration.y = 0;
            }

            if (this.x % grid_block_size < grid_block_size / 2) {
                if (!this.parent.map.map[y_coord][x_coord - 1].obstacle) {
                    this.x = this.old_x;
                    this.speed.x = 0;
                    this.acceleration.x = 0;
                } else {
                    this.y = this.old_y;
                    this.speed.y = 0;
                    this.acceleration.y = 0;
                }
            }
            if (this.x % grid_block_size > grid_block_size / 2) {
                if (!this.parent.map.map[y_coord][x_coord + 1].obstacle) {
                    this.x = this.old_x;
                    this.speed.x = 0;
                    this.acceleration.x = 0;
                } else {
                    this.y = this.old_y;
                    this.speed.y = 0;
                    this.acceleration.y = 0;
                }
            }

            if (this.y % grid_block_size < grid_block_size/2) {
                if (!this.parent.map.map[y_coord - 1][x_coord].obstacle) {
                    this.y = this.old_y;
                    this.speed.y = 0;
                    this.acceleration.y = 0;
                } else {
                    this.x = this.old_x;
                    this.speed.x = 0;
                    this.acceleration.x = 0;
                }
            }
            if (this.y % grid_block_size > grid_block_size/2) {
                if (!this.parent.map.map[y_coord + 1][x_coord].obstacle) {
                    this.y = this.old_y;
                    this.speed.y = 0;
                    this.acceleration.y = 0;
                } else {
                    this.x = this.old_x;
                    this.speed.x = 0;
                    this.acceleration.x = 0;
                }
            }



        }

        if (x_coord == this.parent.goal.x && y_coord == this.parent.goal.y) {
            this.reached_end = true;
        }

    }
}

var pathfinderobj = new PathFinder(document.getElementById("pathfinder"), document.getElementById("flyers"));



function restart() {
    pathfinderobj.restart();
}


