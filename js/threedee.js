var rPyramid = 0;


class Tree {
    constructor(height, split, angle) {
        this.height = height;
        this.split = split;
        this.angle = angle;
        this.init()
    }

    init() {
        this.vert_position_level_buffers = [];
        this.color_level_buffers = [];

        for (var i=0; i<this.height+1; i++) {

            var height = 10/(i+1);
            var width = height/5;

            var temp_buffers = create_buffers(height, width);

            this.vert_position_level_buffers.push(temp_buffers[0]);
            this.color_level_buffers.push(temp_buffers[1]);
        }


        this.root = new Branch(0, this.height, this.split, this.angle, this.vert_position_level_buffers[0], this.color_level_buffers[0]);
        this.root.add_children(this.vert_position_level_buffers, this.color_level_buffers);
    }


    draw() {
        this.root.draw();
    }
}

class Branch {
    constructor(level, max_height, split, max_angle, vert_position_buffer, color_level_buffer) {
        this.level = level;
        this.max_height = max_height;
        this.split = split;
        this.max_angle = max_angle;

        this.height = 10/(this.level+1);

        this.children = [];

        this.vert_pos_buffer = vert_position_buffer;
        this.color_level_buffer = color_level_buffer;
    }

    add_children(vert_pos_buffers, color_level_buffers) {
        if (this.level == this.max_height) {
            return;
        }

        var next_lvl = this.level+1;
        for (var i=0; i<this.split; i++) {
            var child = new Branch(next_lvl, this.max_height, this.split, this.max_angle, vert_pos_buffers[next_lvl], color_level_buffers[next_lvl]);
            child.add_children(vert_pos_buffers, color_level_buffers);
            this.children.push(child);
        }
    }

    draw(parent_height=0, x_shift=0, y_shift=0) {
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        mat4.identity(mvMatrix);
        //console.log([x_shift, -20+parent_height, -50+y_shift]);
        mat4.translate(mvMatrix, [x_shift, -20+parent_height, -50-y_shift]);
        mvPushMatrix();

        mat4.rotate(mvMatrix, degToRad(270), [1, 0, 0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vert_pos_buffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vert_pos_buffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.color_level_buffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.color_level_buffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, this.vert_pos_buffer.numItems);

        var x_mod, y_mod;
        var t = this.height*Math.sin(this.max_angle);
        //console.log(Math.sin(this.max_angle*Math.PI/180), this.height);
        for (var i=0; i < this.children.length; i++) {
            x_mod = Math.cos(i*360/this.split)*t;
            y_mod = Math.sin(i*360/this.split)*t;
            this.children[i].draw(this.height+parent_height, x_mod, y_mod);
        }

    }
}




function create_buffers(height, width) {
    var pyramidVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);

    var root_3 = Math.sqrt(3);

    var vertices = [
        // Front face
        -width/2, width/2*(1-root_3), 0.0,
        0.0, 0.0, height,
        width/2, width/2*(1-root_3), 0.0,
        // Right face
        width/2, width/2*(1-root_3), 0.0,
        0.0, 0.0, height,
        0.0, width/2, 0.0,
        // Left face
        0.0, width/2, 0.0,
        0.0, 0.0, height,
        -width/2, width/2*(1-root_3), 0.0,
        // Bottom face
        -width/2, width/2*(1-root_3), 0.0,
        width/2, width/2*(1-root_3), 0.0,
        0.0, width/2, 0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pyramidVertexPositionBuffer.itemSize = 3;
    pyramidVertexPositionBuffer.numItems = 12;
    pyramidVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);

    var colors = [
        // Front face
        0.0, 0.0, 0.0, 1.0,
        0.15, 0.15, 0.15, 1.0,
        0.3, 0.3, 0.3, 1.0,
        // Right face
        0.0, 0.0, 0.0, 1.0,
        0.15, 0.15, 0.15, 1.0,
        0.3, 0.3, 0.3, 1.0,
        // Back face
        0.0, 0.0, 0.0, 1.0,
        0.15, 0.15, 0.15, 1.0,
        0.3, 0.3, 0.3, 1.0,
        // Left face
        0.0, 0.0, 0.0, 1.0,
        0.15, 0.15, 0.15, 1.0,
        0.3, 0.3, 0.3, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    pyramidVertexColorBuffer.itemSize = 4;
    pyramidVertexColorBuffer.numItems = 12;

    return [pyramidVertexPositionBuffer, pyramidVertexColorBuffer];
}


var i = 1.0;

function drawScene() {
    i += 0.1;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    tree.draw();
}


var lastTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        rPyramid += (90 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}
var tree = 0;
function tick() {
    requestAnimFrame(tick);
    drawScene(tree);
    animate();
}

function webGLStart() {
    var canvas = document.getElementById("lesson04-canvas");
    initGL(canvas);
    initShaders();

    tree = new Tree(3,5, 30);
    console.log(tree);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    tick();
}