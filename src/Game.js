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
            let { position, color, firstColor, secondColor } = params;
            position = position || BABYLON.Vector3.Zero();
            firstColor = firstColor || color;
            // firstColor = firstColor || {r: 47, g: 112, b: 150, a: 0.8};
            firstColor = firstColor || {r: 255, g: 255, b: 255, a: 0.8};
            secondColor = secondColor || {r: 255, g: 255, b: 255, a: 0.8};

            this.dimension = 0.3;
            this.dimensionIncrement = 0.09;
            this.node.position = position;
            this.firstColor = firstColor;
            this.secondColor = secondColor;

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
                wave.renderingGroupId = 2;
                this.wave = wave;

                const waveMaterial = engine3d.getEmissiveMaterialRGB(this.firstColor);
                wave.material = waveMaterial;

            }


            // if (!this.wave2) {
                
            //     const wave2 = BABYLON.MeshBuilder.CreateSphere("wave2", {
            //         diameter: dimension + 0.1
            //     }, scene);
            //     wave2.parent = geometry;
            //     this.wave2 = wave2;

            //     const wave2Material = engine3d.getEmissiveMaterialRGB(this.secondColor);
            //     wave2.material = wave2Material;

            // }


            engine3d.setMeshScale(this.wave, dimension);
            // engine3d.setMeshScale(this.wave2, dimension + 0.1);

        };

        return ExplosionAnimation;

    })();
    E3D.ExplosionAnimation = ExplosionAnimation;




    const WaveEmitter = (function() {
        
        function WaveEmitter(game) {
            const _this = this;

            this.game = game;
            this.engine3d = game.engine3d;
            this.scene = this.engine3d.scene;

            this.particleSystem = null;
            this.emitter = null;

        }


        WaveEmitter.prototype.dispose = function() {
            this.particleSystem.dispose();
            this.emitter.dispose();
        };


        WaveEmitter.prototype.buildParticleSystem = function(scene, emitter) {
          
            var particleSystem = new BABYLON.ParticleSystem("wave", 2000, scene);

            //Texture 
            particleSystem.particleTexture = new BABYLON.Texture("./assets/textures/smoke.png", scene);

            // Stop duration
            particleSystem.targetStopDuration = 0.2;

            // Emitter
            particleSystem.emitter = emitter;
            var hemisphericEmitter = particleSystem.createHemisphericEmitter();
            hemisphericEmitter.radiusRange = 0;
            
            // Colors 
            particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
            particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

            // Size of each particle (random between...
            particleSystem.minSize = 0.1;
            particleSystem.maxSize = 0.1;

            // Life time range
            particleSystem.minLifeTime = 0.05;
            particleSystem.maxLifeTime = 0.15;

            // Emission rate
            particleSystem.emitRate = 1000;

            // Blend mode
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

            // Set the gravity
            particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
            // particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

            // Direction of emission
            // particleSystem.direction1 = new BABYLON.Vector3(-1, 0, -1);
            // particleSystem.direction2 = new BABYLON.Vector3(-1, 0, 1);

            // Angular speed
            particleSystem.minAngularSpeed = 0;
            particleSystem.maxAngularSpeed = 0;

            // Speed
            particleSystem.minEmitPower = 5;
            particleSystem.maxEmitPower = 5;
            particleSystem.updateSpeed = 0.016666666666666666;


            particleSystem.addColorGradient(0, 
                BABYLON.Color4.FromInts(50, 100, 255, 255), 
                BABYLON.Color4.FromInts(50, 100, 255, 255) 
            );

            particleSystem.addColorGradient(0.63, 
                BABYLON.Color4.FromInts(200, 200, 255, 255), 
                BABYLON.Color4.FromInts(200, 200, 255, 255)
            );
                
            particleSystem.addColorGradient(1, 
                BABYLON.Color4.FromInts(255, 255, 255, 255), 
                BABYLON.Color4.FromInts(255, 255, 255, 255)
            );


            particleSystem.addSizeGradient(0, 0.3, 0.4);
            particleSystem.addSizeGradient(0.91, 0.4, 0.5);
            particleSystem.addSizeGradient(1, 1, 1);
            

            // var updateFunction = function(particles) {
            //     for (var index = 0; index < particles.length; index++) {
            //         var particle = particles[index];
            //         particle.age += this._scaledUpdateSpeed;
                    
            //         if (particle.age >= particle.lifeTime) { 
            //             particles.splice(index, 1);
            //             this._stockParticles.push(particle);
            //             index--;
            //             continue;
            //         } else {
            //             particle.colorStep.scaleToRef(this._scaledUpdateSpeed, this._scaledColorStep);
            //             particle.color.addInPlace(this._scaledColorStep);
                        
            //             if (particle.color.a < 0)
            //             particle.color.a = 0;
                        
            //             particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;
                        
            //             particle.direction.scaleToRef(this._scaledUpdateSpeed, this._scaledDirection);
            //             particle.position.addInPlace(this._scaledDirection);
                        
            //             this.gravity.scaleToRef(this._scaledUpdateSpeed, this._scaledGravity);
            //             particle.direction.addInPlace(this._scaledGravity);
            //         }
            //     } 
            // };            
            // particleSystem.updateFunction = updateFunction;


            return particleSystem;

        };


        WaveEmitter.prototype.init = function(params = {}) {
            const _this = this;
            const { scene } = this;

            const emitter = new BABYLON.TransformNode("wave_emitter", scene); 
            this.emitter = emitter;

            const particleSystem = this.buildParticleSystem(scene, emitter);
            this.particleSystem = particleSystem;

            this.particleSystem.onStoppedObservable.add(() => {
                _this.dispose();
            });

        };


        WaveEmitter.prototype.start = function() {
            this.particleSystem.start();
        };


        WaveEmitter.prototype.stop = function() {
            this.particleSystem.stop();
        };


        return WaveEmitter;


    })();
    E3D.WaveEmitter = WaveEmitter;





    const GameControllerInput = (function() {
            
        function GameControllerInput(game) {

            this.game = game;

            this.engine3d = game.engine3d;
            this.scene = game.scene;

        }

        GameControllerInput.prototype.init = function() {
            const _this = this;
            const { scene } = this;

            scene.onKeyboardObservable.add((kbInfo) => {
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        _this._onKeyDown(kbInfo.event);
                        break;
                    case BABYLON.KeyboardEventTypes.KEYUP:
                        _this._onKeyUp(kbInfo.event);
                        break;
                }
            });

        };


        GameControllerInput.prototype._onKeyDown = function(event) {
            switch (event.keyCode) {
            }
        };

        GameControllerInput.prototype._onKeyUp = function(event) {
            const { game, engine3d } = this;
            // console.log("event", event);

            if (event.keyCode === 79 && event.ctrlKey && event.altKey) {
                game.toggleDebugMode();
                engine3d.canvasNode.focus();
            }

            if (event.keyCode === 49) {
                game.setActiveCamera(game.globalCamera);
            }

            if (event.keyCode === 50) {
                game.setActiveCamera(game.currentPlayer.playerCamera);
            }

        };


        return GameControllerInput;


    })();
    E3D.GameControllerInput = GameControllerInput;








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

            this.vrHelper = null;
            
        };


        Game.WORLD_SIZE = 100;
        Game.SEA_HEIGHT = 5;
        Game.SEA_COLOR = BABYLON.Color3.FromInts(47, 112, 150);
        Game.SAND_COLOR = BABYLON.Color3.FromInts(252, 221, 190);
        Game.HDR_PATH = "https://BabylonJS.github.io/Assets/environments/umhlanga_sunrise_1k.hdr";

        
        Game.prototype.getAnimations = function() {
            return this.animations;
        };
        Game.prototype.setAnimations = function(animations) {
            this.animations = animations;
        };


        return Game;
    
    })();
    
    

    /**
     * Debug
     */

    (function() {


        Game.prototype.toggleDebugMode = function(active) {
            if (active === true || active === false) {} else {
                active = !this.debug;
            }
            this.toggleDebugLayer(active);
            this.debug = active; 
        };
        

        Game.prototype.toggleDebugLayer = function(active) {
            const { scene } = this;
            if (active === true || active === false) {} else {
                active = !scene.debugLayer.isVisible();
            }
            if (active) {
                this.scene.debugLayer.show();
            } else {
                this.scene.debugLayer.hide();
            }
            
            if (document.querySelector("#scene-explorer-host")) {
                document.querySelector("#scene-explorer-host").style.zIndex = 10;
            }
            if (document.querySelector("#inspector-host")) {
                document.querySelector("#inspector-host").style.zIndex = 10;
            }
            
        };


    })();




    /**
     * Init
     */

    (function() {
        

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
                        size: Game.WORLD_SIZE,
                    });
                }


                this.addGameControllerInput();


                await this.loadSounds();
                this.soundsMap.get("ambient").play();


                await this.buildAmbient();
                

                this.initGlobalCamera();


                //##TODO
                BABYLON.SceneLoader.OnPluginActivatedObservable.add(function(plugin) {
                    if (plugin.name === "gltf" && plugin instanceof BABYLON.GLTFFileLoader) {
                        plugin.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.NONE;
                        plugin.compileMaterials = true;
                    }
                }); 
    
                
                scene.onBeforeRenderObservable.add(() => {
                    const deltaTime = scene.getEngine().getDeltaTime();
                    _this.update(deltaTime);
                });
                
    
            } catch (error) {
                throw error;
            }
        };


        Game.prototype.enableXR = async function(player) {
            const { scene, debug } = this;
            try {
                

                const vrHelper = await scene.createDefaultXRExperienceAsync({
                    floorMeshes: null,
                    disableTeleportation: true,
                });
                console.log("vrHelper", vrHelper);
                
    
                this.vrHelper = vrHelper;
                

                const webXRInput = vrHelper.input; // if using the experience helper, otherwise, an instance of WebXRInput
                // webXRInput is a WebXRInput instance
                webXRInput.onControllerAddedObservable.add( xrController => {
                    // xrController is aWebXRInputSource instance 

                    // console.log("xrController", xrController);
                    // console.log("xrController.inputSource", xrController.inputSource);
                    // console.log("xrController.inputSource.onMotionControllerInitObservable", xrController.inputSource.onMotionControllerInitObservable);
                    // console.log("xrController.motionController", xrController.motionController);


                    xrController.onMotionControllerInitObservable.add(motionController => {
                        console.log("motionController", motionController);

                        const mainComponent = motionController.getMainComponent();
                        console.log("mainComponent", mainComponent);

                        mainComponent.onAxisValueChangedObservable.add(event => {
                            console.log("event", event);
                        });
                        mainComponent.onButtonStateChangedObservable.add(event => {
                            console.log("event", event);
                        });

                        const buttonComponents = motionController.getAllComponentsOfType("button");
                        console.log("buttonComponents", buttonComponents);
                        buttonComponents[0].onButtonStateChangedObservable.add(event => {
                            console.log("event", event);
                        });

                        
                        // const thumbstick = motionController.getComponent(BABYLON.WebXRControllerComponent.THUMBSTICK);
                        // console.log("thumbstick", thumbstick);
                        // if (thumbstick) {
                        //     // Huzza! we have a thumbstick:
                        //     thumbstick.onButtonStateChanged.add(() => {
                        //         console.log("press");
                        //     });
                        //     thumbstick.onAxisValueChanged.add(() => {
                        //         console.log("move");
                        //     });
                        // }

                    });
                    
                });


                // --------------------------------------------------------------------------------------------------
                return;
                // --------------------------------------------------------------------------------------------------
                // Using WebXRExperienceHelper

                let xrHelper= null;
                try {
                    xrHelper = await BABYLON.WebXRExperienceHelper.CreateAsync(scene);
                } catch (error) {
                    console.log("error", error);
                    console.log("no XR support");
                    return;
                }

                // console.log("xrHelper", xrHelper);
                // console.log("xrHelper.camera", xrHelper.camera);
                // console.log("xrHelper.sessionManager", xrHelper.sessionManager);
                // console.log("xrHelper.featuresManager", xrHelper.featuresManager);
                
                

                
                const sessionManager = await xrHelper.enterXRAsync("immersive-vr", "local-floor" /*, optionalRenderTarget */ );
                console.log("sessionManager", sessionManager);
                await sessionManager.setReferenceSpaceTypeAsync("local");


                const xrCamera = xrHelper.camera;
                // xrCamera.parent = player.node;
                // xrCamera.position = new BABYLON.Vector3(0, 0.3, 0);

                sessionManager.onXRFrameObservable.add(()=>{
                    xrCamera.position.copyFrom(player.node.getAbsolutePosition().add(new BABYLON.Vector3(0, 0.3, 0)));
                });

                console.log("xrHelper", xrHelper);

                console.log("xrHelper.sessionManager.session.inputSources", xrHelper.sessionManager.session.inputSources);


                // await xrHelper.exitXRAsync();


            } catch (error) {
                throw error;
            }
        };


        Game.prototype.initGlobalCamera = function() {
            
            const { globalCamera } = this;

            globalCamera.setTarget(new BABYLON.Vector3(0, 0, 0));

            globalCamera.minZ = 0.003;
            globalCamera.maxZ = Game.WORLD_SIZE * 2;
            
            globalCamera.lowerBetaLimit = BABYLON.Tools.ToRadians(1);
            globalCamera.upperBetaLimit = BABYLON.Tools.ToRadians(89);
            // globalCamera.lowerAlphaLimit = BABYLON.Tools.ToRadians(0);
            // globalCamera.upperAlphaLimit = BABYLON.Tools.ToRadians(90);
            globalCamera.lowerRadiusLimit = 0.6;
            globalCamera.upperRadiusLimit = Game.WORLD_SIZE/2;

        };


        Game.prototype.addGameControllerInput = function() {
            
            var gameControllerInput = new GameControllerInput(this);
            gameControllerInput.init();
            
        };


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
                _this.players.forEach((player) => {
                    
                    // player.node.position.y = 0;
                    
                    // if (!player.physicsImpostor) {
                    //     return;
                    // }

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
                        path: "./assets/sounds/cannon2.mp3"
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
                // ##WORK cosi dovrebbe essere sbagliato ma a livello grafico funziona
                sand.material.albedoColor = new BABYLON.Color3(252, 221, 190);    
                // sand.material.albedoColor = Game.SAND_COLOR;
                
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
                // sand.material.albedoColor = new BABYLON.Color3(252, 221, 190);  
                sand.material.albedoColor = Game.SAND_COLOR;    
                
                
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
                //     width: Game.WORLD_SIZE * 2,
                //     height: Game.WORLD_SIZE * 2,
                // }, this.scene);
                // groundMesh.parent = ground;
                // groundMesh.position = new BABYLON.Vector3(0, -Game.SEA_HEIGHT, 0);
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
                //-----------------------------------
                // const groundMaterial = new BABYLON.StandardMaterial("sea", scene);
                // groundMaterial.albedoColor = Game.SAND_COLOR;    
                // groundMaterial.alpha = 1;
                // groundMesh.material = groundMaterial;
                //-----------------------------------

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
            const { Player } = E3D;
            const { scene, debug, physicsViewer } = this;
            try {
                
                const position = params.position || new BABYLON.Vector3(0, 0, 0);
                
                const player = new Player(this, {
                    name: params.name,
                });
                await player.init();
                
                player.setPosition(position);
    
                this.players.push(player);
    
                return player;
                
            } catch (error) {
                throw error;
            }
        };  


        Game.prototype.addEnermy = async function(params = {}) {
            const { Player } = E3D;
            const { scene, debug, physicsViewer } = this;
            try {
                
                const position = params.position || new BABYLON.Vector3(0, 0, 0);
                const name = params.name || "enermy";

                var enermy = await this.addPlayer({
                    name: name,
                });
                enermy.setPosition(position);
                enermy.setColor({g: 50, b: 255});
                this.addPlayerAI(enermy);

                return enermy;

            } catch (error) {
                throw error;
            }
        }; 
        Game.prototype.addEnermies = async function(params = {}) {
            const { Player } = E3D;
            const { scene, debug, physicsViewer } = this;
            try {
                
                const num = params.num || 2;

                let x = 0;
                let z = 0;
                for (let i = 0; i < num; i++) {
                    x = Math.sign((Math.random() - 0.5)) * (5 + Math.random() * 5);
                    z = Math.sign((Math.random() - 0.5)) * (5 + Math.random() * 5);
                    this.addEnermy({
                        name: "enermy" + i,
                        position: new BABYLON.Vector3(x, 0, z),
                    });                    
                }
                
            } catch (error) {
                throw error;
            }
        }; 




        Game.prototype.isTouchDevice = function() {
            return window.ontouchstart !== undefined;
        }

        
        Game.prototype.addPlayerControllerInput = function(player) {
            
            const { PlayerControllerInput } = E3D;
            const { scene, debug } = this;
            
            var playerControllerInput = new PlayerControllerInput(engine3d);
            playerControllerInput.initKeyboardInput();

            
            // playerControllerInput.initVirtualJoystickInput();
            if(this.isTouchDevice()) {
                playerControllerInput.initVirtualJoystickInput();
            }
            
            player._input = playerControllerInput;
            
        }


        Game.prototype.addPlayerAI = function(player) {
            
            const { PlayerAI } = E3D;
            const { scene, debug } = this;
            
            const playerAI = new PlayerAI();
            playerAI.init(player);

            playerAI.start();

        }


    })();
    







    /**
     * Update
     */

    (function() {
        

        Game.prototype.update = function(deltaTime) {
            const _this = this;
            const { game, engine3d, scene, geometry, node } = this;

            _this.animations.forEach(anim => anim.update(deltaTime));

            
            _this.getPlayers().forEach(player => {

                if (player.node.position.length() > Game.WORLD_SIZE/2) {
                    player.node.position = new BABYLON.Vector3(0, 0, 0);
                }
                player.update(deltaTime);

                player.cannon.update(deltaTime);

                player.cannon.getBalls().forEach(ball => {
                    ball.update(deltaTime);
                });

            });
    
            
            _this.getPlayers().forEach(player => {
                _this.getOtherPlayersCannonBalls(player).forEach(ball => {

                    player.bbMesh.computeWorldMatrix(true);
                    ball.bbMesh.computeWorldMatrix(true);

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
                        _this.playBombSound();
                        if (player.life <= 0) {
                            player.kill();
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

