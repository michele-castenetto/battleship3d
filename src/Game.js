


var Game = (function() {
    
    function Game(engine3d) {
        
        this.engine3d = engine3d;
        this.scene = engine3d.scene;

        this.debug = true;

        this.soundsMap = new Map();

        this.ambient = null;

        this.worldSize = 20;

    };


    Game.prototype.init = function() {
        
    };


    Game.prototype.getActiveCamera = function() {
        return this.scene.activeCamera;
    };


    const loadSound = (scene, path, soundName) => {
        return new Promise(function(resolve, reject) {
            var sound = new BABYLON.Sound(soundName || "", path, scene, () => {
                resolve(sound);
            }, { 
                loop: false,
                // autoplay: true, 
                // spatialSound: true, 
                // maxDistance: 25 
            });
        });  
    };
    

    //##REF
    // var music1 = new BABYLON.Sound("sottofondo", "./assets/sounds/drunken_sailor.mp3", scene, null, { 
    //     loop: true, 
    //     autoplay: true, 
    //     // spatialSound: true, 
    //     // maxDistance: 25 
    // });
    // // music1.setPosition(new BABYLON.Vector3(60, 0, 0));
    // music1.setVolume(0.1);

    Game.prototype.loadSounds = async function() {
        var _this = this;
        try {
            
            var soundsToLoad = [
                {
                    id: "music",
                    path: "./assets/sounds/drunken_sailor.mp3"
                },
                {
                    id: "ambient",
                    path: "./assets/sounds/pirate_ship_at_bay.mp3"
                },
                {
                    id: "cannon",
                    path: "./assets/sounds/cannon.mp3"
                },
                {
                    id: "splash",
                    path: "./assets/sounds/splash.mp3"
                },
            ];

            const toLoad = soundsToLoad.map(async soundInfo => {
                const sound = await loadSound(_this.scene, soundInfo.path, soundInfo.id);
                _this.soundsMap.set(soundInfo.id, sound);
            });

            await Promise.all(toLoad);

        } catch (error) {
            console.log(error);
        }
    };

    
            
    





    return Game;

})();



/**
 * Ambient
 */

(function() {
    

    Game.prototype.buildAmbient = function() {
        
        const { scene, worldSize, debug } = this;

        const SEA_HEIGHT = 5;

        const ambient = new BABYLON.TransformNode("ambient", this.scene);
        this.ambient = ambient;

        
        if (debug) {
            var cartesianAxis = new CartesianAxis(this.scene, "");
            
            cartesianAxis.update({
                size: worldSize,
            });
        }


        const ground = new BABYLON.TransformNode("ground", this.scene);
        ground.parent = ambient;

        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground_mesh", {
            width: worldSize,
            height: worldSize,
        }, this.scene);
        groundMesh.parent = ground;
        groundMesh.position = new BABYLON.Vector3(worldSize/2, -SEA_HEIGHT, worldSize/2);



        const sea = new BABYLON.TransformNode("sea", this.scene);
        sea.parent = ambient;

        const seaMesh = BABYLON.MeshBuilder.CreateBox("ground_mesh", {
            width: worldSize,
            height: SEA_HEIGHT,
            depth: worldSize
        }, this.scene);
        seaMesh.parent = sea;
        seaMesh.position = new BABYLON.Vector3(worldSize/2, -SEA_HEIGHT/2, worldSize/2);

        const seaMaterial = new BABYLON.StandardMaterial("sea", this.scene);

        seaMaterial.diffuseColor  = new BABYLON.Color3(0, 0.3, 0.9);
        seaMaterial.alpha = 0.7;

        seaMesh.material = seaMaterial;


        const camera = this.getActiveCamera();
        camera.setTarget(new BABYLON.Vector3(worldSize/2, 0, worldSize/2));


    };


})();









