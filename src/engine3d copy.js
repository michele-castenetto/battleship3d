var Engine3d = (function() {
    

    var ifUndefDefault = function (value, defaultValue) {
        return value !== undefined ? value : defaultValue;
    };


    var Engine3d = (function() {
    
        function Engine3d() {
            this.canvas = null;
            this.engine = null;
            this.scene = null;
        }

        Engine3d.prototype.createScene = function(engine, canvas) {
            
            var radius = 1;
            var alpha =  Math.PI/2;
            var beta = Math.PI/2;
            
            var scene = new BABYLON.Scene(engine);
            
            // var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
            var camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvas, true);
            camera.minZ = 0.1;
            camera.lowerRadiusLimit = 0.5;
            camera.upperRadiusLimit = 1;
    
            camera.wheelPrecision = 100;
    
            camera.setTarget(BABYLON.Vector3.Zero());
            
            // camera.attachControl(canvas, false, false);
            camera.attachControl(canvas, false, true, 2);
    
    
            var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
            
            return scene;
        };

        Engine3d.prototype.init = function(canvas, params) {
            var _this = this;

            this.canvas = canvas;
            
            var engine = new BABYLON.Engine(this.canvas, true, {
                preserveDrawingBuffer: true, 
                stencil: true
            });
            this.engine = engine;
            
            var scene = this.createScene(engine, this.canvas);
            this.scene = scene;
    
            // this.showWorldAxis(scene, 4);
    
            scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
                        
            /* Resize event */
            window.addEventListener('resize', function(){
                _this.resize();
            });

            this.canvas.addEventListener("wheel", function(evt) {
                evt.preventDefault();
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


        var _decodePath = function (path) {
            var fileStart = path.lastIndexOf('/') + 1;
            var fileName = path.substring(fileStart);
            var filePath = path.substring(0, fileStart);
            return [filePath, fileName];
        };
        var _importMesh = function(path, scene, onSuccess, onProgress, onError, pluginExtension) {
            var decoded = _decodePath(path);
            var dirPath = decoded[0];
            var fileName = decoded[1];

            BABYLON.SceneLoader.ImportMesh(
                null, // mesh to import, null for all
                dirPath,
                fileName,
                scene,
                onSuccess,
                onProgress,
                onError,
                pluginExtension
            );
            
        };
        Engine3d.prototype.loadGeometry = function(path, callback) {

            var node = new BABYLON.TransformNode("", this.scene);

            _importMesh(path, this.scene, function(meshes) {
                console.log("meshes", meshes);

                meshes.forEach(function(m) { m.parent = node; });
                callback(null, node);
            },
            null,
            function(err) {
                callback(err);
            });


            // node.rotate(BABYLON.Axis.Z, BABYLON.Tools.ToRadians(90), BABYLON.Space.LOCAL);



        };


        Engine3d.prototype.startRotate = function(speed) {
            var scene = this.scene;

            speed = speed || -0.5;

            var rotationHandler = function() {
                scene.activeCamera.alpha += BABYLON.Tools.ToRadians(speed);
            };
            this.rotationHandler = rotationHandler;
            this.scene.registerBeforeRender(rotationHandler);
        };
        Engine3d.prototype.stopRotate = function() {
            this.scene.unregisterBeforeRender(rotationHandler);
            this.rotationHandler = null;
        };


        Engine3d.prototype.getEmissiveMaterialRGB = function (color) {
            color = color || {};
            var scene = this.scene;

            var r = ifUndefDefault(color.r, 0);
            var g = ifUndefDefault(color.g, 0);
            var b = ifUndefDefault(color.b, 0);
            var a = ifUndefDefault(color.a, 1);

            var materialName = "mat_emis_rgba_" + r + "_" + g + "_" + b + "_" + a;
            
            var material = scene.getMaterialByName(materialName);
    
            if (material) { return material; }
            
            material = new BABYLON.StandardMaterial(materialName, scene);
            material.emissiveColor = new BABYLON.Color3(r / 255, g / 255, b / 255);
            material.disableLighting = true;
            material.alpha = a;
            
            return material;
        };


        Engine3d.prototype.setMeshMaterial = function(mesh, material) {
            var meshes = mesh.getChildMeshes();
            meshes.push(mesh);
            meshes.forEach(function(m) {
                if (m.geometry) {
                    m.material = material;
                }
            });
        };


        return Engine3d;

    })();

    
    return Engine3d;

})();