

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


