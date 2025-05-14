function ModelSurface() {
    this.iVertexBuffer = gl.createBuffer();
    this.vertexList = [];
    this.uLineCount = 0;
    this.pointsPerULine = 0;
    this.vLineCount = 0;
    this.pointsPerVLine = 0;

    this.iTexCoordBuffer = gl.createBuffer();
    this.texCoordList = [];

    this.iFillIndexBuffer = null;
    this.fillIndices = [];
    this.fillIndexCount = 0;
    this.fillVertexCount = 0;

    this.CreateSurfaceData = function() {
    const a = 2;
    const b = 2;
    const n = 1;
    const uSegments = 50;
    const vSegments = 8;
    const vMax = 0.8;

    const du = (2 * Math.PI) / uSegments;
    const dv = (2 * vMax) / vSegments;

    this.uLineCount = uSegments + 1;
    this.pointsPerULine = vSegments + 1;

    this.vertexList = [];
    this.texCoordList = [];

    // --- Вершини (u, v)
    for (let i = 0; i <= uSegments; i++) {
        let u = i * du;
        for (let j = 0; j <= vSegments; j++) {
            let v = -vMax + j * dv;

            const sin_nu = Math.sin(n * u);
            const cos_nu = Math.cos(n * u);

            const R = a + b * sin_nu;

            const x = R * Math.cos(u) - v * Math.sin(u);
            const y = R * Math.sin(u) + v * Math.cos(u);
            const z = b * cos_nu;

            this.vertexList.push(x, y, z);

            let uTex = u / (2 * Math.PI);
            let vTex = (v + vMax) / (2 * vMax);
            this.texCoordList.push(uTex, vTex);
        }
    }

    this.fillVertexCount = this.uLineCount * this.pointsPerULine;
    this.vLineCount = this.pointsPerULine;
    this.pointsPerVLine = this.uLineCount;

    // --- Поверхня для ліній по v (опціонально)
    for (let j = 0; j <= vSegments; j++) {
        let v = -vMax + j * dv;
        for (let i = 0; i <= uSegments; i++) {
            let u = i * du;

            const sin_nu = Math.sin(n * u);
            const cos_nu = Math.cos(n * u);

            const R = a + b * sin_nu;

            const x = R * Math.cos(u) - v * Math.sin(u);
            const y = R * Math.sin(u) + v * Math.cos(u);
            const z = b * cos_nu;

            this.vertexList.push(x, y, z);

            let uTex = u / (2 * Math.PI);
            let vTex = (v + vMax) / (2 * vMax);
            this.texCoordList.push(uTex, vTex);
        }
    }

    // --- Буфери
    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexList), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoordList), gl.STATIC_DRAW);

    // --- Індекси для трикутників
    this.fillIndices = [];
    for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
            let idx = i * this.pointsPerULine + j;
            this.fillIndices.push(idx, idx + this.pointsPerULine, idx + 1);
            this.fillIndices.push(idx + this.pointsPerULine, idx + this.pointsPerULine + 1, idx + 1);
        }
    }

    this.fillIndexCount = this.fillIndices.length;

    this.iFillIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iFillIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.fillIndices), gl.STATIC_DRAW);
};



    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTexCoord);

        for (let i = 0; i < this.uLineCount; i++) {
            gl.drawArrays(gl.LINE_STRIP, i * this.pointsPerULine, this.pointsPerULine);
        }

        let offset = this.uLineCount * this.pointsPerULine;
        for (let i = 0; i < this.vLineCount; i++) {
            gl.drawArrays(gl.LINE_STRIP, offset + i * this.pointsPerVLine, this.pointsPerVLine);
        }
    };

    this.DrawFilled = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTexCoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iFillIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.fillIndexCount, gl.UNSIGNED_SHORT, 0);
    };
}
