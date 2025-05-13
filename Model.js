function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;
    this.type = gl.TRIANGLES;

    this.BufferData = function(vertices, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        if (indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STREAM_DRAW);
            this.count = indices.length;
        } else {
            this.count = vertices.length / 3;
        }
    }

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);
        
        if (this.type === gl.TRIANGLES && this.iIndexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            gl.drawElements(this.type, this.count, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(this.type, 0, this.count);
        }
    }

    this.DrawWireframe = function() {
        if (this.iIndexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            for (let p=0; p<this.count; p+=3)
                gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, p*2);
        }
    }

    // Ruled Rotor Cylindroid Vertex
    this.CreateVertex = function(a, b, n, u, v) {
        const sin_nu = Math.sin(n * u);
        const cos_nu = Math.cos(n * u);
        
        const x = (a + b * sin_nu) * Math.cos(u) - v * Math.sin(u);
        const y = (a + b * sin_nu) * Math.sin(u) + v * Math.cos(u);
        const z = b * cos_nu;
        
        return [x, y, z];
    }

    this.CreateSurface = function(a, b, n, uSegments, vSegments, vMax) {
        let vertices = [];
        let indices = [];

        let uStep = (2 * Math.PI) / uSegments;
        let vStep = (2 * vMax) / vSegments;

        // Вершины
        for (let i = 0; i <= uSegments; i++) {
            let u = i * uStep;
            for (let j = 0; j <= vSegments; j++) {
                let v = -vMax + j * vStep;
                let vertex = this.CreateVertex(a, b, n, u, v);
                vertices.push(vertex[0], vertex[1], vertex[2]);
            }
        }

        // Индексы
        for (let i = 0; i < uSegments; i++) {
            for (let j = 0; j < vSegments; j++) {
                let v0 = i * (vSegments + 1) + j;
                let v1 = v0 + 1;
                let v2 = v0 + (vSegments + 1);
                let v3 = v2 + 1;

                indices.push(v0, v1, v2);
                indices.push(v2, v1, v3);
            }
        }

        this.BufferData(new Float32Array(vertices), new Uint16Array(indices));
    }

}
