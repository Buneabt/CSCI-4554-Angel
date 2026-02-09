"use strict";

var canvas;
var gl;
var speed = 1;

var theta = 0;
var thetaLoc;

var changing_colors;
var color = [0,0,0,1]; // Last thing of vec4 is transparency 

init();

function init()
{
    document.getElementById("slider").onchange = function(event) {
        speed = event.target.value;
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

    var vertices = [
        vec2(0,0.4),
        vec2(0,0),
        vec2(0.2,-0.4),
        vec2(0, 0),
        vec2(-0.2,-0.4)
    ];


    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data bufferData

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    // Adding in our color changer
    changing_colors = gl.getUniformLocation(program, "uColor");

    render();
};


function render() {
    color[0] = Math.random();
    color[1] = Math.random();
    color[2] = Math.random();


    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += .06*(1/speed);

    gl.uniform1f(thetaLoc, theta);

    //We pass four variables (our array) instead of the 1 above
    gl.uniform4fv(changing_colors, color);

    //This one draws our handle
    gl.drawArrays(gl.LINE_STRIP, 0,2);
    //This handles the V shape
    gl.drawArrays(gl.LINE_STRIP, 2,3);



    //Taking the setTimeout function we can set an actual consistent Delay, 1000ms = 1fps

    //REMEMBER TO UNCOMMENT BELOW WHEN SUBMITTING

    setTimeout(function() {requestAnimationFrame(render);}, 1000/speed);
}