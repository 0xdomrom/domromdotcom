


class TreeDrawer {
    constructor(canvas, height_slider, split_slider) {

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");

        this.height_slider = height_slider;
        this.split_slider = split_slider;

        this.canvas.width = window.innerWidth-20;
        this.canvas.height = window.innerHeight-100;

        this.old_time = Date.now();
        this.fps = 60;
        this.holdfps = 60;
        this.frames = 0;

        this.setup();
        this.run_loop = this.run_loop.bind(this);
        this.run_loop();
    }


    setup() {
        this.tree_height = this.height_slider.value;
        this.split_ratio = this.split_slider.value;

        this.tree = new Tree(this.tree_height,this.split_ratio);

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
        this.fps = 1000 / delta;

        this.tree.update(this.old_time);

    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.lineWidth = this.tree_height*2 + 40;
        this.context.strokeStyle = "black";
        this.context.fillStyle = "orange";

        this.context.save();
        this.context.translate(this.canvas.width/2, this.canvas.height);
        this.tree.draw(this.context);

        this.context.restore();
        this.context.shadowBlur = 0;
        this.context.fillStyle = "black";
        if (this.frames%10 == 0) {
            this.holdfps = this.fps;
        }
        this.context.fillText(this.holdfps.toFixed(1), 10, 10);

    }

    reset() {

    }

}


class Tree {
    constructor(height, split_ratio) {
        this.height = height;
        this.split_ratio = split_ratio;
        this.build_tree();
        this.sin_val = 0
    }

    build_tree() {
        this.root = new Branch(this.height,30);
        this.root.add_children(this.height-1, this.split_ratio);

    }

    update() {
        this.sin_val += 0.05;
        this.force = Math.sin(this.sin_val)/10 - .2;
        this.root.update_force(this.force);
    }

    draw(context) {
        this.root.draw(context, 0, 0)
    }
}

class Branch {
    constructor(max_height, max_angle) {
        this.children = [];
        this.force = 0;
        this.force_mult = 1;
        this.max_height = max_height;
        this.max_angle = max_angle;

    }

    add_children(height, split_ratio) {
        let split = split_ratio;
        if (Math.random() > 0.5) {
            split++;
        }

        if (height == 0) {
            let leaf = new Leaf(this.max_height, this.max_angle);
            this.children.push(leaf);
            return;
        }

        this.height = height;

        for (let i=0; i<split; i++) {
            let new_branch = new Branch(this.max_height, this.max_angle);
            new_branch.add_children(height-1, split_ratio);
            this.children.push(new_branch)
        }
    }

    update_force(force) {
        this.force = force;

        // if (-0.001 < this.force && this.force < 0.001) {
        //     this.force_mult = Math.random()*8 -4;
        // }

        this.force *= this.force_mult;

        for (let i of this.children) {
            i.update_force(force)
        }

    }

    draw(context, shift, angle) {
        context.save();
        context.translate(0, shift);
        context.rotate(angle);

        context.lineWidth /= 2;

        shift = 15/-(this.max_height - this.height)*15;

        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(0, shift);
        context.stroke();
        let angle_mod = this.max_angle*(this.children.length-1)*Math.PI/180/2;

        angle_mod += angle_mod*this.force;


        for (let i in this.children) {

            let angle = this.max_angle*i*Math.PI/180 - angle_mod;

            this.children[this.children.length-1-i].draw(context, shift, angle);
        }
        context.restore()

    }
}


class Leaf {
    constructor(max_height) {
        this.tree_height = max_height;
    }

    draw(context) {
        context.arc(0, 0, 20/this.tree_height, 0, 2*Math.PI, 0);
        context.fill();
    }

    update_force(force) {
        return;
    }
}

var x = new TreeDrawer(document.getElementById("tree"), document.getElementById("height"), document.getElementById("split"));