"use strict";

var canvas;
var gl;

var bufferId;
var colorBuffer;

var rumble =0.002;
var alpha = 1;
var shake = false;
var scounter = 0;
var shake_theta; 

var train_distance = 0;
var trainStartingx = 3;


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

    bufferId = gl.createBuffer();
    colorBuffer = gl.createBuffer();

    //Regular Buffer 
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    
    // Create color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    
    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    render();
};


function render() {

    if (shake == true) {
        if (scounter <= 75) { //Train entering the station
            alpha*=-1;
            scounter++;
            train_distance += 0.05;
        }
        else if (scounter > 75 & scounter <= 130) { //Our Station Pause (here will open doors?)
            //Here the train will pause for a few seconds then go again 
            scounter++;
        }
        else if (scounter > 130 & scounter <= 260) { //Train leaving the station
            //Here the train will pause for a few seconds then go again 
            scounter++;
            alpha*=-1;
            scounter++;
            train_distance += 0.05;
        }
        else {// here we reset
            shake = false;
            scounter = 0;
            trainStartingx = 3;
            train_distance = 0;
        }
    }




    shake_theta = rumble * alpha;

    var colors = [ //We need one for each vertex, the bottom eight represents the train r,g,b, transparency
        vec4(0,0,0,1),
        vec4(0,0,0,1),
        vec4(0,0,0,1),
        vec4(0,0,0,1),
        vec4(0,0,0,1),
        vec4(0,0,0,1),
        vec4(0,0,0,1),
        vec4(0,0,0,1),
        vec4(0,0,0,1),
        vec4(0,0,0,1),
    

        vec4(1,0,0,1),
        vec4(1,0,0,1),
        vec4(1,0,0,1),
        vec4(1,0,0,1),
        vec4(1,0,0,1),
        vec4(1,0,0,1),
        vec4(1,0,0,1),
        vec4(1,0,0,1),
    ];



    // Our extra lines, ordered this way for easy connection later on
    // multiply to keep it in line for the "rumble" of the train
    var vertices = [
        vec2(0,0), // 0 - Center sign will go at like y = 0.3
        vec2(-1,0.95 + shake_theta), //1 - Top Left
        vec2(1,0.95 + shake_theta), //2 - Top Right
        vec2(1,-0.95 + shake_theta), //3 - Bottom Right
        vec2(-1,-0.95 + shake_theta), //4 - Bottom Left
        vec2(0, -0.63333 + shake_theta), //5 - Some quick math to find the center of the bottom box
        vec2(-1,-1/3*0.95 + shake_theta), //6 - bottom third cutoff L 
        vec2(1,-1/3*0.95 + shake_theta), //7 - bottom third cutoff R
        vec2(1,-0.95 + shake_theta), //8 - Bottom Right
        vec2(-1,-0.95 + shake_theta), //9 - Bottom Left

        //Basic train movement vectors
        vec2((trainStartingx - train_distance),0.35 + shake_theta), //10 Train of length 0.6 which is 0.6/2 the length of the display 
        vec2((trainStartingx - train_distance + 0.8),0.35 + shake_theta), //11
        vec2((trainStartingx - train_distance + 0.8) , -0.3 + shake_theta), //12
        vec2((trainStartingx - train_distance),-0.3 + shake_theta), //13

        vec2((trainStartingx - train_distance) + 0.9,0.35 + shake_theta), //14 Second Train Car
        vec2((trainStartingx - train_distance + 1.7),0.35 + shake_theta), //15
        vec2((trainStartingx - train_distance + 1.7), -0.3 + shake_theta), //16
        vec2((trainStartingx - train_distance) + 0.9,-0.3 + shake_theta), //17
    ];


    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);
    
    // Color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT);

    //This one draws our handle
    gl.drawArrays(gl.POINTS, 0, 1); //Center 0,0
    gl.drawArrays(gl.LINE_LOOP, 1,4); //Outer Box
    gl.drawArrays(gl.TRIANGLES, 4, 3); //Triangle bottom half 1
    gl.drawArrays(gl.TRIANGLES, 5,3); //Triangle bottom half 2
    gl.drawArrays(gl.TRIANGLES, 7,3) //Triangle bottom half 3
    gl.drawArrays(gl.LINE_LOOP,10,4);
    gl.drawArrays(gl.LINE_LOOP,14,4);



    setTimeout(function() {requestAnimationFrame(render);}, 1000/30);
}