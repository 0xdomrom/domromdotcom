

class Settings {
    constructor(val1_slider, val2_slider, val3_slider, segments_slider) {

        this.val1_slider = val1_slider;
        this.val2_slider = val2_slider;
        this.val3_slider = val3_slider;

        this.val1_slider.value = 33;
        this.val2_slider.value = 34;
        this.val3_slider.value = 33;

        this.old_val1 = this.val1();
        this.old_val2 = this.val2();
        this.old_val3 = this.val3();

        this.segments_slider = segments_slider;

        this.old_time = Date.now();
        this.fps = 60.0;
        this.holdfps = 60.0;
        this.frames = 0;
    }

    val1() {
        return parseInt(this.val1_slider.value);
    }

    val2() {
        return parseInt(this.val2_slider.value);
    }

    val3() {
        return parseInt(this.val3_slider.value);
    }

    getSegments() {
        return parseInt(this.segments_slider.value);
    }

    update() {

        let sum_vals = this.val1() + this.val2() + this.val3();
        if (sum_vals != 100) {
            if (this.old_val1 != this.val1()) {
                let amt_to_spread = 100-this.val1();
                let other_weights = this.val2()+this.val3();
                this.val2_slider.value = Math.floor(this.val2()/other_weights*amt_to_spread);
                this.val3_slider.value = Math.floor(this.val3()/other_weights*amt_to_spread);
            } else if (this.old_val2 != this.val2()) {
                let amt_to_spread = 100-this.val2();
                let other_weights = this.val1()+this.val3();
                this.val1_slider.value = Math.floor(this.val1()/other_weights*amt_to_spread);
                this.val3_slider.value = Math.floor(this.val3()/other_weights*amt_to_spread);
            } else if (this.old_val3 != this.val3()) {
                let amt_to_spread = 100-this.val3();
                let other_weights = this.val2()+this.val1();
                this.val2_slider.value = Math.floor(this.val2()/other_weights*amt_to_spread);
                this.val1_slider.value = Math.floor(this.val1()/other_weights*amt_to_spread);
            }
        }

        this.old_val1 = this.val1();
        this.old_val2 = this.val2();
        this.old_val3 = this.val3();


        this.frames += 1;
        let delta = Date.now() - this.old_time;
        this.old_time += delta;
        this.fps = 1000 / delta;
    }
}



class TriangleDrawer {
    constructor(canvas, segments_slider, val1_slider, val2_slider, val3_slider) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.size = 500;
        this.canvas.width = this.size;
        this.canvas.height = this.size;

        this.settings = new Settings(val1_slider, val2_slider, val3_slider, segments_slider);

        this.setup();
        this.run_loop = this.run_loop.bind(this);
        this.run_loop();
    }


    setup() {
        this.val1 = this.settings.val1();
        this.val2 = this.settings.val2();
        this.val3 = this.settings.val3();
        this.segments = this.settings.getSegments();
        this.triangle = new Triangle(this.val1,this.val2, this.val3, this.canvas.width-40, this.segments);

    }

    run_loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.run_loop);
    }

    update() {
        this.settings.update();
        this.triangle.update(this.settings);
    }

    draw() {

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.strokeStyle = "black";
        this.context.fillStyle = "blue";
        this.context.save();
        this.triangle.draw(this.context);
        this.context.restore();

        this.context.shadowBlur = 0;
        this.context.fillStyle = "black";
        if (this.settings.frames%10 == 0) {
            this.settings.holdfps = this.settings.fps;
        }
        this.context.fillText(this.settings.holdfps.toFixed(1), 80, 10);

    }

}


class Triangle {
    constructor(val1, val2, val3, size, segments) {
        this.val1 = val1;
        this.val2 = val2;
        this.val3 = val3;
        this.size = size;
        this.segments = segments;
    }

    update(settings) {
        this.val1 = settings.val1();
        this.val2 = settings.val2();
        this.val3 = settings.val3();
        this.segments = settings.getSegments();
    }

    draw(context) {
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(10,10+this.size);
        context.lineTo(10+this.size,10+this.size);
        context.lineTo(10+this.size/2,10+this.size-(this.size/2*Math.sqrt(3))); // height of equilateral triangle
        context.lineTo(10,10+this.size);
        context.stroke();

        context.lineWidth = 1;

        for (let i=1; i<=this.segments; i++) {
            context.beginPath();

            context.moveTo(10+i*this.size/this.segments,10+this.size);
            context.lineTo(10+this.size/2+i*this.size/this.segments/2, 10+this.size-((this.size-i*this.size/this.segments)/2*Math.sqrt(3)));
            context.lineTo(10+this.size/2-i*this.size/this.segments/2, 10+this.size-((this.size-i*this.size/this.segments)/2*Math.sqrt(3)));
            context.lineTo(10+(this.segments-i)*this.size/this.segments,10+this.size);
            context.stroke();
        }

        let x_pos = 10+this.size/2;
        let y_pos = 10+this.size-(this.size/2*Math.sqrt(3));

        y_pos += (this.size/2*Math.sqrt(3))*(this.val2/100);
        x_pos += (this.size/2)*(this.val2/100);

        x_pos -= (this.size/2)*(this.val3/100);
        y_pos += (this.size/2*Math.sqrt(3))*(this.val3/100);





        context.moveTo(x_pos,y_pos);
        context.arc(x_pos, y_pos, this.size/40, 0, 2*Math.PI, 0);
        context.fill();
    }
}



var x = new TriangleDrawer(document.getElementById("triangle"), document.getElementById("segments"), document.getElementById("val1"), document.getElementById("val2"), document.getElementById("val3"));

