{\rtf1\ansi\deff0\nouicompat{\fonttbl{\f0\fnil\fcharset0 Calibri;}}
{\*\generator Riched20 10.0.19041}\viewkind4\uc1 
\pard\sa200\sl276\slmult1\f0\fs22\lang9 (function () \{\par
\par
    // x = right\par
    // y = up\par
    // z = closer\par
\par
    let scene;\par
    let camera;\par
    let renderer;\par
    let controls;\par
    let mesh;\par
    let srcImage;\par
    let imageF;\par
    let pixelSize;\par
    let imageCanvas = document.getElementById('imagePreview');\par
    let imageContext = imageCanvas.getContext('2d');\par
    let bitmapData;\par
\par
    let container = document.getElementById('preview');\par
    let fileInput = document.getElementById('fileInput');\par
    let pixelsInput = document.getElementById('pixelsInput');\par
    let methodSelect = document.getElementById('methodSelect');\par
    let exportButton = document.getElementById('exportButton');\par
    let downloadButton = document.getElementById('downloadButton');\par
\par
    let thickness = 0.04;\par
    let padding = 0.05;\par
\par
    function render() \{\par
        renderer.render(scene, camera);\par
\par
        if (controls.autoRotate) \{\par
            requestAnimationFrame(function () \{\par
                render();\par
            \});\par
        \}\par
    \}\par
\par
    function getHeight(x, y) \{\par
        let i = x + y * imageCanvas.width;\par
        let r = bitmapData[i * 4];\par
        let g = bitmapData[i * 4 + 1];\par
        let b = bitmapData[i * 4 + 2];\par
        let l = r * 0.299 + g * 0.587 + b * 0.114;\par
\par
        return l / 256;\par
    \}\par
\par
    function addSquareHolesGeo(geometry) \{\par
        let x, y, xpos, ypos, zpos, v, h;\par
\par
        let maxDepth = 0.3; // relative to thickness;\par
        let inset = 0.1; // relative to pixelSize;\par
        let insetSize = pixelSize * inset;\par
        let insetPixelSize = pixelSize - (insetSize * 2);\par
\par
        // xpos and ypos are left and bottom of the pixel\par
\par
        for (y = 0; y < imageCanvas.height; y++) \{\par
            for (x = 0; x < imageCanvas.width; x++) \{\par
                v = geometry.vertices.length;\par
\par
                h = 1 - getHeight(x, y);\par
\par
                xpos = padding + x * pixelSize;\par
                ypos = imageF - padding - y * pixelSize - pixelSize;\par
                zpos = -thickness * h * maxDepth;\par
\par
                // 11-------10\par
                // |   3---2 |\par
                // | 7-|-6 | |\par
                // | | 0---1 |\par
                // | 4---5   |\par
                // 8---------9\par
\par
                geometry.vertices.push(new THREE.Vector3(xpos + insetSize, ypos + insetSize, 0)); // 0\par
                geometry.vertices.push(new THREE.Vector3(xpos + insetSize + insetPixelSize, ypos + insetSize, 0)); // 1\par
                geometry.vertices.push(new THREE.Vector3(xpos + insetSize + insetPixelSize, ypos + insetSize + insetPixelSize, 0)); // 2\par
                geometry.vertices.push(new THREE.Vector3(xpos + insetSize, ypos + insetSize + insetPixelSize, 0)); // 3\par
\par
                geometry.vertices.push(new THREE.Vector3(xpos + insetSize, ypos + insetSize, zpos)); // 4\par
                geometry.vertices.push(new THREE.Vector3(xpos + insetSize + insetPixelSize, ypos + insetSize, zpos)); // 5\par
                geometry.vertices.push(new THREE.Vector3(xpos + insetSize + insetPixelSize, ypos + insetSize + insetPixelSize, zpos)); // 6\par
                geometry.vertices.push(new THREE.Vector3(xpos + insetSize, ypos + insetSize + insetPixelSize, zpos)); // 7\par
\par
                geometry.faces.push(new THREE.Face3(v + 4, v + 5, v + 6));\par
                geometry.faces.push(new THREE.Face3(v + 4, v + 6, v + 7));\par
\par
                geometry.faces.push(new THREE.Face3(v + 7, v + 6, v + 2));\par
                geometry.faces.push(new THREE.Face3(v + 7, v + 2, v + 3));\par
\par
                geometry.faces.push(new THREE.Face3(v + 0, v + 1, v + 5));\par
                geometry.faces.push(new THREE.Face3(v + 0, v + 5, v + 4));\par
\par
                geometry.faces.push(new THREE.Face3(v + 4, v + 7, v + 3));\par
                geometry.faces.push(new THREE.Face3(v + 4, v + 3, v + 0));\par
\par
                geometry.faces.push(new THREE.Face3(v + 6, v + 5, v + 1));\par
                geometry.faces.push(new THREE.Face3(v + 6, v + 1, v + 2));\par
\par
                geometry.vertices.push(new THREE.Vector3(xpos, ypos, 0)); // 8\par
                geometry.vertices.push(new THREE.Vector3(xpos + pixelSize, ypos, 0)); // 9\par
                geometry.vertices.push(new THREE.Vector3(xpos + pixelSize, ypos + pixelSize, 0)); // 10\par
                geometry.vertices.push(new THREE.Vector3(xpos, ypos + pixelSize, 0)); // 11\par
\par
                geometry.faces.push(new THREE.Face3(v + 8, v + 9, v + 1));\par
                geometry.faces.push(new THREE.Face3(v + 8, v + 1, v + 0));\par
\par
                geometry.faces.push(new THREE.Face3(v + 11, v + 8, v + 0));\par
                geometry.faces.push(new THREE.Face3(v + 11, v + 0, v + 3));\par
\par
                geometry.faces.push(new THREE.Face3(v + 3, v + 2, v + 10));\par
                geometry.faces.push(new THREE.Face3(v + 3, v + 10, v + 11));\par
\par
                geometry.faces.push(new THREE.Face3(v + 2, v + 1, v + 9));\par
                geometry.faces.push(new THREE.Face3(v + 2, v + 9, v + 10));\par
\par
                // connect to the frame\par
                if (y === 0) \{\par
                    geometry.faces.push(new THREE.Face3(3, v + 11, v + 10));\par
                    if (x === imageCanvas.width - 1) \{\par
                        geometry.faces.push(new THREE.Face3(3, v + 10, 2));\par
                    \}\par
                \}\par
                if (x === imageCanvas.width - 1) \{\par
                    geometry.faces.push(new THREE.Face3(2, v + 10, v + 9));\par
                    if (y === imageCanvas.height - 1) \{\par
                        geometry.faces.push(new THREE.Face3(2, v + 9, 1));\par
                    \}\par
                \}\par
                if (y === imageCanvas.height - 1) \{\par
                    geometry.faces.push(new THREE.Face3(1, v + 9, v + 8));\par
                    if (x === 0) \{\par
                        geometry.faces.push(new THREE.Face3(1, v + 8, 0));\par
                    \}\par
                \}\par
                if (x === 0) \{\par
                    geometry.faces.push(new THREE.Face3(0, v + 8, v + 11));\par
                    if (y === 0) \{\par
                        geometry.faces.push(new THREE.Face3(0, v + 11, 3));\par
                    \}\par
                \}\par
            \}\par
        \}\par
    \}\par
\par
    function addDepthMapGeo(geometry) \{\par
        let x, y, xpos, ypos, z0, z1, z2, z3, v, h, h0, h1, h2, h3, tf, v0, v1, v2, v3;\par
\par
        let maxDepth = 1; // relative to thickness;\par
        let blackDepth = 0.5; // relative to thickness;\par
\par
        // create the border\par
        v = geometry.vertices.length;\par
        geometry.vertices.push(geometry.vertices[0].clone());\par
        geometry.vertices[v + 0].x += padding;\par
        geometry.vertices[v + 0].y += padding;\par
\par
        geometry.vertices.push(geometry.vertices[1].clone());\par
        geometry.vertices[v + 1].x -= padding;\par
        geometry.vertices[v + 1].y += padding;\par
\par
        geometry.vertices.push(geometry.vertices[2].clone());\par
        geometry.vertices[v + 2].x -= padding;\par
        geometry.vertices[v + 2].y -= padding;\par
\par
        geometry.vertices.push(geometry.vertices[3].clone());\par
        geometry.vertices[v + 3].x += padding;\par
        geometry.vertices[v + 3].y -= padding;\par
\par
        v0 = v + 0;\par
        v1 = v + 1;\par
        v2 = v + 2;\par
        v3 = v + 3;\par
\par
        geometry.faces.push(new THREE.Face3(0, 1, v1));\par
        geometry.faces.push(new THREE.Face3(0, v1, v0));\par
\par
        geometry.faces.push(new THREE.Face3(1, 2, v2));\par
        geometry.faces.push(new THREE.Face3(1, v2, v1));\par
\par
        geometry.faces.push(new THREE.Face3(2, 3, v3));\par
        geometry.faces.push(new THREE.Face3(2, v3, v2));\par
\par
        geometry.faces.push(new THREE.Face3(3, 0, v0));\par
        geometry.faces.push(new THREE.Face3(3, v0, v3));\par
\par
\par
\par
        // xpos and ypos are left and bottom of the pixel\par
        for (y = 0; y < imageCanvas.height; y++) \{\par
            for (x = 0; x < imageCanvas.width; x++) \{\par
                v = geometry.vertices.length;\par
\par
                h = getHeight(x, y);\par
\par
                xpos = padding + x * pixelSize;\par
                ypos = imageF - padding - y * pixelSize - pixelSize;\par
\par
                // h3   h2\par
                //   \\ /\par
                //   v[i]\par
                //   / \\\par
                // h0   h1\par
\par
                z0 = 0;\par
                if (x > 0 && y < imageCanvas.height - 1) \{\par
                    h0 = getHeight(x - 1, y + 1);\par
                    h1 = getHeight(x, y + 1);\par
                    h2 = h;\par
                    h3 = getHeight(x - 1, y);\par
                    z0 = (h0 + h1 + h2 + h3) / 4;\par
                \}\par
\par
                z1 = 0;\par
                if (x < imageCanvas.width - 1 && y < imageCanvas.height - 1) \{\par
                    h0 = getHeight(x, y + 1);\par
                    h1 = getHeight(x + 1, y + 1);\par
                    h2 = getHeight(x + 1, y);\par
                    h3 = h;\par
                    z1 = (h0 + h1 + h2 + h3) / 4;\par
                \}\par
\par
                z2 = 0;\par
                if (x < imageCanvas.width - 1 && y > 0) \{\par
                    h0 = h;\par
                    h1 = getHeight(x + 1, y);\par
                    h2 = getHeight(x + 1, y - 1);\par
                    h3 = getHeight(x, y - 1);\par
                    z2 = (h0 + h1 + h2 + h3) / 4;\par
                \}\par
\par
                z3 = 0;\par
                if (x > 0 && y > 0) \{\par
                    h0 = getHeight(x - 1, y);\par
                    h1 = h;\par
                    h2 = getHeight(x, y - 1);\par
                    h3 = getHeight(x - 1, y - 1);\par
                    z3 = (h0 + h1 + h2 + h3) / 4;\par
                \}\par
\par
                z0 = (-thickness * blackDepth) + (thickness * z0 * maxDepth);\par
                z1 = (-thickness * blackDepth) + (thickness * z1 * maxDepth);\par
                z2 = (-thickness * blackDepth) + (thickness * z2 * maxDepth);\par
                z3 = (-thickness * blackDepth) + (thickness * z3 * maxDepth);\par
\par
                // 3---2\par
                // |   |\par
                // 0---1\par
\par
                geometry.vertices.push(new THREE.Vector3(xpos, ypos, z0)); // 0\par
                geometry.vertices.push(new THREE.Vector3(xpos + pixelSize, ypos, z1)); // 1\par
                geometry.vertices.push(new THREE.Vector3(xpos + pixelSize, ypos + pixelSize, z2)); // 2\par
                geometry.vertices.push(new THREE.Vector3(xpos, ypos + pixelSize, z3)); // 3\par
\par
                tf = z1 + z3 > z0 + z2;\par
                if(tf) \{\par
                    geometry.faces.push(new THREE.Face3(v + 0, v + 1, v + 2));\par
                    geometry.faces.push(new THREE.Face3(v + 0, v + 2, v + 3));\par
                \} else \{\par
                    geometry.faces.push(new THREE.Face3(v + 3, v + 0, v + 1));\par
                    geometry.faces.push(new THREE.Face3(v + 3, v + 1, v + 2));\par
                \}\par
\par
                // connect to the frame\par
                if (y === 0) \{\par
                    geometry.faces.push(new THREE.Face3(v3, v + 3, v + 2));\par
                    if (x === imageCanvas.width - 1) \{\par
                        geometry.faces.push(new THREE.Face3(v3, v + 2, v2));\par
                    \}\par
                \}\par
                if (x === imageCanvas.width - 1) \{\par
                    geometry.faces.push(new THREE.Face3(v2, v + 2, v + 1));\par
                    if (y === imageCanvas.height - 1) \{\par
                        geometry.faces.push(new THREE.Face3(v2, v + 1, v1));\par
                    \}\par
                \}\par
                if (y === imageCanvas.height - 1) \{\par
                    geometry.faces.push(new THREE.Face3(v1, v + 1, v + 0));\par
                    if (x === 0) \{\par
                        geometry.faces.push(new THREE.Face3(v1, v + 0, v0));\par
                    \}\par
                \}\par
                if (x === 0) \{\par
                    geometry.faces.push(new THREE.Face3(v0, v + 0, v + 3));\par
                    if (y === 0) \{\par
                        geometry.faces.push(new THREE.Face3(v0, v + 3, v3));\par
                    \}\par
                \}\par
            \}\par
        \}\par
    \}\par
\par
\par
    function addDefault(geometry) \{\par
        // front vertices\par
        geometry.vertices.push(new THREE.Vector3(0, 0, 0)); // 0\par
        geometry.vertices.push(new THREE.Vector3(1, 0, 0)); // 1\par
        geometry.vertices.push(new THREE.Vector3(1, imageF, 0)); // 2\par
        geometry.vertices.push(new THREE.Vector3(0, imageF, 0)); // 3\par
\par
        // back vertices\par
        geometry.vertices.push(new THREE.Vector3(0, 0, -thickness)); // 4\par
        geometry.vertices.push(new THREE.Vector3(1, 0, -thickness)); // 5\par
        geometry.vertices.push(new THREE.Vector3(1, imageF, -thickness)); // 6\par
        geometry.vertices.push(new THREE.Vector3(0, imageF, -thickness)); // 7\par
\par
        // back faces\par
        geometry.faces.push(new THREE.Face3(5, 4, 7));\par
        geometry.faces.push(new THREE.Face3(5, 7, 6));\par
\par
        // left faces\par
        geometry.faces.push(new THREE.Face3(4, 0, 3));\par
        geometry.faces.push(new THREE.Face3(4, 3, 7));\par
\par
        // top faces\par
        geometry.faces.push(new THREE.Face3(3, 2, 6));\par
        geometry.faces.push(new THREE.Face3(3, 6, 7));\par
\par
        // right faces\par
        geometry.faces.push(new THREE.Face3(1, 5, 6));\par
        geometry.faces.push(new THREE.Face3(1, 6, 2));\par
\par
        // bottom faces\par
        geometry.faces.push(new THREE.Face3(4, 5, 1));\par
        geometry.faces.push(new THREE.Face3(4, 1, 0));\par
    \}\par
\par
    function updateMeshGeo() \{\par
        // we use 1 unit as width\par
\par
        let geometry = new THREE.Geometry();\par
\par
        if (imageF) \{\par
            addDefault(geometry);\par
\par
            switch (methodSelect.value) \{\par
                case 'square_holes':\par
                    addSquareHolesGeo(geometry);\par
                    break;\par
                case 'depth_map':\par
                    addDepthMapGeo(geometry);\par
                    break;\par
            \}\par
\par
            // because we didn't care about double vertices we merge them\par
            geometry.mergeVertices();\par
\par
            // the origin is at the left bottom so we center it\par
            geometry.translate(-0.5, -imageF * 0.5, thickness * 0.5);\par
\par
            geometry.elementsNeedUpdate = true;\par
            geometry.computeBoundingSphere();\par
            geometry.computeFaceNormals();\par
            geometry.computeBoundingBox();\par
        \}\par
\par
        mesh.geometry = geometry;\par
        render();\par
    \}\par
\par
    function updateImage() \{\par
        if (srcImage) \{\par
            imageF = srcImage.height / srcImage.width;\par
            imageCanvas.width = Math.min(parseInt(pixelsInput.value), srcImage.width);\par
            imageCanvas.height = Math.round(imageF * imageCanvas.width);\par
            imageContext.drawImage(\par
                srcImage,\par
                0,\par
                0,\par
                srcImage.width,\par
                srcImage.height,\par
                0,\par
                0,\par
                imageCanvas.width,\par
                imageCanvas.height\par
            );\par
\par
            bitmapData = imageContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;\par
\par
            pixelsInput.max = srcImage.width;\par
\par
            pixelSize = ((imageCanvas.width - (2 * (padding * imageCanvas.width))) / imageCanvas.width) / imageCanvas.width;\par
\par
            // set imageF again because the padding is based on the width and we need the right height\par
            imageF = 2 * padding + pixelSize * imageCanvas.height;\par
\par
            updateMeshGeo();\par
        \}\par
    \}\par
\par
    function exportStl() \{\par
        // we export the STL in ascii format\par
        let data = 'solid \\n';\par
\par
        // facet normal ni nj nk\par
        //   outer loop\par
        //     vertex v1x v1y v1z\par
        //     vertex v2x v2y v2z\par
        //     vertex v3x v3y v3z\par
        //   endloop\par
        // endfacet\par
\par
        let faces = mesh.geometry.faces;\par
        let vertices = mesh.geometry.vertices;\par
        for (let f = 0; f < faces.length; f++) \{\par
            data += 'facet normal ' + faces[f].normal.x + ' ' + faces[f].normal.y + ' ' + faces[f].normal.z + '\\n';\par
            data += 'outer loop\\n';\par
            data += 'vertex ' + vertices[faces[f].a].x + ' ' + vertices[faces[f].a].y + ' ' + vertices[faces[f].a].z + '\\n';\par
            data += 'vertex ' + vertices[faces[f].b].x + ' ' + vertices[faces[f].b].y + ' ' + vertices[faces[f].b].z + '\\n';\par
            data += 'vertex ' + vertices[faces[f].c].x + ' ' + vertices[faces[f].c].y + ' ' + vertices[faces[f].c].z + '\\n';\par
            data += 'endloop\\n';\par
            data += 'endfacet\\n';\par
        \}\par
\par
        data += 'endsolid ';\par
\par
        let file = new Blob([data], \{type: 'application/vnd.ms-pki.stl'\});\par
        downloadButton.href = URL.createObjectURL(file);\par
        downloadButton.download = 'image2stl.' + ((new Date).toISOString()) + '.stl';\par
    \}\par
\par
    function setSizes() \{\par
        renderer.setSize(container.clientWidth, container.clientHeight);\par
    \}\par
\par
    function init() \{\par
        scene = new THREE.Scene();\par
\par
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 10);\par
        camera.position.x = 0;\par
        camera.position.y = 0.2;\par
        camera.position.z = 2;\par
        camera.zoom = 2.4;\par
        camera.lookAt(new THREE.Vector3(0, 0, 0));\par
        camera.updateProjectionMatrix();\par
\par
        renderer = new THREE.WebGLRenderer(\{alpha: true, antialias: true\});\par
        renderer.shadowMap.enabled = true;\par
        renderer.shadowMap.type = THREE.BasicShadowMap;\par
        container.appendChild(renderer.domElement);\par
\par
        let geometry = new THREE.Geometry();\par
        //let material = new THREE.MeshLambertMaterial(\{color: 0xcccccc\});\par
        let material = new THREE.MeshPhongMaterial(\{\par
            color: 0xdddddd,\par
            name: 'plate',\par
            side: THREE.DoubleSide,\par
            shadowSide: THREE.FrontSide,\par
            //wireframe: true\par
        \});\par
        mesh = new THREE.Mesh(geometry, material);\par
        mesh.castShadow = true;\par
        mesh.receiveShadow = true;\par
        scene.add(mesh);\par
\par
        let light = new THREE.PointLight(0xffffff, 1.4, 5000, 2);\par
        light.position.x = 0;\par
        light.position.y = 2;\par
        light.position.z = 1;\par
        light.castShadow = true;\par
        light.shadow.mapSize.width = 2048;\par
        light.shadow.mapSize.height = 2048;\par
        light.shadow.camera.near = 0.01;\par
        light.shadow.camera.far = 3;\par
        light.shadow.bias = -0.001;\par
        scene.add(light);\par
\par
        let sky = new THREE.AmbientLight(0xffffff, 0.5);\par
        scene.add(sky);\par
\par
        controls = new THREE.OrbitControls(camera, container);\par
        controls.autoRotateSpeed = -0.1;\par
        controls.autoRotate = false;\par
        controls.minDistance = 0.01;\par
        controls.maxDistance = 5;\par
        controls.addEventListener('change', function () \{\par
            if (!controls.autoRotate) \{\par
                render();\par
            \}\par
        \});\par
        controls.update();\par
\par
\par
        setSizes();\par
        updateMeshGeo();\par
        render();\par
    \}\par
\par
\par
    window.addEventListener('load', function (e) \{\par
        init();\par
    \});\par
\par
    fileInput.addEventListener('change', function (e) \{\par
        if (fileInput.files.length) \{\par
            let reader = new FileReader();\par
            reader.onload = function (e) \{\par
                srcImage = new Image();\par
                srcImage.addEventListener('load', function (e) \{\par
                    updateImage();\par
                \});\par
                srcImage.src = e.target.result;\par
            \};\par
            reader.readAsDataURL(fileInput.files[0]);\par
        \}\par
    \});\par
\par
    pixelsInput.addEventListener('change', function (e) \{\par
        updateImage();\par
    \});\par
\par
    methodSelect.addEventListener('change', function (e) \{\par
        updateMeshGeo();\par
    \});\par
\par
    exportButton.addEventListener('click', function (e) \{\par
        exportStl();\par
    \});\par
\par
\})();\par
\par
\par
\par
\par
}
 