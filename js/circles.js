class CircleSettings {
    constructor(height_slider, split_slider, leaves_check) {

        this.height_slider = height_slider;
        this.split_slider = split_slider;
        this.leaves_check = leaves_check;

        this.old_time = Date.now();
        this.fps = 60.0;
        this.holdfps = 60.0;
        this.frames = 0;
    }

    depth() {
        return this.height_slider.value;
    }

    split() {
        return this.split_slider.value;
    }

    update_fps() {
        this.frames += 1;
        let delta = Date.now() - this.old_time;
        this.old_time += delta;
        this.fps = 1000 / delta;
    }
}




class CircleDrawer {
    constructor(canvas, depth_slider, split_slider) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.canvas.width = window.innerWidth - 250;
        this.canvas.height = window.innerHeight - 180;

        this.settings = new CircleSettings(depth_slider, split_slider);

        this.setup();
        this.run_loop = this.run_loop.bind(this);
        this.run_loop();

    }


    setup() {
        this.circle_depth = this.settings.depth();
        this.split_ratio = this.settings.split();

        this.root = new Circle(this.circle_depth,this.split_ratio);

    }

    run_loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.run_loop);
    }

    update() {
        this.settings.update_fps();
        this.root.update(this.settings.old_time);
    }

    draw() {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        let w = this.canvas.width/2;
        let h = this.canvas.height/2;
        this.root.draw(this.context, w, h, Math.min(w, h))
    }
}



class Circle {
    constructor(depth, split_ratio, level=1) {
        this.depth = depth;
        this.split_ratio = split_ratio;
        this.level = level;

        this.children = [];
        this.setup()
    }

    setup() {
        if (this.level == this.depth) {
            return
        }
        for (let i = 0; i<this.split_ratio; i++) {
            this.children.push(new Circle(this.depth, this.split_ratio, this.level+1))
        }
    }

    update (time) {

        this.angle_mod = (time/500)%(Math.PI*2);
        for (let i=0; i<this.children.length; i++){
            this.children[i].update(time)
        }
    }

    draw(context, x_mod, y_mod, radius) {
        context.beginPath();
        context.arc(x_mod, y_mod, radius, 0, 2*Math.PI);
        if (this.level%2 == 0) {
            context.strokeStyle = "green";
        } else {
            context.strokeStyle = "gold";
        }
        context.stroke();
        let next_rad =  radius/2;

        for (let i=0; i<this.children.length; i++){
            let angle = i*2*Math.PI/this.children.length;
            if (this.level%2) {
                angle += this.angle_mod;
            } else {
                angle -= this.angle_mod;
            }
            this.children[i].draw(context, x_mod+next_rad*Math.cos(angle), y_mod+next_rad*Math.sin(angle),next_rad)
        }
    }
}





var x = new CircleDrawer(document.getElementById("circles"), document.getElementById("depth"), document.getElementById("split"));