class PongoSettings {
    constructor() {
        this.old_time = Date.now();
        this.fps = 60.0;
        this.holdfps = 60.0;
        this.frames = 0;
    }

    update_fps() {
        this.frames += 1;
        var delta = Date.now() - this.old_time;
        this.old_time += delta;
        this.fps = 1000 / delta;
    }
}

class PongoDrawer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        var width = window.innerWidth;
        var height = window.innerHeight;
        if (width/3 > height/2) {
            this.canvas.width = height/2*3;
            this.canvas.height = height;
        } else {
            this.canvas.width = width;
            this.canvas.height = width/3*2;
        }


        this.settings = new PongoSettings();

        this.setup();
        this.run_loop = this.run_loop.bind(this);
        this.run_loop();

    }

    setup() {

    }

    run_loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.run_loop);
    }

    update_screen() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        if (width/3 > height/2) {
            this.canvas.width = window.innerHeight/2*3;
            this.canvas.height = window.innerHeight;
        } else {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerWidth/3*2;
        }
    }

    update() {
        this.settings.update_fps();
    }

    draw() {
        this.context.clearRect(0,0,window.innerWidth,window.innerHeight);
        this.context.strokeStyle = "red";
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.context.fill();
        console.log(this.canvas.width, this.canvas.height);
        var w = this.canvas.width/2;
        var h = this.canvas.height/2;
    }
}



var x = new PongoDrawer(document.getElementById("pongo"));

window.onresize = function(event) {
    x.update_screen();
};