// TODO: Better vertical scaling
// TODO: Dynamically handle varying update delays, convert to temporal rather than ordinal logic.
// TODO: Quadratic curves for worm smoothing.

class Worm {
    constructor(container) {
        this.canvas = container
        this.context = this.canvas.getContext('2d')
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Make the canvas resize with the window.
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        })

        // The actual worm data itself.
        this.data = [{y: 0, ts: Date.now()}];

        // Maximum number of worm segments to draw.
        this.max_worm_length = 100;

        // Defines the size of empty space on the right side of the worm.
        this.worm_right_pad = 20;

        // Timer information
        this.old_time = Date.now();
        this.delta = 0;
        this.update_timer = 0;
        this.update_delay = 50;

        // Used for vertical scaling.
        this.max_worm_val = 150;

        // Used for fake data generation (but could be handy at some point)
        this.users = 10;

        // Render settings and parameters.
        this.worm_grad = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
        this.worm_grad.addColorStop(0, "rgb(0,255,100)");
        this.worm_grad.addColorStop(0.2, "rgb(0,255,0)");
        this.worm_grad.addColorStop(0.5, "rgb(200,200,0)");
        this.worm_grad.addColorStop(0.8, "rgb(255,0,0)");
        this.worm_grad.addColorStop(1, "rgb(180,0,0)");

        this.setNormalFill();

        // RELEASE THE WORM
        this.run = this.run.bind(this);
        this.run()
    }


    /* The main loop.
     * This runs only when the window has focus. */
    run() {
        this.delta = Date.now() - this.old_time
        this.old_time += this.delta
        this.update()
        this.render()
        requestAnimationFrame(this.run)
    }


    /* Draw a frame */
    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw_zero_line();
        this.draw_worm_end(this.max_worm_length, this.worm_right_pad);
    }


    /* Update the state of the worm by a tick. */
    update() {
        // Add a fake data point to the end of the worm every update_delay milliseconds
        this.update_timer += this.delta;
        if (this.update_timer > this.update_delay) {
            this.update_timer = 0;

            let vote_trend_duration = 3000;
            let trend = Math.cos(Date.now() / vote_trend_duration);
            let vote_total = this.data[this.data.length - 1].y + (this.users * this.lerp(2 * Math.random() - 1, trend, 0.15));

            if (Math.abs(vote_total) > this.max_worm_val) {
                this.max_worm_val = Math.abs(vote_total);
            }

            this.data.push({y: vote_total, ts: Date.now()});
        }
    }


    setNormalFill() {
        this.context.fillStyle = "rgb(239, 5, 239)";
        this.context.strokeStyle = "rgb(239, 5, 239)";
        this.context.lineWidth = 10;
    }


    /* Given an absolute worm value, return the vertical position it would be rendered at. */
    scale_worm_height(val) {
        return (val * this.canvas.height / (this.max_worm_val * 2)) + (this.canvas.height / 2);
    }

    /* Map linearly from the range [0,1] to [x1, x2]. */
    lerp(x1, x2, t) {
        return x1 + t*(x2 - x1);
    }


    /* The proportion of the last update step that has been rendered.
     *  E.g. If the time between the last two updates was 100 milliseconds,
     *  and 50 milliseconds has passed since the last update, return 0.5. */
    update_fraction_elapsed() {
        return this.update_timer / this.update_delay;
    }


    /* Draw a horizontal rule denoting the 0 vote level. */
    draw_zero_line() {
        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#777777";
        let zero_height = this.scale_worm_height(0);
        this.context.moveTo(0, zero_height);
        this.context.lineTo(this.canvas.width, zero_height);
        this.context.stroke();
    }


    /* Draw the last num_points points of the worm, padding with space for
     * end_pad_size imaginary points on the right hand side.
     * If num_points exceeds the available data, the worm should draw from left
     * to right until it reaches the right border, minus padding,
     * and then it should scroll. */
    draw_worm_end(num_points, end_pad_size) {
        let start = Math.max(0, (this.data.length - 1) - num_points);
        let end = Math.max(num_points + end_pad_size, this.data.length - 1 + end_pad_size);
        let offset = num_points > this.data.length - 1 ? 0 : (this.canvas.width / (start - end - 1)) * this.update_fraction_elapsed();
        this.draw_worm_slice(start, end, offset);
    }


    /* Draw a slice of the worm between x_start and x_end, to fill up the canvas
     * horizontally.
     * x_offset_pixels will displace the drawing of the worm, which is used for
     * smooth scrolling.
     * If x_end exceeds the length of the worm data, empty space will be
     * rendered past the end. */
    draw_worm_slice(x_start, x_end, x_offset_pixels = 0) {
        // Set up the styles.
        this.context.beginPath();
        this.context.strokeStyle = this.worm_grad;
        this.context.lineWidth = 4;
        this.context.lineCap = 'round';
        // Change lineJoin to "round" for rounder corners.
        this.context.lineJoin = 'bevel';

        // The distance between individual worm segments.
        let segment_width = this.canvas.width / (x_end - x_start);
        let update_fraction = this.update_fraction_elapsed();

        // Initialise the first point to the first datum in range or else 0.
        let initial = (x_start < this.data.length) ? this.data[x_start] : 0;
        this.context.moveTo(x_offset_pixels, initial);

        let x;
        let y;

        // Draw the actual body of the worm.
        for (let i = x_start; i < x_end && i < this.data.length - 1; ++i) {
            x = (i - x_start) * segment_width;
            y = this.scale_worm_height(this.data[i].y);
            this.context.lineTo(x + x_offset_pixels, y);
        }

        // The last worm segment interpolates smoothly between data updates.
        if (x_end > this.data.length) {
            let i = this.data.length - 1;
            let last_x = (i - x_start) * segment_width;
            let last_y = this.scale_worm_height(this.data[i].y);
            x = this.lerp(x, last_x, update_fraction);
            y = this.lerp(y, last_y, update_fraction);
            this.context.lineTo(x + x_offset_pixels, y);
        }

        this.context.stroke();
        this.context.closePath();
    }
}