class Tree {
    constructor(height) {
        this.height = height;
        this.init()
    }

    init() {
        this.height_level_buffers = [];

        for (let i=0; i<this.height; i++) {
            this.height_level_buffers.push(create_buffer(height, width))
        }
    }

}





var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;

function initBuffers() {
    pyramidVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);

    var root_3 = Math.sqrt(3);
    var height = 10;
    var width = 1;

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
}


var rPyramid = 0;
var i = 1.0;

function drawScene() {
    i += 0.1;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (let j = 0; j< 10; j++) {

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, [0, (j-5)*2, -50]);
        mvPushMatrix();

        mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
    }
    mvPopMatrix();


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

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}

function webGLStart() {
    var canvas = document.getElementById("lesson04-canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    tick();
}