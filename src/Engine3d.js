

var E3D = E3D || {};
(function(E3D) {
    

    var ifUndefDefault = function (value, defaultValue) {
        return value !== undefined ? value : defaultValue;
    };
    
    
    
    var CartesianAxis = (function() {
        
        function CartesianAxis(scene, id, params) {
            params = params || {};
            this.scene = scene;
            this.id = id || "cartesianAxis";
            this.mesh = new BABYLON.Mesh(this.id, scene);
            this.parent = params.parent || null;
            this.size = params.size || 1;
            this.position = params.position || new BABYLON.Vector3(0, 0, 0);
            this.axisX = params.axisX || new BABYLON.Vector3(1, 0, 0);
            this.axisY = params.axisY || new BABYLON.Vector3(0, 1, 0);
            this.axisZ = params.axisZ || new BABYLON.Vector3(0, 0, 1);
        }
    
    
        var _createLine = function(scene, id, point1, point2, color) {
            color = color || new BABYLON.Color3(1, 0, 0);
            var line = BABYLON.Mesh.CreateLines(id, [
                point1,
                point2
            ], scene);
            line.color = color;
            return line;
        };
        CartesianAxis.prototype.update = function(params) {
            params = params || {};
    
            var size = params.size || this.size;
            this.size = size;
            var parent = params.parent || this.parent;
            this.parent = parent;
            var position = params.position || this.position;
            this.position = position;
    
            this.mesh.getChildMeshes().forEach(function(mesh) {
                Engine3d.disposeMesh(mesh);
            });
    
            // var material = engine3d.getEmissiveMaterialRGB({r: 255, a: 0.3});
            // var meshBox = engine3d.createBox("", {size: 0.1});
            // meshBox.material = material;
            // meshBox.parent = this.mesh;
            
            var lineAxisX = _createLine(this.scene, this.id + "_axisX", 
                BABYLON.Vector3.Zero(),
                (BABYLON.Vector3.Zero()).add(this.axisX.scale(size)),
                new BABYLON.Color3(1, 0, 0) 
            );
            var lineAxisY = _createLine(this.scene, this.id + "_axisY", 
                BABYLON.Vector3.Zero(),
                (BABYLON.Vector3.Zero()).add(this.axisY.scale(size)),
                new BABYLON.Color3(0, 1, 0) 
            );
            var lineAxisZ = _createLine(this.scene, this.id + "_axisZ", 
                BABYLON.Vector3.Zero(),
                (BABYLON.Vector3.Zero()).add(this.axisZ.scale(size)),
                new BABYLON.Color3(0, 0, 1) 
            );
    
            lineAxisX.parent = this.mesh;
            lineAxisY.parent = this.mesh;
            lineAxisZ.parent = this.mesh;
    
            this.mesh.position = position;
    
            if (parent) { this.mesh.parent = parent; }
    
        };
    
    
        CartesianAxis.prototype.toggle = function(visible) {    
            if (visible === true || visible === false) {} else {
                visible = !this.mesh.isVisible;
            }
            this.mesh.getChildMeshes().forEach(function(mesh) {
                mesh.isVisible = visible;
            });
    
            this.mesh.isVisible = visible;
            
        };
    
    
        return CartesianAxis;
    
    
    })();
    
    
    
    var Engine3d = (function() {
    
        function Engine3d() {
            
            this.canvasNode = null;
            this.scene = null;
            this.engine = null;
    
    
            // Cache
            this._cache = {};
            this._cacheNode = null;
    
        }
    
    
        var createCamera = function(canvas, scene) {
    
            var toRadians = BABYLON.Tools.ToRadians;
            var alpha = toRadians(60);
            var beta = toRadians(60);
            var radius = 4;
            var target = new BABYLON.Vector3(0, 0, 0);
            
            
            var camera = new BABYLON.ArcRotateCamera("camera_arc0", alpha, beta, radius, target, scene);
            camera.attachControl(canvas, true);
            camera.minZ = 0;
            // camera.maxZ = 1000;
            camera.wheelPrecision = 100;
    
    
            
    
        };
    
    
        Engine3d.prototype.init = function(canvasNode, params = {}) {
    
            this.canvasNode = canvasNode;
    
            var engine = new BABYLON.Engine(canvasNode, true, {
                preserveDrawingBuffer: true, 
                stencil: true
            }); 
            this.engine = engine;
    
            var scene = new BABYLON.Scene(engine);
            this.scene = scene;
            
            scene.useRightHandedSystem = true;
            
            this._cacheNode = new BABYLON.TransformNode("_cache", this.scene);
    
            // scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    
            createCamera(canvasNode, scene);
    
            // light
            var lightHem = new BABYLON.HemisphericLight("lightHem1", new BABYLON.Vector3(0, 1, 0), scene);
            lightHem.intensity = 1;
                    
            window.addEventListener("resize", function () {
                engine.resize();
            });
    
    
        };
    
    
        Engine3d.prototype.start = function() {
            var _this = this;
            this.engine.runRenderLoop(function(){
                _this.scene.render();
            });
            this.engine.resize();
        };
    
    
        Engine3d.prototype.stop = function() {
            this.engine.stopRenderLoop();
        };
    
    
        Engine3d.prototype.resize = function() {
            this.engine.resize();
        };
    
    
        return Engine3d;
    
    
    })();




    /**
     * load
     */

    (function() {
        

        var _decodePath = function (path) {
            var fileStart = path.lastIndexOf('/') + 1;
            var fileName = path.substring(fileStart);
            var filePath = path.substring(0, fileStart);
            return [filePath, fileName];
        };
        var _importGeometry = function(path, scene, onSuccess, onProgress, onError, pluginExtension) {
            var [filePath, fileName] = _decodePath(path);

            if (!onSuccess) { 
                return BABYLON.SceneLoader.ImportMeshAsync(null, dirPath, fileName, scene, onProgress, pluginExtension); 
            }

            BABYLON.SceneLoader.ImportMesh(
                null, // mesh to import, null for all
                filePath,
                fileName,
                scene,
                onSuccess,
                onProgress,
                onError,
                pluginExtension
            );
            
        };
        Engine3d.importGeometry = _importGeometry;
        Engine3d.prototype.importGeometry = function(path, onSuccess, onProgress, onError, pluginExtension) {
            return _importGeometry(path, this.scene, onSuccess, onProgress, onError, pluginExtension);
        };


        Engine3d.prototype._setCachedGeometry = function(id, geometry) {
            this._cache[id] = geometry;
        };


        Engine3d.prototype._getCachedGeometry = function(id) {
            return this._cache[id];
        };


        Engine3d.prototype.loadGLBGeometry = function(params, callback) {
            var _this = this;
            if (callback === undefined) {
                return new Promise(function(resolve, reject) {
                    _this.loadGLBGeometry(params, function(err, result) {
                        if (err) { reject(err); } else { resolve(result); }
                    });
                });
            }

            params = params || {};
            const { scene } = this;
            const { id, filepath, scale, position, rotations } = params;

            var node = this._getCachedGeometry(filepath);
            if (node) {
                var clonedNode = node.clone(node.name);
                clonedNode.getChildMeshes().forEach(function(mesh) {
                    mesh.name = mesh.metadata.name;
                });
                return callback(null, clonedNode);
            }
            


            this.importGeometry(filepath, function(meshes) {
                
                var nodeId = id || "glb";
                var node = new BABYLON.TransformNode(nodeId, scene);

                meshes.forEach(function(mesh) {
                    mesh.parent = node;
                    mesh.metadata = { name: mesh.name };
                });

                _this.hideMesh(node);

                if (scale) {
                    _this.setMeshScale(node, scale);
                }
                if(position) {
                    node.position.addInPlace(BABYLON.Vector3.FromArray(position));
                }
                if (rotations && rotations.y) {
                    node.rotation.y = BABYLON.Tools.ToRadians(rotations.y);
                }

                
                var cachedNode = node.clone(nodeId); 
                cachedNode.parent = _this._cacheNode;
                _this._setCachedGeometry(filepath, cachedNode);
                

                callback(null, node);


            }, function(progressEvent) {
                // console.log("progressEvent", progressEvent);
            }, function(scene, message, exception) {
                // console.log("message", message);
                // console.log("exception", exception);

                callback({
                    error: exception,
                    message: message
                });

            });  

        };


        // ##OLD Caricare anche la geometria di Player e Cannon con l'altro metodo
        Engine3d.prototype.loadGeometry = function(path, params, callback) {
            var _this = this;
            params = params || {};
            if (callback === undefined) {
                return new Promise(function (resolve, reject) {
                    _this.loadGeometry(path, params, function (err, result) {
                        if (err) { reject(err); } else { resolve(result); }
                    });
                });
            }

            var node = new BABYLON.TransformNode(params.name || "", this.scene);

            _importGeometry(path, this.scene, function(meshes) {
                
                meshes.forEach(function(m) { m.parent = node; });
                callback(null, node);
            },
            null,
            function(err) {
                callback(err);
            });

        };



    })();




    /**
     * Mesh
     */

    (function() {
        

        var getMeshesBoundingInfo = function(meshes) {
                
            meshes = meshes || [];

            meshes = meshes.filter(function(mesh) {
                // ##NOTA alcune mesh (ad esempio se importate da obj) hanno proprietà geometry non nulla ma provando ad estrarne i VerticesData:
                // var data = mesh.geometry.serializeVerticeData();
                // si trova che i dati all'interno sono array vuoti. In questo caso il metodo mesh.getBoundingInfo()
                // ritorna una extendSize delle boundingInfo con extensione infinita
                // Per ovviare al problema viene qui effettuato il check che tutte le mesh abbiano almeno un indice
                return mesh && mesh.geometry && mesh.geometry.getIndices().length;
            });
            
            var min = BABYLON.Vector3.Zero();
            var max = BABYLON.Vector3.Zero();
            var bi = null;
            var meshMin;
            var meshMax;
            for (var i = 0; i < meshes.length; i++) {

                var currentMesh = meshes[i];
                currentMesh.computeWorldMatrix(true);
                bi = currentMesh.getBoundingInfo();
                
                if (i === 0) {
                    min = bi.boundingBox.minimumWorld;
                    max = bi.boundingBox.maximumWorld;
                } else {
                    meshMin = bi.boundingBox.minimumWorld;
                    meshMax = bi.boundingBox.maximumWorld;
                    // console.log('boundingInfo',bi); console.log('meshMin', meshMin); console.log('meshMax', meshMax);
                    
                    if ( meshMin.x < min.x ) { min.x = meshMin.x; }
                    if ( meshMin.y < min.y ) { min.y = meshMin.y; }
                    if ( meshMin.z < min.z ) { min.z = meshMin.z; }
                    if ( meshMax.x > max.x ) { max.x = meshMax.x; }
                    if ( meshMax.y > max.y ) { max.y = meshMax.y; }
                    if ( meshMax.z > max.z ) { max.z = meshMax.z; }

                }
                
            }   
            var boundingInfo = new BABYLON.BoundingInfo(min, max);
            
            return boundingInfo;

        };
        Engine3d.prototype.getMeshesBoundingInfo = getMeshesBoundingInfo;


        var getMeshBoundingInfo = function(mesh, includeChildMeshes) {

            includeChildMeshes = includeChildMeshes !== undefined ? includeChildMeshes : true;
            
            if (!mesh) { return console.error('No mesh input in getMeshBoundingInfo'); }
            
            // ##TODO capire perche non funziona con una singola mesh
            // sembra che la calcoli nel local space senza aggiornare la WorldMatrix
            // ma con mesh.computeWorldMatrix(true) cmq non funziona
            if (!includeChildMeshes) {
                mesh.computeWorldMatrix(true);
                var bi = mesh.getBoundingInfo();
                var min = bi.boundingBox.minimumWorld;
                var max = bi.boundingBox.maximumWorld;
                var boundingInfo = new BABYLON.BoundingInfo(min, max);
                return boundingInfo;
            }
            
            var meshes = mesh.getChildMeshes();
            meshes.push(mesh);
            
            return getMeshesBoundingInfo(meshes);

        };
        Engine3d.prototype.getMeshBoundingInfo = getMeshBoundingInfo;


        var _getSingleMeshSize = function(mesh) {
            mesh.refreshBoundingInfo();
            var boundingInfo = mesh.getBoundingInfo();
            var minimumWorld = boundingInfo.boundingBox.minimumWorld;
            var maximumWorld = boundingInfo.boundingBox.maximumWorld;
            var size = maximumWorld.subtract(minimumWorld);
            return size;
        };
        var getMeshSize = function(mesh, includeChildMeshes) {
            includeChildMeshes = includeChildMeshes !== undefined ? includeChildMeshes : true; 
            if (!includeChildMeshes) { return _getSingleMeshSize(mesh); }
            var boundingInfo = getMeshBoundingInfo(mesh, includeChildMeshes);
            var minimumWorld = boundingInfo.boundingBox.minimumWorld;
            var maximumWorld = boundingInfo.boundingBox.maximumWorld;
            var size = maximumWorld.subtract(minimumWorld);
            return size;
        };
        Engine3d.prototype.getMeshSize = getMeshSize;


        Engine3d.prototype.translateMeshPivot = function(mesh, translationPoint) {
            mesh.setPivotPoint(new BABYLON.Vector3(translationPoint.x, translationPoint.y, translationPoint.z));
        };


        Engine3d.prototype.hideMesh = function(mesh, filterFn) {
            if (!mesh) { return; }
            mesh.getChildMeshes(false, filterFn).forEach(function(childmesh) {
                childmesh.isVisible = false;
            });
            mesh.isVisible = false;
        };
        Engine3d.prototype.showMesh = function(mesh, filterFn) {
            if (!mesh) { return; }
            mesh.getChildMeshes(false, filterFn).forEach(function(childmesh) {
                childmesh.isVisible = true;
            });
            mesh.isVisible = true;
        };


        var _setMeshScale = function(mesh, scaling) {
            var sVector = null;
            if (typeof scaling === "number") {
                sVector = new BABYLON.Vector3(scaling, scaling, scaling);
            } else {
                sVector = new BABYLON.Vector3(scaling.x || 1, scaling.y || 1, scaling.z || 1);
            }
            mesh.scaling = sVector;
        };
        Engine3d.setMeshScale = _setMeshScale;
        Engine3d.prototype.setMeshScale = _setMeshScale;


    })();




    /**
     * Geometry
     */

    (function() {
        

        Engine3d.prototype.buildDebugBox = function(params = {}) {

            const { scene } = this;

            let { size = 0.1, color = {g: 255} } = params;

            var box = BABYLON.MeshBuilder.CreateBox("debugbox", {
                size: size
            }, scene);
            
            const material = this.getEmissiveMaterialRGB(color);
            box.material = material;
            
            box.renderingGroupId = 2;

            return box;

        };


        var _createBoxGeometry = function(params) {
            params = params || {};

            
            // ##NOTA looking at every face: anticlockwise vertices starting from bottom-left corner
            
            var positions = [
                // front
                0, 0, 1,
                1, 0, 1,
                1, 1, 1,
                0, 1, 1,
                // back
                1, 0, 0,
                0, 0, 0,
                0, 1, 0,
                1, 1, 0,
                // right
                1, 0, 1,
                1, 0, 0,
                1, 1, 0,
                1, 1, 1,
                // left
                0, 0, 0,
                0, 0, 1,
                0, 1, 1,
                0, 1, 0,
                // up
                0, 1, 1,
                1, 1, 1,
                1, 1, 0,
                0, 1, 0,
                // down
                0, 0, 0,
                1, 0, 0,
                1, 0, 1,
                0, 0, 1,
            ];


            // ##NOTA the triangles indices must be in clockwise order
            
            var indices = [
                // front
                0, 2, 1, 0, 3, 2, 
                // back
                4, 6, 5, 4, 7, 6, 
                // right
                8, 10, 9, 8, 11, 10, 
                // left
                12, 14, 13, 12, 15, 14, 
                // up
                16, 18, 17, 16, 19, 18, 
                // down
                20, 22, 21, 20, 23, 22
            ];


            var normals = [
                // front
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                // back
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
                // right
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                // left
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                // up
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                // down
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            ];


            var uvs = [
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
            ];


            var width = params.width || params.size || 1000;
            var height = params.height || params.size || 1000;
            var depth = params.depth || params.size || 1000;
            
            var posScale = [width, height, depth];

            positions = positions.map(function(value, index) { 
                return value * posScale[index % 3];
            });



            var geometry = {
                indices: indices,
                positions: positions,
                normals: normals,
                uvs: uvs,
            };


            var computeUV = params.computeUV;
            computeUV = computeUV !== undefined ? computeUV : false;

            if (!computeUV) { return geometry; }


            // ##REF
            // { "x": 1000, "y": 1000, "offs_x": 0, "offs_y": 0, "rot": 90 };


            // ##OLD
            // var uvScale = [ width/1000, height/1000, depth/1000 ];


            var uvOffsetX = params.uvOffsetX;
            uvOffsetX = uvOffsetX !== undefined ? uvOffsetX : 0;
            var uvOffsetY = params.uvOffsetY;
            uvOffsetY = uvOffsetY !== undefined ? uvOffsetY : 0;
            
            var uvScaleX = params.uvScaleX;
            uvScaleX = uvScaleX !== undefined ? uvScaleX : 1000;
            var uvScaleY = params.uvScaleY;
            uvScaleY = uvScaleY !== undefined ? uvScaleY : 1000;


            var uvFaces = [
                // ##OLD
                // [0, 0, width/uvScaleX, height/uvScaleY],
                // [0, 0, depth/uvScaleX, height/uvScaleY],
                // [0, 0, width/uvScaleX, depth/uvScaleY],

                [uvOffsetX/uvScaleX, uvOffsetY/uvScaleY, (width + uvOffsetX)/uvScaleX, (height + uvOffsetY)/uvScaleY],
                [uvOffsetX/uvScaleX, uvOffsetY/uvScaleY, (depth + uvOffsetX)/uvScaleX, (height + uvOffsetY)/uvScaleY],
                [uvOffsetX/uvScaleX, uvOffsetY/uvScaleY, (width + uvOffsetX)/uvScaleX, (depth + uvOffsetY)/uvScaleY],

            ];
            // console.log("uvFaces", uvFaces);

            uvs = [

                // ##OLD
                // 0, 0, uvScale[0], 0, uvScale[0], uvScale[1], 0, uvScale[1],
                // 0, 0, uvScale[0], 0, uvScale[0], uvScale[1], 0, uvScale[1],
                // // right, left
                // 0, 0, uvScale[2], 0, uvScale[2], uvScale[1], 0, uvScale[1],
                // 0, 0, uvScale[2], 0, uvScale[2], uvScale[1], 0, uvScale[1],
                // // up, down
                // 0, 0, uvScale[0], 0, uvScale[0], uvScale[2], 0, uvScale[2],
                // 0, 0, uvScale[0], 0, uvScale[0], uvScale[2], 0, uvScale[2],

                // ##REF 0, 0, 1, 0, 1, 1, 0, 1

                // front, back
                uvFaces[0][0], uvFaces[0][1], uvFaces[0][2], uvFaces[0][1], uvFaces[0][2], uvFaces[0][3], uvFaces[0][0], uvFaces[0][3],
                uvFaces[0][0], uvFaces[0][1], uvFaces[0][2], uvFaces[0][1], uvFaces[0][2], uvFaces[0][3], uvFaces[0][0], uvFaces[0][3],
                // right, left
                uvFaces[1][0], uvFaces[1][1], uvFaces[1][2], uvFaces[1][1], uvFaces[1][2], uvFaces[1][3], uvFaces[1][0], uvFaces[1][3],
                uvFaces[1][0], uvFaces[1][1], uvFaces[1][2], uvFaces[1][1], uvFaces[1][2], uvFaces[1][3], uvFaces[1][0], uvFaces[1][3],
                // up, down
                uvFaces[2][0], uvFaces[2][1], uvFaces[2][2], uvFaces[2][1], uvFaces[2][2], uvFaces[2][3], uvFaces[2][0], uvFaces[2][3],
                uvFaces[2][0], uvFaces[2][1], uvFaces[2][2], uvFaces[2][1], uvFaces[2][2], uvFaces[2][3], uvFaces[2][0], uvFaces[2][3],
            ];


            geometry.uvs = uvs;


            return geometry;

        };
        Engine3d.createBoxGeometry = _createBoxGeometry;
        Engine3d.prototype.createBoxGeometry = _createBoxGeometry;


        var _createMesh = function(id, geometry, scene, params) {
            params = params || {};
            var updatable = ifUndefDefault(params.updatable, false);
            var mesh = new BABYLON.Mesh(id, scene);
            var vertexData = new BABYLON.VertexData();
            vertexData.positions = geometry.positions;
            vertexData.indices = geometry.indices;	
            vertexData.normals = geometry.normals; 
            vertexData.uvs = geometry.uvs;
            vertexData.uvs2 = geometry.uvs2;
            vertexData.applyToMesh(mesh, updatable);
            mesh.computeWorldMatrix(true);
            return mesh;
        };
        Engine3d.createMesh = _createMesh;
        Engine3d.prototype.createMesh = function(id, geometry, params) {
            return _createMesh(id, geometry, this.scene, params);
        };


    })();



    /**
     * Material
     */

    (function() {
        
        
        var _getBBMaterial = function (scene) {
            var material = scene.getMaterialByName("_e3d_mat_bb");
            if (material) { return material; }
            material = new BABYLON.StandardMaterial('_e3d_mat_bb', scene);
            // material.diffuseColor = new BABYLON.Color3(1, 0, 0);
            material.wireframe = true;
            return material;
        };
        Engine3d.prototype.getBBMaterial = function() {
            return _getBBMaterial(this.scene);
        };


        Engine3d.prototype.getEmissiveMaterialRGB = function (color = {}) {
            var { scene } = this;
            
            var r = ifUndefDefault(color.r, 0);
            var g = ifUndefDefault(color.g, 0);
            var b = ifUndefDefault(color.b, 0);
            var a = ifUndefDefault(color.a, 1);

            var materialName = "mat_emis_rgba_" + r + "_" + g + "_" + b + "_" + a;
            
            var material = scene.getMaterialByName(materialName);
    
            if (material) { return material; }
            
            material = new BABYLON.StandardMaterial(materialName, scene);
            material.emissiveColor = BABYLON.Color3.FromInts(r, g, b);
            material.disableLighting = true;
            material.alpha = a;
            
            return material;
        };


        Engine3d.prototype.getStandardMaterialRGB = function(color = {}) {
            var { scene } = this;
            
            var r = ifUndefDefault(color.r, 0);
            var g = ifUndefDefault(color.g, 0);
            var b = ifUndefDefault(color.b, 0);
            var a = ifUndefDefault(color.a, 1);

            var materialName = "mat_std_rgba_" + r + "_" + g + "_" + b + "_" + a;

            var material = scene.getMaterialByName(materialName);

            if(material) { return material; }
            
            material = new BABYLON.StandardMaterial(materialName, scene);
            material.diffuseColor = BABYLON.Color3.FromInts(r, g, b);
            material.alpha = a;
            console.log(material);
            
            return material;
        };


        Engine3d.prototype.getPBRMaterialRGB = function(color = {}, roughness = 0, metallic = 0.7) {
            var { scene } = this;

            var r = ifUndefDefault(color.r, 0);
            var g = ifUndefDefault(color.g, 0);
            var b = ifUndefDefault(color.b, 0);
            var a = ifUndefDefault(color.a, 1);

            var materialName = "mat_pbr_rgba_" + r + "_" + g + "_" + b + "_" + a;

            var material = scene.getMaterialByName(materialName);

            if(material) { return material; }
            
            material = new BABYLON.PBRMaterial(materialName, scene);
            material.diffuseColor = BABYLON.Color3.FromInts(r, g, b);
            material.alpha = a;

            material.metallic = metallic;
            material.roughness = roughness;
            
            if(material.alpha < 1){
                material.transparencyMode = 2;
            }

            return material;

        };

        
    })();


    E3D.CartesianAxis = CartesianAxis;
    E3D.Engine3d = Engine3d;



})(E3D);








