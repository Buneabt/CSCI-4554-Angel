"use strict";

var canvas;
var gl;
var rumble =0.002;
var alpha = 1;
var shake = false;
var scounter = 0;

init();

function init()
{
    //Our event marker for the button
    document.getElementById("button").onclick = function(event) {
        shake = true;
    };

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );


    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);



    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);


    // Associate out shader variables with our data bufferData

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};


function render() {


    // Shakes the platform to make it feel like a train is coming 
    if (shake == true) {
        if (scounter > 100) {
            shake = false;
            scounter = 0;
        }
        alpha*=-1;
        scounter++;
    }



    // Our extra lines, ordered this way for easy connection later on
    //multiply to keep it in line for the "rumble" of the train
    var vertices = [
        vec2(0,0),
        vec2(-1,0.95 + rumble * alpha),
        vec2(1,0.95 + rumble * alpha),
        vec2(1,-0.95 + rumble * alpha),
        vec2(-1,-0.95 + rumble * alpha),
        vec2(-1,-1/3*0.95 + rumble * alpha),
        vec2(1,-1/3*0.95 + rumble * alpha)
    ];

    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT);

    //This one draws our handle
    gl.drawArrays(gl.POINTS, 0, 1);
    gl.drawArrays(gl.LINE_LOOP, 1,4);
    gl.drawArrays(gl.TRIANGLES, 3,4);

    setTimeout(function() {requestAnimationFrame(render);}, 1000/30);
}