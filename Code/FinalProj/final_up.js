var finalProj = function() {

    "use strict";
    
    var canvas;
    var gl;
    var ground_verts = 0; 
    
    var numPositions = 66;
    
    var positionsArray = [];
    var colorsArray = [];
    // Edits


    //https://www.alamy.com/stock-photo/metro-rail-rapid-transit-washington-dc.html image of reference

    
    var vertices = [ //This is the one thing that will update will move into render when done
        // Front face (z = front) — flat trapezoid, nearly rectangular
        vec4(-0.5 ,-1.0, 0.5, 1.0),  // 0 front bl
        vec4(-0.4, -0.25, 0.5, 1.0),  // 1 front tl  (very slight inward taper)
        vec4( 0.4, -0.25, 0.5, 1.0),  // 2 front tr
        vec4( 0.5, -1.0, 0.5, 1.0),  // 3 front br
    
        // Back face (z = back)
        vec4(-0.5,  -1.0,  -3.5,  1.0),  // 4 back bl
        vec4(-0.4,  -0.25, -3.5,  1.0),  // 5 back tl
        vec4( 0.4,  -0.25, -3.5,  1.0),  // 6 back tr
        vec4( 0.5,  -1.0,  -3.5,  1.0),  // 7 back br
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(0.7, 0.3, 0.1, 1.0),  // Z + This was the red side, changed it to light gray to slightly match photo better
        vec4(0.8, 0.8, .5, 1.0),  // X + yellow, tanish now
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(.38, 0.36, .26, 1.0),  // This was the magenta side, changed it to light tan 
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0),  // white
    ];

    // Our train platform

    var platform = [ // Large square that hits only the train edge
                       // Will imitate the train platform
        vec4(0.7 ,-1, -2.5, 1.0),
        vec4(0.7, -1, 10, 1.0),
        vec4(1.5, -1, 10, 1.0),  
        vec4(1.5, -1, -2.5, 1)   
    ];

    var platformEdge = [ // Large square that hits only the train edge
                       // Will imitate the train platform
        vec4(0.5 ,-1, -2.5, 1.0),
        vec4(0.5, -1, 10, 1.0),
        vec4(0.7, -1, 10, 1.0),  
        vec4(0.7, -1, -2.5, 1)   
    ];


    // Verticies Back Wall

    var platformbackwall = [ //cutout at the back of the train station see image for reference
                       
        //Front
        vec4(0.7, -1, -2.5, 1.0),
        vec4(3, -1, -2.5, 1.0),
        vec4(3, 1, -2.5, 1.0),
        vec4(-1.8, 1, -2.5, 1.0),
        vec4(-1.8, -1, -2.5,  1.0),
        vec4(-1,-1, -2.5, 1.0),
        vec4(-1, 0, -2.5,  1.0),
        vec4(0.7, 0, -2.5, 1.0)

        //The default out of bounds color is black so its just hidden
    ];



    
    var near = 0.3;
    var far = 10.0;          // Had to make this bigger so the camera didn't get clipped 
    var  fovy = 55.0;        // Field-of-view in Y direction angle (in degrees)
    var  aspect = 0.0;       // Viewport aspect ratio
    
    var modelViewMatrix, projectionMatrix;
    var modelViewMatrixLoc, projectionMatrixLoc;
    var eye;
    var at  = vec3(0.0, -0.6, 0.0);
    var up  = vec3(0.0, 1.0, 0.0);


    
    init();
    
    function quad(a, b, c, d) {
         positionsArray.push(vertices[a]);
         colorsArray.push(vertexColors[a]);
         positionsArray.push(vertices[b]);
         colorsArray.push(vertexColors[a]);
         positionsArray.push(vertices[c]);
         colorsArray.push(vertexColors[a]);
         positionsArray.push(vertices[a]);
         colorsArray.push(vertexColors[a]);
         positionsArray.push(vertices[c]);
         colorsArray.push(vertexColors[a]);
         positionsArray.push(vertices[d]);
         colorsArray.push(vertexColors[a]);
    }

    // We need another drawing function here for the ground 
    // And it just needs to be a plane and not a cube
    function platformMain(a, b, c, d) {
        var maroon = vec4(0.5, 0.25, 0.15, 1.0);
        // One face (the brown), thus two triangles needed, thus three verticies. 6 total
        positionsArray.push(platform[a]); 
        colorsArray.push(maroon);
        positionsArray.push(platform[b]); 
        colorsArray.push(maroon);
        positionsArray.push(platform[c]); 
        colorsArray.push(maroon);
        positionsArray.push(platform[a]); 
        colorsArray.push(maroon);
        positionsArray.push(platform[c]); 
        colorsArray.push(maroon);
        positionsArray.push(platform[d]); 
        colorsArray.push(maroon);
    }

    function platformEdingVerts(a, b, c, d) {
        var grey = vec4(0.6, 0.6, 0.6, 1);
        // One face (the brown), thus two triangles needed, thus three verticies. 6 total
        positionsArray.push(platformEdge[a]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[b]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[c]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[a]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[c]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[d]); 
        colorsArray.push(grey);
    }

    function platformEndWallVerts() {
        var darkergrey = vec4(0.5, 0.5, 0.5, 1);
        // One face (the brown), thus two triangles needed, thus three verticies. 6 total
        positionsArray.push(platformbackwall[0]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[1]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[2]); 
        colorsArray.push(darkergrey);

        positionsArray.push(platformbackwall[0]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[2]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[7]); 
        colorsArray.push(darkergrey);

        positionsArray.push(platformbackwall[2]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[3]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[7]); 
        colorsArray.push(darkergrey);

        positionsArray.push(platformbackwall[3]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[6]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[7]); 
        colorsArray.push(darkergrey);

        positionsArray.push(platformbackwall[3]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[4]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[6]); 
        colorsArray.push(darkergrey);

        positionsArray.push(platformbackwall[4]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[5]); 
        colorsArray.push(darkergrey);
        positionsArray.push(platformbackwall[6]); 
        colorsArray.push(darkergrey);

    }

    
    function colorCube()
    {
        quad(1, 0, 3, 2);
        quad(2, 3, 7, 6);
        quad(3, 0, 4, 7);
        quad(6, 5, 1, 2);
        quad(4, 5, 6, 7);
        quad(5, 4, 0, 1);
    }
    
    function init() {
        canvas = document.getElementById("gl-canvas");
    
        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");
    
        gl.viewport(0, 0, canvas.width, canvas.height);
    
        aspect =  canvas.width/canvas.height;
    
        gl.clearColor(0, 0, 1.0, 1.0); // Making this light blue like the sky in the photo
    
        gl.enable(gl.DEPTH_TEST);
    
        //
        //  Load shaders and initialize attribute buffers
        //
        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
    
        colorCube();
        //LOAD ALL OF OUR WALLS
        platformMain(0,1,2,3);
        platformEdingVerts(0,1,2,3);
        platformEndWallVerts();
    
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    
        var colorLoc = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);
    
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    
        var positionLoc = gl.getAttribLocation( program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);
    
        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    
    
        render();
    }
    
    function render(){
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        eye = vec3(1, -.5, 3.2); 
        modelViewMatrix = lookAt(eye, at, up);
        projectionMatrix = perspective(fovy, aspect, near, far);
    
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        requestAnimationFrame(render);
    }
    
    }
    finalProj();
    