var finalProj = function() {

    //remove lighting once train gets to the eye

    "use strict";

    //Taken from textureCube1
    function configureTexture(image) {
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); 

        return tex;
    }
    

    var texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];



    //https://www.turbosquid.com/3d-models/3d-model-wmata-7000-metro-train/963885?dd_referrer=https%3A%2F%2Fwww.google.com%2F
    // metro model face screenshotted from here
    
 
    var canvas;
    var gl;
 
    var positionsArray = [];
    var colorsArray = [];
    var normalsArray = [];
    var texCoordsArray = [];

    var texture;
    var texture2;
    var texture3;
    var texture4;

    var numPositions; 
 
    var program;

    var trainmoving;
    var movingcounter = 0;
    var train_z = 5;
 
    // The two different areas, we need to split up what will be affected by lighting
    var main; // Not affected
    var platform; //Has the lighting streak on it 

    var vBuffer;
    var cBuffer;
    var nBuffer;
    var tBuffer;

    // Lighting Materials for the Platform

    var lightingLoc;

    var lightAmbient = vec4(0.8, 0.8, 0.8, 1.0);
    var lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
    var lightSpecular = vec4(0.3, 0.3, 0.3, 1.0);

    //Material, its a glass wall, doesnt change
    var materialAmbient = vec4(0.5, 0.5, 0.5, 1);  //Base color, brownish
    var materialDiffuse = vec4(0.3, 0.3, 0.3, 1);
    var materialSpecular = vec4(0.8,0.8,0.8,1); //right amount of shiny that matches video 
    var materialShininess = 50;


    //Used these for frame positon mapping
    var x_shift = -1.48;
    var y_shift = -0.23;
    var z_shift = -25;
    var size_scaler = 1.4;
    //See Images folder for references

    
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

            //The reason this is so ugly is that I already scaled the train to match real life dimensions but I dont want to do that calculation over and over
            //so im applying linear transfromations for calibration, i know this is actaully horrible

            vec4(-0.66 * size_scaler + x_shift, -1.0 * size_scaler + y_shift, -5.5 * size_scaler - train_z + z_shift, 1.0),  // 0 front bl
            vec4(-0.5 * size_scaler + x_shift, -0.25 * size_scaler + y_shift, -5.5 * size_scaler - train_z + z_shift, 1.0),  // 1 front tl  (very slight inward taper)
            vec4(0.5 * size_scaler + x_shift, -0.25 * size_scaler + y_shift, -5.5 * size_scaler - train_z + z_shift, 1.0),  // 2 front tr
            vec4(0.66 * size_scaler + x_shift, -1.0 * size_scaler + y_shift, -5.5 * size_scaler - train_z + z_shift, 1.0),  // 3 front br

            // Back face (z = back)
            vec4(-0.66 * size_scaler + x_shift, -1.0 * size_scaler + y_shift, -13.5 * size_scaler - train_z + z_shift, 1.0),  // 4 back bl
            vec4(-0.5 * size_scaler + x_shift, -0.25 * size_scaler + y_shift, -13.5 * size_scaler - train_z + z_shift, 1.0),  // 5 back tl
            vec4(0.5 * size_scaler + x_shift, -0.25 * size_scaler + y_shift, -13.5 * size_scaler - train_z + z_shift, 1.0),  // 6 back tr
            vec4(0.66 * size_scaler + x_shift, -1.0 * size_scaler + y_shift, -13.5 * size_scaler - train_z + z_shift, 1.0),  // 7 back br
        ];

        var vertexColors = [
            vec4(0.5, 0.5, 0.5, 1.0),  
            vec4(0.8, 0.8, .5, 1.0),  
            vec4(.38, 0.36, .26, 1.0)

        ];

        function quadFront(a, b, c, d) {
            positionsArray.push(trainVert[a]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[0]);

            positionsArray.push(trainVert[b]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[1]);
            
            positionsArray.push(trainVert[c]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[2]);

            positionsArray.push(trainVert[a]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[0]);

            positionsArray.push(trainVert[c]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[2]);

            positionsArray.push(trainVert[d]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[3]);

            for (var i = 0; i < 6; i++) normalsArray.push(vec3(0, 0, 0));
        }
        
        function quadSide(a, b, c, d) {
            positionsArray.push(trainVert[a]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[0]);

            positionsArray.push(trainVert[b]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[1]);
            
            positionsArray.push(trainVert[c]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[2]);

            positionsArray.push(trainVert[a]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[0]);

            positionsArray.push(trainVert[c]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[2]);

            positionsArray.push(trainVert[d]);
            colorsArray.push(vertexColors[a]);
            texCoordsArray.push(texCoord[3]);

            for (var i = 0; i < 6; i++) normalsArray.push(vec3(0, 0, 0));
        }
        
        function colorCube() {
            quadFront(1, 0, 3, 2);
            quadSide(2, 3, 7, 6);
        }

       colorCube();
    }

    // Our train platform

    var platform = [ // Large square that hits only the train edge
                       // Will imitate the train platform
        vec4(-0.25,-1 * size_scaler + y_shift, -15, 1.0),
        vec4(-0.25, -1 * size_scaler + y_shift, 10, 1.0),
        vec4(2.5, -1 * size_scaler + y_shift, 10, 1.0),  
        vec4(2.5, -1 * size_scaler + y_shift, -15, 1)   
    ];

    var platformEdge = [ // Large square that hits only the train edge
                       // Will imitate the train platform
        vec4(-0.55 ,-1 * size_scaler + y_shift, -15, 1.0),
        vec4(-0.55, -1 * size_scaler + y_shift, 10, 1.0),
        vec4(-0.25, -1 * size_scaler + y_shift, 10, 1.0),  
        vec4(-0.25,-1 * size_scaler + y_shift, -15, 1)   
    ];
    
    var near = 0.0001;
    var far = 40.0;          // Had to make this bigger so the camera didn't get clipped 
    var  fovy = 30.0;        // Field-of-view in Y direction angle (in degrees)
    var  aspect = 0.0;       // Viewport aspect ratio
    
    var modelViewMatrix, projectionMatrix;
    var modelViewMatrixLoc, projectionMatrixLoc;
    var eye;
    var at  = vec3(0.0, -0.6, 0.0);
    var up  = vec3(0.0, 1.0, 0.0);


    var train_front = document.getElementById("texImage");
    var train_side = document.getElementById("texImage2");
    var edge_lit = document.getElementById("texImage3");
    var edge_dim = document.getElementById("texImage4");

    var loaded = 0;
    function onImageLoad() {
        loaded++;
        if (loaded === 4) init();  
    }

    train_front.onload = onImageLoad;
    train_side.onload = onImageLoad;
    edge_lit.onload = onImageLoad;
    edge_dim.onload = onImageLoad;


    if (train_front.complete) onImageLoad();
    if (train_side.complete) onImageLoad();
    if (edge_lit.complete) onImageLoad();
    if (edge_dim.complete) onImageLoad();
    

    
    // We need another drawing function here for the ground 
    // And it just needs to be a plane and not a cube
    function platformMain() {
        // One face (the brown), thus two triangles needed, thus three verticies. 6 total

        var t1 = subtract(platform[0], platform[1]);
        var t2 = subtract(platform[2], platform[1]);
        var normal = cross(t2, t1); 
        normal = normalize(normal);       

        positionsArray.push(platform[0]);
        normalsArray.push(normal);
        positionsArray.push(platform[1]);
        normalsArray.push(normal);
        positionsArray.push(platform[2]);
        normalsArray.push(normal);
        positionsArray.push(platform[0]);
        normalsArray.push(normal);
        positionsArray.push(platform[2]);
        normalsArray.push(normal);
        positionsArray.push(platform[3]);
        normalsArray.push(normal);

        for (var i = 0; i < 6; i++) colorsArray.push(vec4(0.7,0.4,0.25,1));
        for (var i = 0; i < 6; i++) texCoordsArray.push(vec2(0, 0));
    }

    var wrap = 3.5;
    function platformEdingVerts() {
        var grey = vec4(0.6, 0.6, 0.6, 1);
        // One face (the brown), thus two triangles needed, thus three verticies. 6 total
        positionsArray.push(platformEdge[0]); 
        colorsArray.push(grey);
        texCoordsArray.push(vec2(0,0));

        positionsArray.push(platformEdge[1]); 
        colorsArray.push(grey);
        texCoordsArray.push(vec2(wrap, 0));

        positionsArray.push(platformEdge[2]); 
        colorsArray.push(grey);
        texCoordsArray.push(vec2(wrap,1));

        positionsArray.push(platformEdge[0]); 
        colorsArray.push(grey);
        texCoordsArray.push(vec2(0,0));

        positionsArray.push(platformEdge[2]); 
        colorsArray.push(grey);
        texCoordsArray.push(vec2(wrap,1));

        positionsArray.push(platformEdge[3]); 
        colorsArray.push(grey);
        texCoordsArray.push(vec2(0, 1));

        for (var i = 0; i < 6; i++) normalsArray.push(vec3(0, 1, 0));
        
    }
    
    function init() {
        document.getElementById("button").onclick = function(event) {
            trainmoving = true;
        };
    
        canvas = document.getElementById("gl-canvas");
        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");
    
        gl.viewport(0, 0, canvas.width, canvas.height);
        aspect = canvas.width / canvas.height;
    
        gl.clearColor(0, 0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
    
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
    

        mytrainismoving();
        platformEdingVerts();
        platformMain();
    
        main = gl.createVertexArray();
        gl.bindVertexArray(main);
    
        numPositions = positionsArray.length;
    
        // Normals
        nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.DYNAMIC_DRAW);

        var normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLoc);
    
        // Colors
        cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.DYNAMIC_DRAW);

        var colorLoc = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);
    
        // Positions
        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.DYNAMIC_DRAW);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);
    
        tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.DYNAMIC_DRAW);

        var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texCoordLoc);
    
        
        gl.activeTexture(gl.TEXTURE0);
        texture = configureTexture(document.getElementById("texImage"));
        gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
    
        gl.activeTexture(gl.TEXTURE1);
        texture2 = configureTexture(document.getElementById("texImage2"));
        gl.uniform1i(gl.getUniformLocation(program, "uTexMap2"), 1);

        gl.activeTexture(gl.TEXTURE2);
        texture3 = configureTexture(document.getElementById("texImage3"));
        gl.uniform1i(gl.getUniformLocation(program, "uTexMap3"), 2);

        gl.activeTexture(gl.TEXTURE3);
        texture4 = configureTexture(document.getElementById("texImage4"));
        gl.uniform1i(gl.getUniformLocation(program, "uTexMap4"), 3);

    
        
        modelViewMatrixLoc = gl.getUniformLocation(program, "ModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "ProjectionMatrix");
    
        
        gl.uniform4fv(gl.getUniformLocation(program, "AmbientProduct"),  flatten(mult(lightAmbient,  materialAmbient)));
        gl.uniform4fv(gl.getUniformLocation(program, "DiffuseProduct"),  flatten(mult(lightDiffuse,  materialDiffuse)));
        gl.uniform4fv(gl.getUniformLocation(program, "SpecularProduct"), flatten(mult(lightSpecular, materialSpecular)));
        gl.uniform1f(gl.getUniformLocation(program,  "Shininess"), materialShininess);
    
        lightingLoc = gl.getUniformLocation(program, "Lighting");
    
        render();
    }
    
    function render(){

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture2);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, texture3);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, texture4);
    
        eye = vec3(1.05, -0.6, 8); 
        modelViewMatrix = lookAt(eye, at, up);
        projectionMatrix = perspective(fovy, aspect, near, far);


        // Train movement logic
        if (trainmoving) {
            if (movingcounter <= 450) {
                movingcounter++;
                train_z -= 0.1; //slowing down
            }
            else if (movingcounter > 450 && movingcounter <= 600) {
                movingcounter++;
            }
            else if (movingcounter > 600 && movingcounter <= 800) {
                movingcounter++;
                train_z -= 0.075; //Accelerating
            }
            else {
                trainmoving = false;
                movingcounter = 0;
                train_z = 0;
            }
        }
        if (movingcounter < 360) {
            gl.uniform4fv(gl.getUniformLocation(program, "LightPosition"), //Shift it slightly upward
            vec4(-0.3, -0.3 - train_z * 1.5, (-5.5 - train_z) + z_shift + 5, 1));
        } else {
            gl.uniform4fv(gl.getUniformLocation(program, "LightPosition"), //essentially just delete the light
            vec4(-0.3, -10, (-5.5 - train_z) + z_shift + 3, 1));
        }

        positionsArray = [];
        colorsArray = [];
        normalsArray = [];
        texCoordsArray = []; 

        mytrainismoving();
        platformEdingVerts();
        platformMain(); 


        numPositions = positionsArray.length;
    
    
        gl.bindVertexArray(main);

        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.DYNAMIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.DYNAMIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.DYNAMIC_DRAW);
    
        gl.useProgram(program);
        gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    

        gl.uniform1i(gl.getUniformLocation(program, "uUseTexture"), 1); //front train
        gl.uniform1i(lightingLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);  

        gl.uniform1i(gl.getUniformLocation(program, "uUseTexture"), 2); //side train
        gl.uniform1i(lightingLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 6, 6);


        //Platform edge lights now have to make it flip between these two 

        if (movingcounter % 100 > 75) {
            gl.uniform1i(gl.getUniformLocation(program, "uUseTexture"), 4); 
            gl.uniform1i(lightingLoc, 0);
            gl.drawArrays(gl.TRIANGLES, 12, 6);
        } else {
            gl.uniform1i(gl.getUniformLocation(program, "uUseTexture"), 3); 
            gl.uniform1i(lightingLoc, 0);
            gl.drawArrays(gl.TRIANGLES, 12, 6);
        }

    

        gl.uniform1i(gl.getUniformLocation(program, "uUseTexture"), 0);
        gl.uniform1i(lightingLoc, 1);
        gl.drawArrays(gl.TRIANGLES, numPositions - 6, 6);   //platform which does get lighting
    
        setTimeout(function() { requestAnimationFrame(render); }, 1000/60);
    }

    }
finalProj();
    