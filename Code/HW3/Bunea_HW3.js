var perspectiveExample2 = function() {

    "use strict";
    
    var canvas;
    var gl;
    var ground_verts = 0; 
    
    var numPositions = 42;
    
    var positionsArray = [];
    var colorsArray = [];
    

    // SEH is approx 58m (tompkins side, width) by 104m (rome hall side, length) by 33.5m (110 ft tall, height)
    // For (X,Y,Z) our reference will be built around the length 104m side
    // x_space = (length/width) ~= 1.86 (this divided by 2 is 0.93)
    // y_space = (height/length) * x_space ~= 0.6
    // z_space = (width/length) * x_space ~= 1.04

    var x_gap = 1.86
    var y_gap = 0.6
    var z_gap = 1.04

    var s = 1; //Our scalar to make it bigger while maintaining ratios, this is annoying to have to do it this way
    
    var vertices = [
        vec4(-0.93 , -1, -0.52 + z_gap * s, 1.0),  // 0 front bl
        vec4(-0.93, -1 + y_gap * s, -0.52 + z_gap * s, 1.0),  // 1 front tl
        vec4(-0.93 + x_gap * s, -1 + y_gap * s, -0.52 + z_gap * s, 1.0),  // 2 front tr
        vec4(-0.93 + x_gap * s, -1, -0.52 + z_gap * s, 1.0),  // 3 front br
        vec4(-0.93, -1, -0.52, 1.0),  // 4 back bl
        vec4(-0.93 , -1 + y_gap * s, -0.52, 1.0),  // 5 back tl
        vec4(-0.93 + x_gap * s, -1 + y_gap * s, -0.52 , 1.0),  // 6 back tr
        vec4(-0.93 + x_gap * s , -1, -0.52, 1.0)   // 7 back br
    ];
    


    // This will contain the "dirt" infront of SEH in that photo 
    // We want it connected to the front bl, front br, and back bl

    var verticies2 = [ // Can just make a large square that will get clipped out
                       // So it will just look like our drawings
        vec4(-.95, -1.,  .55, 1.0),  
        vec4(3 + x_gap * s, -1.01,  1, 1.0), 
        vec4(5 + x_gap * s, -2.01, -0.54, 1.0),  
        vec4(-4.35, -2.01, -1, 1.0)   
    ];


    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(0.8, 0.8, 0.8, 1.0),  // This was the red side, changed it to light gray to slightly match photo better
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(.38, 0.36, .26, 1.0),  // This was the magenta side, changed it to light tan 
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0),  // white
    ];
    
    
    var near = 0.3;
    var far = 10.0;          // Had to make this bigger so the camera didn't get clipped 
    var  fovy = 65.0;        // Field-of-view in Y direction angle (in degrees)
    var  aspect = 0.0;       // Viewport aspect ratio
    
    var modelViewMatrix, projectionMatrix;
    var modelViewMatrixLoc, projectionMatrixLoc;
    var eye;
    var at  = vec3(0, 0.5, 0.0);
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
    function ground(a, b, c, d) {
        var brown = vec4(0.35, 0.25, 0.15, 1.0);
        ground_verts = 6;
        // One face (the brown), thus two triangles needed, thus three verticies. 6 total
        positionsArray.push(verticies2[a]); 
        colorsArray.push(brown);
        positionsArray.push(verticies2[b]); 
        colorsArray.push(brown);
        positionsArray.push(verticies2[c]); 
        colorsArray.push(brown);
        positionsArray.push(verticies2[a]); 
        colorsArray.push(brown);
        positionsArray.push(verticies2[c]); 
        colorsArray.push(brown);
        positionsArray.push(verticies2[d]); 
        colorsArray.push(brown);
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
    
        gl.clearColor(0, 0.4, 1.0, 1.0); // Making this light blue like the sky in the photo
    
        gl.enable(gl.DEPTH_TEST);
    
        //
        //  Load shaders and initialize attribute buffers
        //
        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
    
        colorCube();
        ground(0,1,2,3);
    
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
    
        eye = vec3(-2, -1.3, 2); // Since y is our up we want to be a bit negative on that front to get that low view (ground is -1 so we use -0.9)
        modelViewMatrix = lookAt(eye, at, up);
        projectionMatrix = perspective(fovy, aspect, near, far);
    
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        requestAnimationFrame(render);
    }
    
    }
    perspectiveExample2();
    