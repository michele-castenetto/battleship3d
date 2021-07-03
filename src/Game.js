var E3D = E3D || {};
(function(E3D) {
    




    const ExplosionAnimation = (function() {
        
        function ExplosionAnimation(game) {
            const _this = this;

            this.game = game;
            this.engine3d = game.engine3d;
            this.scene = this.engine3d.scene;

            const node = new BABYLON.TransformNode("water_anim", this.scene);
            this.node = node;

            const geometry = new BABYLON.TransformNode("geometry", this.scene);
            geometry.parent = node;
            this.geometry = geometry;

            this.wave = null;
            this.dimension = 0;
            this.dimensionIncrement = 0;

        }


        ExplosionAnimation.prototype.dispose = function() {
            const _this = this;
            const { game } = this;
            game.setAnimations(game.getAnimations().filter(anim => anim !== _this));
            this.node.dispose();
        };


        ExplosionAnimation.prototype.init = function(params = {}) {
            let { position, color } = params;
            position = position || BABYLON.Vector3.Zero();
            color = color || {r: 47, g: 112, b: 150, a: 0.3};

            this.dimension = 0.3;
            this.dimensionIncrement = 0.09;
            this.node.position = position;
            this.color = color;

            this.updateGeometry();

        };


        ExplosionAnimation.prototype.update = function() {
            
            this.dimension += this.dimensionIncrement;

            if (this.dimension >= 3) {
                this.dimensionIncrement = -0.09;
            }
            
            this.updateGeometry();

            if (this.dimensionIncrement < 0 && this.dimension <= 2.5) {
                this.dispose();
            }

        };


        ExplosionAnimation.prototype.updateGeometry = function() {
            
            const { game, engine3d, scene, geometry, node } = this;
            const { dimension } = this;

            if (!this.wave) {
                const wave = BABYLON.MeshBuilder.CreateSphere("wave", {
                    diameter: dimension
                }, scene);
                wave.parent = geometry;
                this.wave = wave;

                const waveMaterial = engine3d.getEmissiveMaterialRGB(this.color);
                wave.material = waveMaterial;

            }

            engine3d.setMeshScale(this.wave, dimension);

        };

        return ExplosionAnimation;

    })();


    E3D.ExplosionAnimation = ExplosionAnimation;


    



    var Game = (function() {

        function Game(engine3d) {
            const _this = this;
            
            this.engine3d = engine3d;
            this.scene = engine3d.scene;
    
            this.debug = false;
    
            this.soundsMap = new Map();
    
            this.ambient = null;
            this.waterMaterial = null;
    
            this.players = [];
            this.animations = [];
    
            this.currentPlayer = null;
    
            this.globalCamera = this.scene.activeCamera;
            
        };


        Game.WORLD_SIZE = 100;
        Game.SEA_HEIGHT = 5;
        Game.SEA_COLOR = BABYLON.Color3.FromInts(47, 112, 150);
        Game.HDR_PATH = "https://BabylonJS.github.io/Assets/environments/umhlanga_sunrise_1k.hdr";

        
        Game.prototype.init = async function() {
            const { CartesianAxis } = E3D;
            const _this = this;
            const { scene, debug } = this;
            try {
             
                
                // this.enablePhysics();
    
                // await this.loadAssets();
                
                if (debug) {
                    scene.debugLayer.show();   
                }

                if (debug) {
                    var cartesianAxis = new CartesianAxis(scene, "");    
                    cartesianAxis.update({
                        size: WORLD_SIZE,
                    });
                }


                await this.loadSounds();
                this.soundsMap.get("ambient").play();


                await this.buildAmbient();
                

                //##TODO
                BABYLON.SceneLoader.OnPluginActivatedObservable.add(function(plugin) {
                    if (plugin.name === "gltf" && plugin instanceof BABYLON.GLTFFileLoader) {
                        plugin.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.NONE;
                        plugin.compileMaterials = true;
                    }
                }); 
    
                
                scene.onBeforeRenderObservable.add(() => {
                    _this.update();
                });
                
    
            } catch (error) {
                throw error;
            }
        };
        

        Game.prototype.getAnimations = function() {
            return this.animations;
        };
        Game.prototype.setAnimations = function(animations) {
            this.animations = animations;
        };


        return Game;
    
    })();
    
    
    
    
    /**
     * Cameras
     */
    
    
    (function() {
    
        
        Game.prototype.getActiveCamera = function() {
            return this.scene.activeCamera;
        };
        Game.prototype.setActiveCamera = function(camera) {
            const { engine3d, scene, debug } = this;
            const { canvasNode : canvas } = engine3d;

            scene.activeCamera.detachControl(canvas);
            
            scene.activeCamera = camera;
            scene.activeCamera.attachControl(canvas, true);

        };
    
            
    })();
    
    
    
    
    
    /**
     * Physics
     */
    
    (function() {
        
    
        Game.prototype.enablePhysics = function() {
            const _this = this;
            const { scene, debug } = this;
    
            var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
            var physicsPlugin = new BABYLON.CannonJSPlugin();
            // var physicsPlugin = new BABYLON.OimoJSPlugin();
            scene.enablePhysics(gravityVector, physicsPlugin);
    
    
            this.physicsEngine = scene.getPhysicsEngine();
    
    
            var physicsViewer = new BABYLON.Debug.PhysicsViewer();
            this.physicsViewer = physicsViewer;
    
            
            const gravity = scene.getPhysicsEngine().gravity.negate();
            
    
            scene.onBeforeRenderObservable.add(() => {
                _this.players.forEach(function(player) {
                    player.node.position.y = 0;
                    if (!player.physicsImpostor) {
                        return;
                    }
                    // _this.applyForceToCenter(player.physicsImpostor, gravity.scale(player.physicsImpostor.mass));
                });
            });
    
    
        };
    
    
        Game.prototype.applyForceToCenter = function(physicsImpostor, force) {
            
            const position = physicsImpostor.getObjectCenter();
            physicsImpostor.applyForce(force, position);
            
        };
    
    
    
    
    })();
    
    
    
    
    
    /**
     * Sounds
     */
    
    (function() {
        
    
        const loadSound = (scene, id, path, options = {}) => {
            return new Promise(function(resolve, reject) {
                var sound = new BABYLON.Sound(id || "", path, scene, () => {
                    resolve(sound);
                }, { 
                    loop: options.loop || false,
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
            const { engine3d, scene } = this;
            try {
                
                var soundsToLoad = [
                    {
                        id: "music",
                        path: "./assets/sounds/drunken_sailor.mp3",
                        options: {
                            loop: true
                        }
                    },
                    {
                        id: "ambient",
                        path: "./assets/sounds/pirate_ship_at_bay.mp3",
                        options: {
                            loop: true
                        }
                    },
                    {
                        id: "cannon",
                        path: "./assets/sounds/cannon.mp3"
                    },
                    {
                        id: "splash",
                        path: "./assets/sounds/splash.mp3"
                    },
                    {
                        id: "bomb",
                        path: "./assets/sounds/bomb.mp3"
                    },
                ];
    
                const toLoad = soundsToLoad.map(async soundInfo => {
                    const sound = await loadSound(scene, soundInfo.id, soundInfo.path, soundInfo.options);
                    _this.soundsMap.set(soundInfo.id, sound);
                });
    
                await Promise.all(toLoad);
    
            } catch (error) {
                console.log(error);
            }
        };


        Game.prototype.playCannonSound = function() {
            this.soundsMap.get("cannon").play();
        };

        Game.prototype.playSplashSound = function() {
            this.soundsMap.get("splash").play();
        };

        Game.prototype.playBombSound = function() {
            this.soundsMap.get("bomb").play();
        };
    
    
    })();
    
    
    
    
    /**
     * Ambient
     */
    
    (function() {
    
    
        Game.prototype.loadAssets = async function() {
            const { engine3d, scene } = this;
            try {
                
    
                const geometryAssets = [
                    {
                        id: "island1",
                        path: "./assets/meshes/island1.glb",
                        scale: 0.1,
                    },
                    {
                        id: "island3",
                        path: "./assets/meshes/island3.glb",
                        scale: 0.1,
                    },
                    {
                        id: "island_empty",
                        path: "./assets/meshes/island_empty.glb",
                        scale: 0.1,
                    }
    
                ];
    
                const todo = geometryAssets.map(function(asset) {
                    return engine3d.loadGLBGeometry({
                        id: asset.id,
                        filepath: asset.path,
                        scale: asset.scale,
                        position: asset.position,
                        rotations: asset.rotations,
                    })
                })
    
                Promise.all(todo);
    
            } catch (error) {
                throw error;
            }
        }
    

        Game.prototype.loadIslandType1 = async function() {
            const { engine3d, scene, ambient } = this;
            try {
             
                let island = await engine3d.loadGLBGeometry({
                    id: "island1",
                    filepath: "./assets/meshes/island1.glb",
                    scale: 0.05,
                });
                const [root, node0] = island.getChildMeshes();
                root.dispose();
                island.parent = ambient;
                engine3d.showMesh(island);
    
                return island;

            } catch (error) {
                throw error;
            }
        };


        Game.prototype.loadIslandType2 = async function() {
            const { engine3d, scene, ambient } = this;
            try {
                
                const island = await engine3d.loadGLBGeometry({
                    id: "island2",
                    filepath: "./assets/meshes/island2.glb",
                    scale: 5,
                });
                const [ root, sand ] = island.getChildMeshes();
                root.dispose();
                sand.material.albedoColor = new BABYLON.Color3(252, 221, 190);    
                
                island.parent = ambient;
                engine3d.showMesh(island);

                let palmtree = null;

                palmtree = await engine3d.loadGLBGeometry({
                    id: "palmtree1",
                    filepath: "./assets/meshes/palmtree1.glb",
                    scale: 1,
                });
                palmtree.parent = island;
                palmtree.position = new BABYLON.Vector3(0.7, 0, 1);
                palmtree.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(180), BABYLON.Space.LOCAL);
                engine3d.showMesh(palmtree);

                palmtree = await engine3d.loadGLBGeometry({
                    id: "palmtree2",
                    filepath: "./assets/meshes/palmtree2.glb",
                    scale: 1,
                });
                palmtree.parent = island;
                palmtree.position = new BABYLON.Vector3(0.2, 0, 0.5);
                engine3d.showMesh(palmtree);


                return island;

            } catch (error) {
                throw error;
            }
        };


        Game.prototype.loadIslandType3 = async function() {
            const { engine3d, scene, ambient } = this;
            try {
                
                const island = await engine3d.loadGLBGeometry({
                    id: "island3",
                    filepath: "./assets/meshes/island3.glb",
                    scale: 0.1,
                });
                const [ root, n0, n1, sand ] = island.getChildMeshes();
                root.dispose();
                n0.dispose();
                n1.dispose();
                sand.material.albedoColor = new BABYLON.Color3(252, 221, 190);    
                
                island.parent = ambient;
                engine3d.showMesh(island);

                return island;

            } catch (error) {
                throw error;
            }
        };


        Game.prototype.buildIslands = async function() {
            const { engine3d, scene } = this;
            try {
                
                let island = null;


                island = await this.loadIslandType1();
                island.rotation.y = BABYLON.Tools.ToRadians(45);
                island.position = new BABYLON.Vector3(5, -0.05, 40);
                
                island = await this.loadIslandType1();
                island.position = new BABYLON.Vector3(15, -0.05, -40);

                island = await this.loadIslandType1();
                island.position = new BABYLON.Vector3(-7, -0.05, 3);
                
                island = await this.loadIslandType2();
                island.position = new BABYLON.Vector3(7, 0, 10);

                island = await this.loadIslandType3();
                island.position = new BABYLON.Vector3(-10, 0, -30);

                island = await this.loadIslandType3();
                island.rotation.y = BABYLON.Tools.ToRadians(90);
                island.position = new BABYLON.Vector3(45, 0, 20);

    
                // const islandEmptyMesh = await engine3d.loadGLBGeometry({
                //     id: "island",
                //     filepath: "./assets/meshes/island.glb",
                //     scale: 10,
                // });
                // islandEmptyMesh.position = new BABYLON.Vector3(-10, 0, -5);
                // engine3d.showMesh(islandEmptyMesh);
    
                
    
            } catch (error) {
                throw error;
            }
        }
    
    
        Game.prototype.buildAmbient = async function() {
            const { scene, debug } = this;    
            try {
                
                const ambient = new BABYLON.TransformNode("ambient", this.scene);
                this.ambient = ambient;
        
        
                const reflectionTexture = new BABYLON.HDRCubeTexture(Game.HDR_PATH, scene, 128, false, true, false, true);
                this.reflectionTexture = reflectionTexture;
                scene.environmentTexture = reflectionTexture;
        
        
                /**
                 * Skybox
                 */
                

                // var skybox = BABYLON.Mesh.CreateBox("BackgroundSkybox", Game.WORLD_SIZE, scene, undefined, BABYLON.Mesh.BACKSIDE);
                var skybox = BABYLON.MeshBuilder.CreateSphere("BackgroundSkybox", {
                    diameter: Game.WORLD_SIZE,
                    sideOrientation: BABYLON.Mesh.BACKSIDE,
                }, scene);
                skybox.parent = ambient;

                var backgroundMaterial = new BABYLON.BackgroundMaterial("backgroundMaterial", scene);
                backgroundMaterial.reflectionTexture = new BABYLON.CubeTexture("./assets/textures/tropical/tropical", scene);
                backgroundMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
                backgroundMaterial.disableLighting = true;

                skybox.material = backgroundMaterial;
                
        
                
                /**
                 * Fog
                 */
        
                
                // scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
                BABYLON.Scene.FOGMODE_NONE;
                //BABYLON.Scene.FOGMODE_EXP;
                //BABYLON.Scene.FOGMODE_EXP2;
                //BABYLON.Scene.FOGMODE_LINEAR;
        
                scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.9);
                scene.fogDensity = 0.01;
        
                //Only if LINEAR
                //scene.fogStart = 20.0;
                //scene.fogEnd = 60.0;
        
        
                /**
                 * Ground
                 */
        
        
                const ground = new BABYLON.TransformNode("ground", this.scene);
                ground.parent = ambient;
        
                
                //-----------------------------------
                // const groundMesh = BABYLON.MeshBuilder.CreateGround("ground_mesh", {
                //     width: Game.WORLD_SIZE,
                //     height: Game.WORLD_SIZE,
                // }, this.scene);
                // groundMesh.parent = ground;
                // groundMesh.position = new BABYLON.Vector3(0, -SEA_HEIGHT, 0);
                //-----------------------------------
                // const groundMesh = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground_mesh", "./assets/textures/heightMap.png", {
                //     width: Game.WORLD_SIZE,
                //     height: Game.WORLD_SIZE,
                //     subdivisions: Game.WORLD_SIZE,
                //     minHeight: 0,
                //     maxHeight: 7,
                // }, scene);
                // groundMesh.parent = ground;
                // groundMesh.position = new BABYLON.Vector3(0, -SEA_HEIGHT, 0);
        
        
                // ##OLD
                // groundMesh.physicsImpostor = new BABYLON.PhysicsImpostor(groundMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
        
        
        
                /**
                 * Sea
                 */
        
                const sea = new BABYLON.TransformNode("sea", this.scene);
                sea.parent = ambient;
                
    
    
                //-----------------------------------
                // const seaMesh = BABYLON.MeshBuilder.CreateBox("sea_mesh", {
                //     width: Game.WORLD_SIZE,
                //     height: Game.SEA_HEIGHT,
                //     depth: Game.WORLD_SIZE
                // }, scene);
                // seaMesh.parent = sea;
                // seaMesh.position = new BABYLON.Vector3(0, -SEA_HEIGHT/2, 0);
                //-----------------------------------
                const seaMesh = BABYLON.MeshBuilder.CreateGround("sea_mesh", {
                    width: Game.WORLD_SIZE,
                    height: Game.WORLD_SIZE,
                    subdivisions: 32,
                }, scene);
                seaMesh.parent = sea;
                //-----------------------------------
                const seaMaterial = new BABYLON.StandardMaterial("sea", scene);
                seaMaterial.diffuseColor  = Game.SEA_COLOR;
                seaMaterial.alpha = 0.3;
                seaMesh.material = seaMaterial;
                //-----------------------------------
    
    
    
                
    
    
                //-----------------------------------
                const waterMesh = BABYLON.MeshBuilder.CreateGround("water_mesh", {
                    width: Game.WORLD_SIZE,
                    height: Game.WORLD_SIZE,
                    subdivisions: 32,
                }, scene);
                waterMesh.parent = sea;
                // waterMesh.position.addInPlace(new BABYLON.Vector3(0, -3, 0));
                waterMesh.position.addInPlace(new BABYLON.Vector3(0, -0.5, 0));
                //-----------------------------------
                //##REF https://doc.babylonjs.com/toolsAndResources/assetLibraries/materialsLibrary/waterMat
                const waterMaterial = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1024, 1024));
                waterMaterial.backFaceCulling = true;
                waterMaterial.bumpTexture = new BABYLON.Texture("./assets/textures/waterbump.png", scene);
                // waterMaterial.windForce = -5;
                waterMaterial.windForce = -1;
                // waterMaterial.waveHeight = 0.5;
                waterMaterial.waveHeight = 0.1;
                // waterMaterial.bumpHeight = 0.1;
                waterMaterial.bumpHeight = 0.5;
                waterMaterial.waveLength = 0.1;
                waterMaterial.colorBlendFactor = 0;
                waterMaterial.addToRenderList(skybox);
                waterMaterial.alpha = 0.3;
                // waterMaterial.addToRenderList(groundMesh);
                // waterMaterial.addToRenderList(seaMesh);
                this.waterMaterial = waterMaterial;
                waterMesh.material = waterMaterial;
                //-----------------------------------
        
        
                await this.buildIslands();
        
        
                const camera = this.getActiveCamera();
                camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    
    
            } catch (error) {
                throw error;
            }
        };
    
    
    })();
    
    
    
    
    /**
     * Player
     */
    
    (function() {
        

        Game.prototype.getPlayers = function() {
            return this.players;
        }
        Game.prototype.setPlayers = function(players) {
            this.players = players;
        }

    
        Game.prototype.setCurrentPlayer = function(player) {
            this.currentPlayer = player;
        }
        

        Game.prototype.addPlayer = async function(params = {}) {
            try {
    
                const { Player } = E3D;

                const { scene, debug, physicsViewer } = this;
    
                const position = params.position || new BABYLON.Vector3(0, 0, 0);
                
                const player = new Player(this);
                await player.init();
                
                player.setPosition(position);   
    
                this.players.push(player);
    
                return player;
    
                
            } catch (error) {
                throw error;
            }
        };  

        
        // ##OLD
        Game.prototype.addPlayerController__OLD = function(player) {
            
            const { scene } = this;
            
            scene.onKeyboardObservable.add((kbInfo) => {
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        // const { currentPlayer: player } = this;
                    
                        switch (kbInfo.event.key) {
                            case "a":
                            case "A":
                                player.rotateRight();
                                break;
                            case "d":
                            case "D":
                                player.rotateLeft();
                            break;
                            case "w":
                            case "W":
                                player.speedUp();
                            break;
                            case "s":
                            case "S":
                                player.speedDown();
                            break;
                        }
                    break;
                }
            });
    
    
        }
        Game.prototype.addPlayerControllerInput = function(player) {
            
            const { PlayerControllerInput } = E3D;
            const { scene } = this;
            
            var playerControllerInput = new PlayerControllerInput(engine3d);
            playerControllerInput.init();
    
            player._input = playerControllerInput;
            
        }
    
    
    })();
    







    /**
     * Update
     */

    (function() {
        

        Game.prototype.update = function() {
            const _this = this;
            const { game, engine3d, scene, geometry, node } = this;


            _this.animations.forEach(anim => anim.update());


            _this.getPlayers().forEach(player => {

                if (player.node.position.length() > Game.WORLD_SIZE/2) {
                    player.node.position = new BABYLON.Vector3(0, 0, 0);
                }
                player.update();

                player.cannon.update();

                player.cannon.getBalls().forEach(ball => {
                    ball.update();
                });

            });
    
            
            _this.getPlayers().forEach(player => {

                _this.getOtherPlayersCannonBalls(player).forEach(ball => {
                    const intersection = player.bbMesh.intersectsMesh(ball.bbMesh, true);
                    if(intersection) {
                        // player.bbMesh.material = engine3d.getEmissiveMaterialRGB({g:255, a: 0.2});
                        ball.dispose();
                        player.updateLife(player.life - 20);
                        const explosionAnimation = new ExplosionAnimation(_this);
                        explosionAnimation.init({
                            position: ball.node.position.clone(),
                            color: { r: 255, g: 100, b: 50, a: 0.5 }
                        });
                        _this.animations.push(explosionAnimation);
                        if (player.life <= 0) {
                            player.dispose();
                        }
                    } else {
                        // player.bbMesh.material = engine3d.getBBMaterial();
                    }
                });
            });

        }


        Game.prototype.getOtherPlayersCannonBalls = function(excludePlayer) {
            
            let cannonBalls = [];

            this.getPlayers()
            .filter(player => player !== excludePlayer)
            .forEach(player => {
                player.cannon.getBalls().forEach(ball => {
                    cannonBalls.push(ball);
                });
            });

            return cannonBalls;

        }


    })();





    E3D.Game = Game;



    
})(E3D);

