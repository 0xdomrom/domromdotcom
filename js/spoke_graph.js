

class Settings {
    constructor(slider_id, angle_slider) {

        this.slider_id = slider_id;



        this.angle_slider = angle_slider;

        this.old_time = Date.now();
        this.fps = 60.0;
        this.holdfps = 60.0;
        this.frames = 0;
        this.update();
        this.randomise();
    }

    randomise() {
        for (let i=0; i<this.sliders.length; i++) {
            this.sliders[i].value = Math.floor(Math.random()*this.sliders[i].max)
        }
    }

    getSliderValues() {
        let vals = [];
        for (let i=0; i<this.sliders.length; i++) {
            vals.push(this.sliders[i].value)
        }
        return vals;
    }

    getMaxSliderValues() {
        // TODO: max values and beyond
        let vals = [];
        for (let i=0; i<this.sliders.length; i++) {
            vals.push(this.sliders[i].max)
        }
        return vals;
    }

    getNumSpokes() {
        return this.sliders.length;
    }

    update() {
        this.sliders=$(this.slider_id);
        this.frames += 1;
        let delta = Date.now() - this.old_time;
        this.old_time += delta;
        this.fps = 1000 / delta;
    }
}



class SpokeDrawer {
    constructor(canvas, graph_angle, slider_id, angle_slider) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.size = 400;
        this.canvas.width = this.size;
        this.canvas.height = this.size;

        this.settings = new Settings(slider_id, angle_slider);

        this.setup(graph_angle);
        this.run_loop = this.run_loop.bind(this);
        this.run_loop();
    }


    setup(graph_angle) {
        this.spoke_graph = new SpokeGraph(this.settings, this.canvas.width);

    }

    run_loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.run_loop);
    }

    update() {
        this.settings.update();
        this.spoke_graph.update();
    }

    draw() {

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.strokeStyle = "black";
        this.context.fillStyle = "blue";
        this.context.save();
        this.spoke_graph.draw(this.context);
        this.context.restore();

        this.context.shadowBlur = 0;
        this.context.fillStyle = "black";
        if (this.settings.frames%10 == 0) {
            this.settings.holdfps = this.settings.fps;
        }
        this.context.fillText(this.settings.holdfps.toFixed(1), 80, 10);

    }

}


class SpokeGraph {
    constructor(settings, size) {
        this.segments = 5;
        // if (graph_angle > 360) {
        //     graph_angle = 360;
        // } else if (graph_angle < 60) {
        //     graph_angle = 60;
        // }
        // this.graph_angle = graph_angle; // conv to rad
        this.settings = settings;
        this.size = size;
        this.radius = (size-20)/2;
        this.update();
    }

    update() {
        this.values = this.settings.getSliderValues();
        this.max_values = this.settings.getMaxSliderValues();
        this.graph_angle = this.settings.angle_slider.value*Math.PI/180;
        this.num_spokes = this.settings.getNumSpokes();
    }

    draw(context) {
        context.lineWidth = 1;
        let move_up = 10;
        if (this.graph_angle > Math.PI) {
            move_up += Math.sin((this.graph_angle-Math.PI)/2)*this.radius;
            // TODO: proper height.
        }

        let cx = 10+this.radius;
        let cy = this.size-move_up;

        let last = Math.PI - (this.graph_angle-Math.PI)/2;


        let shift = this.graph_angle/this.num_spokes;

        for (let i=0;i<this.num_spokes; i++) {

            context.fillStyle = "white";
            context.beginPath();
            context.moveTo(cx, cy);
            context.arc(cx, cy, this.radius, last, last + shift);
            context.lineTo(cx, cy);
            context.fill();
            context.stroke();

            let ratio = this.values[i]/this.max_values[i];

            if (ratio <= 0.5) {
                context.fillStyle = "rgba(255," + parseInt(255*ratio*2) + ",0,255)";
            } else if (ratio <= 1) {
                context.fillStyle = "rgba("+parseInt(255*(1-(ratio-0.5)*2))+",255,0,255)";
            } else {
                context.fillStyle = "rgba(0,"+ parseInt(255*(1-(ratio-0.5)*2)) +","+ parseInt(255*(ratio-1)*2) +",255)";
            }

            context.beginPath();
            context.moveTo(cx, cy);
            context.arc(cx, cy, this.radius*Math.min(1,ratio), last, last + shift);
            context.lineTo(cx, cy);
            context.fill();
            context.stroke();

            last += shift
        }

    }
}

var x = new SpokeDrawer($("#spoke")[0], 360, ".value", $("#angle")[0]);

$("#add_value").click(function() {
    console.log("clicko");
    $("#hidden").replaceWith(
        '<div class="row"> <p>Value '+
        ($(".value").length+1)
        +' (0-100):</p> </div> <div class="row">'+
        ' <input type="range" class="value" value="10" min="0" max="100"/> </div>' +
        '<div id="hidden" style="visibility:hidden"></div>'
    )
});
