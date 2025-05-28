export function createModelSurfaceGeometry(
    a = 2,
    b = 2,
    n = 1,
    uSegments = 50,
    vSegments = 8,
    vMax = 0.8
) {
    const positions = [];
    const uvs = [];
    const indices = [];

    const du = (2 * Math.PI) / uSegments;
    const dv = (2 * vMax) / vSegments;

    for (let i = 0; i <= uSegments; i++) {
        const u = i * du;

        for (let j = 0; j <= vSegments; j++) {
            const v = -vMax + j * dv;

            const sin_nu = Math.sin(n * u);
            const cos_nu = Math.cos(n * u);

            const R = a + b * sin_nu;

            const x = R * Math.cos(u) - v * Math.sin(u);
            const y = R * Math.sin(u) + v * Math.cos(u);
            const z = b * cos_nu;

            positions.push(x, y, z);

            const uTex = i / uSegments;
            const vTex = j / vSegments;
            uvs.push(uTex, vTex);
        }
    }

    for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
            const idx = i * (vSegments + 1) + j;
            const idxNextU = (i + 1) * (vSegments + 1) + j;

            indices.push(idx, idxNextU, idx + 1);
            indices.push(idxNextU, idxNextU + 1, idx + 1);
        }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
}
