'use strict';

let gl;
let surface;
let shProgram, shProgramWebCam;
let spaceball;
let stereoCam;
let iTextureWebCam = -1;
let video;

// Utility class for handling shader programs
class ShaderProgram {
    constructor(name, program) {
        this.name = name;
        this.prog = program;

        this.iAttribVertex = -1;
        this.iAttribTexCoord = -1;
        this.iColor = -1;
        this.iModelViewMatrix = -1;
        this.iProjectionMatrix = -1;
        this.iSampler = -1;
    }

    use() {
        gl.useProgram(this.prog);
    }
}

function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render webcam feed
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, video);

    shProgramWebCam.use();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, iTextureWebCam);
    gl.uniform1i(shProgramWebCam.iSampler, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Render 3D model using stereo rendering
    shProgram.use();

    const modelView = spaceball.getViewMatrix();
    const rotation = m4.axisRotation([0.707, 0.707, 0], 0.7);
    const translation = m4.translation(0, 0, -10);

    const colorPolygon = new Float32Array([0.5, 0.5, 0.5, 1]);
    const colorEdge = new Float32Array([1, 1, 1, 1]);

    // Left eye rendering
    renderEye(
        stereoCam.calcLeftFrustum(),
        m4.translation(stereoCam.eyeSeparation / 2, 0, 0),
        modelView, rotation, translation,
        [true, false, false, true],
        colorPolygon, colorEdge
    );

    // Right eye rendering
    gl.clear(gl.DEPTH_BUFFER_BIT);

    renderEye(
        stereoCam.calcRightFrustum(),
        m4.translation(-stereoCam.eyeSeparation / 2, 0, 0),
        modelView, rotation, translation,
        [false, true, true, true],
        colorPolygon, colorEdge
    );

    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.colorMask(true, true, true, true);
}

function renderEye(projMatrix, eyeTranslation, modelView, rotation, translation, colorMask, fillColor, edgeColor) {
    gl.uniformMatrix4fv(shProgram.iProjectionMatrix, false, projMatrix);

    let transform = m4.multiply(rotation, modelView);
    transform = m4.multiply(eyeTranslation, transform);
    transform = m4.multiply(translation, transform);

    gl.uniformMatrix4fv(shProgram.iModelViewMatrix, false, transform);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 0);

    gl.colorMask(...colorMask);
    gl.uniform4fv(shProgram.iColor, fillColor);
    surface.Draw();
    gl.uniform4fv(shProgram.iColor, edgeColor);
    surface.DrawWireframe();
}

function initGL() {
    // Main shader
    shProgram = new ShaderProgram('Basic', createProgram(gl, vertexShaderSource, fragmentShaderSource));
    shProgram.use();
    shProgram.iAttribVertex = gl.getAttribLocation(shProgram.prog, "vertex");
    shProgram.iModelViewMatrix = gl.getUniformLocation(shProgram.prog, "ModelViewMatrix");
    shProgram.iProjectionMatrix = gl.getUniformLocation(shProgram.prog, "ProjectionMatrix");
    shProgram.iColor = gl.getUniformLocation(shProgram.prog, "color");

    // Webcam shader
    shProgramWebCam = new ShaderProgram('WebCam', createProgram(gl, vertexShaderWebCamSource, fragmentShaderWebCamSource));
    shProgramWebCam.use();
    shProgramWebCam.iSampler = gl.getUniformLocation(shProgramWebCam.prog, "video");

    // Model setup
    surface = new Model('Surface');
    surface.CreateSurface(2, 2, 1, 50, 8, 0.8);

    // Stereo camera setup
    stereoCam = new StereoCamera(0.7, 14.0, 1.3, 0.4, 8.0, 20.0);

    gl.enable(gl.DEPTH_TEST);
}

function createProgram(gl, vShaderSource, fShaderSource) {
    const compileShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader: ${gl.getShaderInfoLog(shader)}`);
        }
        return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Program link error: " + gl.getProgramInfoLog(program));
    }

    return program;
}

function updateParameters() {
    stereoCam.eyeSeparation = parseFloat(document.getElementById('eyeSeparation').value);
    stereoCam.FOV = parseFloat(document.getElementById('fov').value);
    stereoCam.nearClippingDistance = parseFloat(document.getElementById('nearClipping').value);
    stereoCam.convergence = parseFloat(document.getElementById('convergence').value);
    draw();
}

function init() {
    const canvas = document.getElementById("webglcanvas");
    gl = canvas.getContext("webgl2");

    if (!gl) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }

    try {
        initGL();
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            `<p>WebGL initialization error: ${e}</p>`;
        return;
    }

    // Webcam setup
    video = document.createElement('video');
    video.autoplay = true;

    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        video.srcObject = stream;
        const settings = stream.getVideoTracks()[0].getSettings();
        iTextureWebCam = CreateWebCamTexture(settings.width, settings.height);
        video.play();
    }).catch(err => console.error(`${err.name}: ${err.message}`));

    // Interaction
    spaceball = new TrackballRotator(canvas, draw, 0);
    setInterval(draw, 1000 / 20); // 20 FPS
    draw();
}

function deg2rad(deg) {
    return deg * Math.PI / 180;
}
