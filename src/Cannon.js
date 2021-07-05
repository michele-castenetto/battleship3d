

var E3D = E3D || {};
(function(E3D) {



    const SHOOTING_INTERVAL = 1000;


    // ##REF
    // https://playground.babylonjs.com/#C21DGD#2

    const CannonSmokeEmitter = (function() {

        function CannonSmokeEmitter(game) {
            const _this = this;

            this.game = game;
            this.engine3d = game.engine3d;
            this.scene = this.engine3d.scene;

            this.particleSystem = null;
            this.emitter = null;
        }


        CannonSmokeEmitter.prototype.buildParticleSystem = async function(scene, emitter) {
            try {
                
                var particleSystem = new BABYLON.ParticleSystem("smoke", 10000, scene);
                
                const radius = 0.1;
                const angle = BABYLON.Tools.ToRadians(45);
                
                particleSystem.createConeEmitter(radius, angle);

                //Texture of each particle
                particleSystem.particleTexture = new BABYLON.Texture("./assets/textures/smoke.png", scene);
                
                particleSystem.targetStopDuration = 0.2;

                particleSystem.noiseStrength = new BABYLON.Vector3(10, 10, 10);

                particleSystem.emitter = emitter;

                particleSystem.color1 = new BABYLON.Color4.FromInts(139, 139, 139, 255);
                particleSystem.color2 = new BABYLON.Color4.FromInts(179, 179, 179, 255);
                particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
                
                particleSystem.minSize = 0.1;
                particleSystem.maxSize = 0.1;
                
                particleSystem.minLifeTime = 0.05;
                particleSystem.maxLifeTime = 0.15;
                
                particleSystem.emitRate = 1000;
                
                particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
                
                particleSystem.gravity = BABYLON.Vector3.Zero();
                
                particleSystem.minAngularSpeed = 0;
                particleSystem.maxAngularSpeed = 0;
    
                particleSystem.minEmitPower = 5;
                particleSystem.maxEmitPower = 5;
                particleSystem.updateSpeed = 0.016666666666666666;


                particleSystem.addColorGradient(0, 
                    BABYLON.Color4.FromInts(184, 109, 37, 255), 
                    BABYLON.Color4.FromInts(165, 165, 67, 255)
                );

                particleSystem.addColorGradient(0.63, 
                    BABYLON.Color4.FromInts(90, 90, 90, 255), 
                    BABYLON.Color4.FromInts(100, 100, 100, 255)
                );
                    
                particleSystem.addColorGradient(1, 
                    BABYLON.Color4.FromInts(53, 53, 53, 255), 
                    BABYLON.Color4.FromInts(68, 68, 68, 255)
                );


                particleSystem.addSizeGradient(0, 0.3, 0.4);
                particleSystem.addSizeGradient(0.91, 0.4, 0.5);
                particleSystem.addSizeGradient(1, 1, 1);
                
                return particleSystem;

            } catch (error) {
                throw error;
            }
        };



        CannonSmokeEmitter.prototype.init = async function() {
            const { scene } = this;
            try {
             
                const emitter = new BABYLON.TransformNode("cannon_emitter", scene); 
                this.emitter = emitter;
    
                const particleSystem = await this.buildParticleSystem(scene, emitter);
                particleSystem.stop();
                this.particleSystem = particleSystem;

            } catch (error) {
                throw error;
            }
        };


        CannonSmokeEmitter.prototype.start = function() {
            this.particleSystem.start();
        };


        CannonSmokeEmitter.prototype.stop = function() {
            this.particleSystem.stop();
        };



        return CannonSmokeEmitter;

    })();
    E3D.CannonSmokeEmitter = CannonSmokeEmitter;






    const CannonBall = (function() {

        function CannonBall(game, cannon) {
            const _this = this;

            this.game = game;
            this.engine3d = game.engine3d;
            this.scene = this.engine3d.scene;
            
            const node = new BABYLON.TransformNode("cannonBall", this.scene);
            this.node = node;

            const geometry = new BABYLON.TransformNode("geometry", this.scene);
            geometry.parent = node;
            this.geometry = geometry;

            this.size = null;

            // ----------------------------------------------

            this.cannon = cannon;

            this._direction = null;
            this._velocity = 0.07;

            this.inWater = false;

        }


        CannonBall.ballMeshCached = null;


        CannonBall.prototype.dispose = function() {
            const _this = this;
            const { cannon } = this;
            this.node.dispose();
            cannon.setBalls(cannon.getBalls().filter(ball => ball !== _this));
        };


        CannonBall.prototype.getPosition = function() {
            return this.node.getAbsolutePosition();  
        };
        CannonBall.prototype.setPosition = function(position) {
            this.node.position = position;  
        };


        CannonBall.prototype.getDirection = function() {
            return this._direction;  
        };
        CannonBall.prototype.setDirection = function(direction) {
            this._direction = direction;  
        };

        CannonBall.prototype.getVelocity = function() {
            return this._velocity;  
        };
        CannonBall.prototype.setVelocity = function(velocity) {
            this._velocity = velocity;  
        };


        CannonBall.prototype.buildGeometry = async function() {
            const { game, engine3d, scene, geometry, node } = this;
            try {

                if (!CannonBall.ballMeshCached) {

                    const ballMeshCached = BABYLON.MeshBuilder.CreateSphere("ball", {
                        diameter: 0.1
                    }, scene);
                    ballMeshCached.isVisible = false;

                    CannonBall.ballMeshCached = ballMeshCached;
                }

                const ballMesh = CannonBall.ballMeshCached.clone();
                ballMesh.isVisible = true;
                ballMesh.id = "ball";
                ballMesh.name = "ball";

                ballMesh.parent = geometry;

                // const material = new BABYLON.PBRMaterial("ball", scene);
                // material.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                // material.roughness = 0.4;
                const material = engine3d.getPBRMaterialRGB({r: 10, g: 10, b: 10}, 0.4, 1);
                ballMesh.material = material;

                var size = engine3d.getMeshSize(ballMesh);
                this.size = size;


                // bbMesh
                var bbGeometry = engine3d.createBoxGeometry({
                    width: size.x,
                    height: size.y,
                    depth: size.z,
                });
                var bbMesh = engine3d.createMesh("bb", bbGeometry);
                bbMesh.isVisible = false;
                bbMesh.parent = node;
                bbMesh.material = engine3d.getBBMaterial();
                bbMesh.position = new BABYLON.Vector3(-size.x / 2, -size.y / 2, -size.z / 2);
                this.bbMesh = bbMesh;


            } catch (error) {
                throw error;
            }
        };


        CannonBall.prototype.init = async function() {
            const { game, engine3d, node } = this;
            try {
                
                await this.buildGeometry();

                //##DEBUG
                // this.bbMesh.isVisible = true;

            } catch (error) {
                throw error;
            }
        };


        CannonBall.prototype.update = function() {
            const { ExplosionAnimation, WaveEmitter } = E3D;
            const { game, engine3d, geometry, node } = this;

            const AIR_LIMIT = -0.1;
            const DISPOSE_LIMIT = -2;

            let velocityVector = this._direction.scale(this._velocity);
            

            // in the air
            if (this.node.position.y >= AIR_LIMIT) {
                velocityVector.addInPlace(new BABYLON.Vector3(0, - 9.81 * 0.0001, 0)); 
            }

            // in the water
            if (this.node.position.y < AIR_LIMIT) {
                if (!this.inWater) {
                    game.playSplashSound();
                    velocityVector.scaleInPlace(0.05);

                    const explosionAnimation = new ExplosionAnimation(game);
                    explosionAnimation.init({
                        position: node.position.clone(),
                        // color: { r: 47, g: 112, b: 150, a: 0.8 }
                        color: { r: 255, g: 255, b: 255, a: 0.5 }
                    });
                    game.animations.push(explosionAnimation);

                    // const waveEmitter = new WaveEmitter(game);
                    // waveEmitter.init();
                    // waveEmitter.emitter.position = node.position.clone();
                    // waveEmitter.start();

                }
                this.inWater = true;
            }
            if (this.node.position.y < DISPOSE_LIMIT) {
                velocityVector = BABYLON.Vector3.Zero();
                this.dispose();
            }
            
            this.node.position.addInPlace(velocityVector);

            this._velocity = velocityVector.length();
            this._direction = velocityVector.normalize();

        };


        return CannonBall;

    })();
    E3D.CannonBall = CannonBall;






    const Cannon = (function() {
        

        function Cannon(game) {
            const _this = this;

            this.game = game;
            this.engine3d = game.engine3d;
            this.scene = this.engine3d.scene;

            const node = new BABYLON.TransformNode("cannon", this.scene);
            this.node = node;

            const geometry = new BABYLON.TransformNode("geometry", this.scene);
            geometry.parent = node;
            this.geometry = geometry;

            // ---------------------------

            this._direction = null;
            this.isShooting = false;

            this._balls = [];

            this.cannonSmokeEmitter = null;

        }


        Cannon.prototype.getPosition = function() {
            return this.node.getAbsolutePosition();  
        };
        Cannon.prototype.setPosition = function(position) {
            this.node.position = position;  
        };


        Cannon.prototype.getDirection = function() {
            return this._direction;  
        };
        Cannon.prototype.setDirection = function(direction) {
            this._direction = direction;  
        };


        Cannon.prototype.getBalls = function() {
            return this._balls;
        };
        Cannon.prototype.setBalls = function(balls) {
            this._balls = balls;
        };


        Cannon.prototype.buildGeometry = async function() {
            const { game, engine3d, geometry, node } = this;
            try {

                const cannonNode = await engine3d.loadGLBGeometry({
                    id: "cannon",
                    filepath: "./assets/meshes/cannon.glb",
                    scale: 0.25,
                    rotations: {
                        y: 90
                    }
                });
                const [ root, cannon, cannonMount ] = cannonNode.getChildMeshes();
                root.dispose();
                cannonNode.parent = geometry;

                engine3d.showMesh(cannonNode);
                
            } catch (error) {
                throw error;
            }
        };


        Cannon.prototype.addCannonSmokeEmitter = async function() {
            const { game, engine3d, scene, node } = this;
            try {
                
                const cannonSmokeEmitter = new CannonSmokeEmitter(game);
                await cannonSmokeEmitter.init();
                cannonSmokeEmitter.emitter.parent = node;
                cannonSmokeEmitter.emitter.position = new BABYLON.Vector3(0.4, 0.25, 0);
                cannonSmokeEmitter.emitter.rotation.z = BABYLON.Tools.ToRadians(-75);
                cannonSmokeEmitter.emitter.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                this.cannonSmokeEmitter = cannonSmokeEmitter;
                
            } catch (error) {
                throw error;
            }
        };


        Cannon.prototype.init = async function() {
            const { game, engine3d, node } = this;
            try {
                
                // ##DEBUG
                // var box = engine3d.buildDebugBox({
                //     size: 0.02
                // });
                // box.parent = node;

                await this.buildGeometry();

                await this.addCannonSmokeEmitter();

            } catch (error) {
                throw error;
            }
        };


        Cannon.prototype.update = function() {
            
        };


        Cannon.prototype.shoot = async function(velocity) {
            try {

                const { game, engine3d, node } = this;
                const _this = this;
    
                if (this.isShooting) {
                    return;
                }
                this.isShooting = true;
    
                game.playCannonSound();
                
                this.cannonSmokeEmitter.start();

                setTimeout(function() {
                    _this.isShooting = false;
                }, SHOOTING_INTERVAL);
    
                const ball = new CannonBall(game, this);
                await ball.init();
                const ballPosition = this.getPosition().clone();
                
                var angle = 23;
                var height = Math.tan(BABYLON.Tools.ToRadians(angle));
                let ballDirection = this.getDirection().clone();
                ballDirection.addInPlace(new BABYLON.Vector3(0, height, 0 ));
                ballDirection.normalize();
                // console.log("ballDirection", ballDirection);
                
                ballPosition.addInPlace(ballDirection.scale(0.38));
                ballPosition.addInPlace(new BABYLON.Vector3(0, 0.07, 0 ));
                
                let ballVelocity = 0.007 * velocity;

                ball.setPosition(ballPosition);
                ball.setDirection(ballDirection);
                ball.setVelocity(ballVelocity);
                
                this._balls.push(ball);

            } catch (error) {
                throw error;
            }
        };



        return Cannon;

    })();



    E3D.Cannon = Cannon;


})(E3D);