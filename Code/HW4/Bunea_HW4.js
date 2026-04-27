    "use strict";

    //Built this using the last hw assignment as well as the end of the lighting slide show/pickcube2
    
    var canvas;
    var gl;
    var ground_verts = 0; 
    var program;
    
    var numPositions = 42;
    
    var positionsArray = [];
    var colorsArray = [];

    var is10am = true;

    // Lighting Parameters

    //Im having trouble here because it seems no matter what value I change my lighting and material too I get pure white light
    //Im also happy with that one corner being shaded because thats how that looked this morning where the only dark spot(ish) on the building was that

    var lightingLoc;

    var lightAmbient = vec4(1,1,1,1); //Make it all uniform
    var lightDiffuse = vec4(1,1,1,1);
    var lightSpecular = vec4(0.1,1,0.5,1);

    var lightPosition10am = vec4(-1.5,1,-3,0); //Sun is so far away it doesnt matter
    var lightPosition5pm  = vec4(1.5,5,-3,0); //Basically the opposite on the x axis

    //Material, its a glass wall, doesnt change
    var materialAmbient = vec4(0.8,0.7,0.4, 1); //Base color
    var materialDiffuse = vec4(0.1,.1,.1, 1); //changes light direction
    var materialSpecular = vec4(0.1,0.1,0.1,1); //shiny (assuming windows from picture)
    var materialShininess = 10;


    //Normals
    var normalsArray = [];

    var x_gap = 1.86
    var y_gap = 0.6
    var z_gap = 1.04


    var vertices = [
        vec4(-0.93 , -1, -0.52 + z_gap, 1.0),  // 0 front bl
        vec4(-0.93, -1 + y_gap, -0.52 + z_gap, 1.0),  // 1 front tl
        vec4(-0.93 + x_gap, -1 + y_gap, -0.52 + z_gap, 1.0),  // 2 front tr
        vec4(-0.93 + x_gap, -1, -0.52 + z_gap, 1.0),  // 3 front br
        vec4(-0.93, -1, -0.52, 1.0),  // 4 back bl
        vec4(-0.93 , -1 + y_gap, -0.52, 1.0),  // 5 back tl
        vec4(-0.93 + x_gap, -1 + y_gap, -0.52 , 1.0),  // 6 back tr
        vec4(-0.93 + x_gap, -1, -0.52, 1.0)   // 7 back br
    ];

    var verticies2 = [ // Can just make a large square that will get clipped out
                       // So it will just look like our drawings
        vec4(-.95, -1.,  .55, 1.0),  
        vec4(3 + x_gap, -1.01,  1, 1.0), 
        vec4(5 + x_gap, -2.01, -0.54, 1.0),  
        vec4(-4.35, -2.01, -1, 1.0)   
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
    //Our cube push normals
    function quad(a, b, c, d) {

        var t1 = subtract(vertices[a], vertices[b]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = cross(t1, t2);
        normal = normalize(normal);       

        positionsArray.push(vertices[a]);
        normalsArray.push(normal);
        positionsArray.push(vertices[b]);
        normalsArray.push(normal);
        positionsArray.push(vertices[c]);
        normalsArray.push(normal);
        positionsArray.push(vertices[a]);
        normalsArray.push(normal);
        positionsArray.push(vertices[c]);
        normalsArray.push(normal);
        positionsArray.push(vertices[d]);
        normalsArray.push(normal);
        
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
        for (var i = 0; i < 6; i++) normalsArray.push(vec3(0,1,0));
    }
    
    function colorCube()
    {
        quad(1, 0, 3, 2);
        quad(2, 3, 7, 6);
        quad(3, 0, 4, 7);
        quad(6, 5, 1, 2);
        quad(4, 5, 6, 7);
        quad(5, 4, 0, 1);

        for (var i = 0; i < 36; i++) colorsArray.push(vec4(0,0,0,1)); //Padding because 6 verts at the end are color, the first 36 are lighting thus pad
    }
    
    function init() {
        canvas = document.getElementById("gl-canvas");
    
        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");

        document.getElementById("button10am").onclick = function(event) {
            is10am = true;
        };
        document.getElementById("button5pm").onclick = function(event) {
            is10am = false;
        };
    
        gl.viewport(0, 0, canvas.width, canvas.height);
    
        aspect =  canvas.width/canvas.height;
    
        gl.clearColor(0, 0.4, 1.0, 1.0); // Making this light blue like the sky in the photo
    
        gl.enable(gl.DEPTH_TEST);
        //gl.enable(gl.CULL_FACE);

        //
        //  Load shaders and initialize attribute buffers
        //
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        colorCube();
        ground(0,1,2,3);
    
        var nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

        var normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLoc);

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
    
        modelViewMatrixLoc = gl.getUniformLocation(program, "ModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "ProjectionMatrix");
    
        //Products
        var ambientProduct = mult(lightAmbient,materialAmbient);
        var diffuseProduct = mult(lightDiffuse,materialDiffuse);
        var specularProduct = mult(lightSpecular,materialSpecular);
    

        gl.uniform4fv(gl.getUniformLocation(program, "AmbientProduct"), ambientProduct);
        gl.uniform4fv(gl.getUniformLocation(program, "DiffuseProduct"), diffuseProduct );
        gl.uniform4fv(gl.getUniformLocation(program, "SpecularProduct"), specularProduct );

        gl.uniform1f(gl.getUniformLocation(program, "Shininess"), materialShininess);
        
        lightingLoc = gl.getUniformLocation(program, "Lighting");

        render();
    }
    
    function render(){
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (is10am) {
            gl.uniform4fv(gl.getUniformLocation(program, "LightPosition"), lightPosition10am);
        } else {
            gl.uniform4fv(gl.getUniformLocation(program, "LightPosition"), lightPosition5pm);
        }
    
        eye = vec3(-2, -1.3, 2); // Since y is our up we want to be a bit negative on that front to get that low view (ground is -1 so we use -0.9)
        modelViewMatrix = lookAt(eye, at, up);
        projectionMatrix = perspective(fovy, aspect, near, far);
    
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
        gl.uniform1i(lightingLoc, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 36); 

        gl.uniform1i(lightingLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 36, 6);

        requestAnimationFrame(render);
    }
    

    