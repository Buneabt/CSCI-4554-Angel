var finalProj = function() {

    "use strict";
    
 
    var canvas;
    var gl;
 
    var positionsArray = [];
    var colorsArray = [];

    var numPositions; 
 
    var platformPositionsArray = []; // separate — platform only
 
    // Render has to see our two programs now since that trains gonna be moving
    // ask for my crude example (its very crude) where I worked with a moving wire train 
    var platformProgram;
    var program;

    var trainmoving;
    var movingcounter = 0;
    var train_z = 0;
 
    // The two different areas, we need to split up what will be affected by lighting
    var main; // Not affected
    var platform; //Has the lighting streak on it 

    var vBuffer;
    var cBuffer;


    //https://www.alamy.com/stock-photo/metro-rail-rapid-transit-washington-dc.html image of reference

    
    function mytrainismoving() {

        // Our train is 1 car, 7.5 feet tall 
        //(the wheels are 40 inches thus the 7.5 remaining is floor to ceiling)
        //width is 10 ft 1+3⁄4 in (lets just say 10ft), ceiling width is not given

        // the length of the car is 75 ft https://en.wikipedia.org/wiki/Washington_Metro_rolling_stock#7000-series
        //These will be used for our dimensions
        //Height of 0.75 thus train car length is x10 (7.5)
        //width is 10/7.5 = 1.33, divide by 2 for both sides approx 0.66

        var trainVert = [ //This is the one thing that will update will move into render when done
            // Front face (z = front) — flat trapezoid, nearly rectangular
            vec4(-0.66 ,-1.0, -5.5 - train_z, 1.0),  // 0 front bl
            vec4(-0.5, -0.25, -5.5 - train_z, 1.0),  // 1 front tl  (very slight inward taper)
            vec4( 0.5, -0.25, -5.5 - train_z, 1.0),  // 2 front tr
            vec4( 0.66, -1.0, -5.5 - train_z, 1.0),  // 3 front br
        
            // Back face (z = back)
            vec4(-0.66, -1.0, -13 - train_z, 1.0),  // 4 back bl
            vec4(-0.5, -0.25, -13 - train_z, 1.0),  // 5 back tl
            vec4( 0.5, -0.25, -13 - train_z, 1.0),  // 6 back tr
            vec4( 0.66, -1.0, -13 - train_z, 1.0),  // 7 back br
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

        function quad(a, b, c, d) {
            positionsArray.push(trainVert[a]);
            colorsArray.push(vertexColors[a]);
            positionsArray.push(trainVert[b]);
            colorsArray.push(vertexColors[a]);
            positionsArray.push(trainVert[c]);
            colorsArray.push(vertexColors[a]);
            positionsArray.push(trainVert[a]);
            colorsArray.push(vertexColors[a]);
            positionsArray.push(trainVert[c]);
            colorsArray.push(vertexColors[a]);
            positionsArray.push(trainVert[d]);
            colorsArray.push(vertexColors[a]);
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

       colorCube();
    }

    // Our train platform

    var platform = [ // Large square that hits only the train edge
                       // Will imitate the train platform
        vec4(0.85 ,-1, -2.5, 1.0),
        vec4(0.85, -1, 10, 1.0),
        vec4(1.5, -1, 10, 1.0),  
        vec4(2.5, -1, -2.5, 1)   
    ];

    var platformEdge = [ // Large square that hits only the train edge
                       // Will imitate the train platform
        vec4(0.66 ,-1, -2.5, 1.0),
        vec4(0.66, -1, 10, 1.0),
        vec4(0.85, -1, 10, 1.0),  
        vec4(0.85, -1, -2.5, 1)   
    ];
    
    var near = 0.3;
    var far = 20.0;          // Had to make this bigger so the camera didn't get clipped 
    var  fovy = 55.0;        // Field-of-view in Y direction angle (in degrees)
    var  aspect = 0.0;       // Viewport aspect ratio
    
    var modelViewMatrix, projectionMatrix;
    var modelViewMatrixLoc, projectionMatrixLoc;
    var eye;
    var at  = vec3(0.0, -0.6, 0.0);
    var up  = vec3(0.0, 1.0, 0.0);

    init();
    
    // We need another drawing function here for the ground 
    // And it just needs to be a plane and not a cube
    function platformMain() {
        // One face (the brown), thus two triangles needed, thus three verticies. 6 total
        platformPositionsArray.push(platform[0]); 
        platformPositionsArray.push(platform[1]); 
        platformPositionsArray.push(platform[2]); 
        platformPositionsArray.push(platform[0]); 
        platformPositionsArray.push(platform[2]); 
        platformPositionsArray.push(platform[3]); 
    }

    function platformEdingVerts() {
        var grey = vec4(0.6, 0.6, 0.6, 1);
        // One face (the brown), thus two triangles needed, thus three verticies. 6 total
        positionsArray.push(platformEdge[0]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[1]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[2]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[0]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[2]); 
        colorsArray.push(grey);
        positionsArray.push(platformEdge[3]); 
        colorsArray.push(grey);
    }
    
    function init() {
        //Train event button
        document.getElementById("button").onclick = function(event) {
            trainmoving = true;
        };

        canvas = document.getElementById("gl-canvas");
    
        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");
    
        gl.viewport(0, 0, canvas.width, canvas.height);
    
        aspect =  canvas.width/canvas.height;
    
        gl.clearColor(0, 0, 0.0, 0.0); 
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
    

        // First shader which is all the normal stuff
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
    
        mytrainismoving();
        platformMain();        

        main = gl.createVertexArray();
        gl.bindVertexArray(main);    

        numPositions = positionsArray.length;
 

 
        cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.DYNAMIC_DRAW);
        var colorLoc = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);
 
        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray),gl.DYNAMIC_DRAW);
        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);
 
        gl.bindVertexArray(null);
 
        modelViewMatrixLoc  = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
 
        // Second shader init
        platformProgram = initShaders(gl, "platform-vertex-shader", "platform-fragment-shader");
        gl.useProgram(platformProgram);
 
        platform = gl.createVertexArray();
        gl.bindVertexArray(platform);
 
        var pvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(platformPositionsArray), gl.STATIC_DRAW);
        var pPositionLoc = gl.getAttribLocation(platformProgram, "aPosition");
        gl.vertexAttribPointer(pPositionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(pPositionLoc);
 
        gl.bindVertexArray(null);
 
        render();
    }
    
    function render(){

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        eye = vec3(1.5, -0.6, 5); 
        modelViewMatrix = lookAt(eye, at, up);
        projectionMatrix = perspective(fovy, aspect, near, far);
    
        // Train movement logic
        if (trainmoving) {
            if (movingcounter <= 210) {
                movingcounter++;
                train_z -= 0.05; //slowing down
            }
            else if (movingcounter > 210 && movingcounter <= 250) {
                movingcounter++;
            }
            else if (movingcounter > 250 && movingcounter <= 400) {
                movingcounter++;
                train_z -= 0.075; //Accelerating
            }
            else {
                trainmoving = false;
                movingcounter = 0;
                train_z = 0;
            }
        }
    
        
        positionsArray = [];
        colorsArray = [];

        mytrainismoving();
        platformEdingVerts();


        numPositions = positionsArray.length;
    
    
        gl.bindVertexArray(main);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.DYNAMIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.DYNAMIC_DRAW);
    
        gl.bindVertexArray(null);
    
        // Draw main scene
        gl.useProgram(program);
        gl.bindVertexArray(main);
        gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    
        // Draw platform
        gl.useProgram(platformProgram);
        gl.bindVertexArray(platform);
        gl.uniformMatrix4fv(
            gl.getUniformLocation(platformProgram, "uModelViewMatrix"),
            false, flatten(modelViewMatrix)
        );
        gl.uniformMatrix4fv(
            gl.getUniformLocation(platformProgram, "uProjectionMatrix"),
            false, flatten(projectionMatrix)
        );
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    
        setTimeout(function() {requestAnimationFrame(render);}, 1000/30);
    }

    }
finalProj();
    