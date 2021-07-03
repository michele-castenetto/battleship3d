var E3D = E3D || {};
(function (E3D) {



    const PlayerControllerInput = (function() {
            
        function PlayerControllerInput(engine3d) {
            this.player = null;

            this._keys = {
                left: false,
                right: false,
                forward: false,
                backward: false,
                space: false,
            };

            this.engine3d = this.engine3d;
            this.scene = engine3d.scene;

        }

        PlayerControllerInput.prototype.init = function() {
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


        PlayerControllerInput.prototype._onKeyDown = function(event) {
            switch (event.keyCode) {
                case 83:
                    this._keys.backward = true;
                    break;
                case 87:
                    this._keys.forward = true;
                    break;
                case 65:
                    this._keys.left = true;
                    break;
                case 68:
                    this._keys.right = true;
                    break;
                case 32:
                    this._keys.space = true;
                    break;
            }
        }

        PlayerControllerInput.prototype._onKeyUp = function(event) {
            switch (event.keyCode) {
                case 83:
                    this._keys.backward = false;
                    break;
                case 87:
                    this._keys.forward = false;
                    break;
                case 65:
                    this._keys.left = false;
                    break;
                case 68:
                    this._keys.right = false;
                    break;
                case 32:
                    this._keys.space = false;
                    break;
            }
        };


        return PlayerControllerInput;


    })();


    E3D.PlayerControllerInput = PlayerControllerInput;




    const LifeBar = (function() {
        
        function LifeBar(game) {
            const _this = this;

            this.game = game;
            this.engine3d = game.engine3d;
            this.scene = this.engine3d.scene;

            const node = new BABYLON.TransformNode("lifebar", this.scene);
            this.node = node;

            const geometry = new BABYLON.TransformNode("geometry", this.scene);
            geometry.parent = node;
            this.geometry = geometry;

            this.maxValue = 0;
            this.value = 0;

        }

        LifeBar.prototype.dispose = function () {
            this.node.dispose();
        };


        LifeBar.prototype.updateGeometry = function() {

            const { game, engine3d, scene, geometry, node } = this;


            if (!this.outerBox) {

                const outerBox = BABYLON.MeshBuilder.CreateBox("outer", {
                    width: 0.12,
                    height: 0.12,
                    depth: 0.62,
                }, scene);
                outerBox.material = engine3d.getEmissiveMaterialRGB({r: 255, g: 255, b: 255, a:0.3});
                
                this.outerBox = outerBox;
                outerBox.parent = geometry;
                
            }


            const percentage = Math.floor((this.value/this.maxValue) * 100);
            let color = null;
            if (percentage > 60) {
                color = {r: 100, g: 255, b: 0, a:0.7};
            } else if(percentage > 30) {
                color = {r: 255, g: 255, b: 50, a:0.7};
            } else {
                color = {r: 255, g: 100, b: 0, a:0.7};
            }

            if (this.innerBox) {
                this.innerBox.dispose();
            }
            
            const MAX_DEPTH = 0.6;
            let depth = 0.6 * (percentage/100);
            const innerBox = BABYLON.MeshBuilder.CreateBox("inner", {
                width: 0.1,
                height: 0.1,
                depth: depth,
            }, scene);
            innerBox.position.z -= (MAX_DEPTH - depth)/2;

            innerBox.material = engine3d.getEmissiveMaterialRGB(color);
            
            this.innerBox = innerBox;
            innerBox.parent = this.outerBox;

        };


        LifeBar.prototype.init = function(params = {}) {
            let { value, maxValue = 100 } = params;
            this.maxValue = maxValue;
            this.value = value || maxValue;

            this.updateGeometry();
        };


        LifeBar.prototype.update = function(value) {
            if (value === this.value) {
                return;
            }

            this.value = value;
            this.updateGeometry();

        };

        return LifeBar;

    })();




    const Player = (function () {

        function Player(game) {
            const _this = this;

            this.game = game;
            this.engine3d = game.engine3d;
            this.scene = this.engine3d.scene;

            const node = new BABYLON.TransformNode("player", this.scene);
            this.node = node;

            this.size = null;

            // ##OLD
            this.boundingInfo = null;
            node.getBoundingInfo = function () {
                return _this.boundingInfo;
            };

            const geometry = new BABYLON.TransformNode("geometry", this.scene);
            geometry.parent = node;
            this.geometry = geometry;

            this.playerCamera = null;


            // Ship parts
            this.sailing = null;
            this.ship = null;
            this.flag = null;

            this.color = null;

            // input controller
            this._input = null;

            this.life = 100;


            // move
            this._direction = new BABYLON.Vector3(1, 0, 0);
            this._velocity = 0;

            this.sailingDegree = 0;

            // children  class
            this.cannon = null;
            this.lifeBar = null;

        }

        Player.prototype.dispose = function () {
            const _this = this;
            const { game } = this;
            this.node.dispose();
            game.setPlayers(game.getPlayers().filter(player => player !== _this));
        };


        Player.prototype.setPosition = function (position) {
            this.node.position = position;
        };
        Player.prototype.getPosition = function () {
            return this.node.getAbsolutePosition();
        };

        
        Player.prototype.setColor = function({r = 0, g = 0, b = 0}) {
            this.color = {r, g, b};
            this.flag.material.albedoColor = BABYLON.Color3.FromInts(r, g, b);
        };


        return Player;

    })();



    /**
     * Init
     */

    (function() {
        

        Player.prototype.init = async function() {
            const { game, node } = this;
            try {
                
                // ##DEBUG
                // var box = engine3d.buildDebugBox({
                //     size: 0.02
                // });
                // box.parent = node;

                this.addPlayerCamera();

                const cannon = this.addCannon();
                await cannon.init();

                const lifeBar = this.addLifeBar();

                await this.buildGeometry();
                
                // this.addPhysics();

                this.addAnimations();

                // this.bbMesh.isVisible = true;

            } catch (error) {
                throw error;
            }
        };


        Player.prototype.addPlayerCamera = function() {
            const _this = this;
            const { game, engine3d, scene, node } = this;
            const { canvasNode : canvas } = engine3d;
    
            const camera = new BABYLON.FreeCamera("camera_free0", new BABYLON.Vector3(0, 0, 0), scene);
            camera.inputs.clear();
            camera.parent = node;
            // camera.position = new BABYLON.Vector3(-3, 1, 0);
            // camera.setTarget(node.position);
            camera.position = new BABYLON.Vector3(-5, 2, 0);
            // camera.setTarget(node.position.add(new BABYLON.Vector3(5, 0, 0)));
            camera.setTarget(new BABYLON.Vector3(10, 0, 0));
            
            this.playerCamera = camera;
            
        };


        Player.prototype.addCannon = function() {
            const { Cannon } = E3D;
            const { game, node } = this;
            
            const cannon = new Cannon(game);
            cannon.node.parent = node;
            cannon.setPosition(new BABYLON.Vector3(0.2, 0, 0));
            cannon.setDirection(this._direction);

            this.cannon = cannon;

            return cannon;

        };


        Player.prototype.addLifeBar = function() {
            const { game, node } = this;

            const lifeBar = new LifeBar(game);
            lifeBar.node.parent = node;
            lifeBar.node.position = new BABYLON.Vector3(-0.3, 1, 0);
            lifeBar.init({
                maxValue: 100
            });

            this.lifeBar = lifeBar;

            return lifeBar;

        };


        //##OLD
        Player.prototype.addPhysics = function () {

            const { game, engine3d, scene, geometry, node } = this;
            const { physicsViewer } = game;

            const physicsImpostor = new BABYLON.PhysicsImpostor(node, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 10,
                restitution: 0.9,
            }, scene);

            this.physicsImpostor = physicsImpostor;

            physicsViewer.showImpostor(physicsImpostor);

        };


    })();





    /**
     * Animations
     */

    (function () {


        Player.prototype.addAnimations = function () {

            const { engine3d, scene, geometry, node } = this;

            const animation1 = new BABYLON.Animation("1", "position.y", 30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

            let keys1 = [];
            keys1.push({
                frame: 0,
                value: 0
            });
            keys1.push({
                frame: 20,
                value: -0.01
            });
            keys1.push({
                frame: 100,
                value: 0
            });

            animation1.setKeys(keys1);

            const animation2 = new BABYLON.Animation("2", "rotation.x", 30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

            keys2 = [];
            keys2.push({
                frame: 0,
                value: -0.07
            });
            keys2.push({
                frame: 20,
                value: 0
            });
            keys2.push({
                frame: 50,
                value: 0.08
            });
            keys2.push({
                frame: 80,
                value: 0
            });
            keys2.push({
                frame: 100,
                value: -0.07
            });

            animation2.setKeys(keys2);

            var animationGroup = new BABYLON.AnimationGroup("player");
            animationGroup.addTargetedAnimation(animation1, geometry);
            animationGroup.addTargetedAnimation(animation2, geometry);

            animationGroup.normalize(0, 100);

            animationGroup.play(true);

        };


    })();




    /**
     * Geometry
     */

    (function () {


        Player.prototype.getBoundingInfo = function () {
            return this.boundingInfo;
        };


        Player.prototype.buildGeometry = async function () {
            const { game, engine3d, scene, geometry, node } = this;
            try {

                //##OLD
                // var shipNode = await engine3d.loadGeometry("./assets/meshes/ship.glb", {
                //     name: "ship",
                // });
                // shipNode.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
                const shipNode = await engine3d.loadGLBGeometry({
                    id: "ship",
                    filepath: "./assets/meshes/ship.glb",
                    scale: 0.01
                });
                shipNode.parent = this.geometry;
                engine3d.showMesh(shipNode);

                const [root, sailing, ship, flag] = shipNode.getChildMeshes();
                root.dispose();
                this.sailing = sailing;
                this.ship = ship;
                this.flag = flag;

                ship.material.reflectionTexture = game.reflectionTexture;

                var size = engine3d.getMeshSize(shipNode);
                this.size = size;

                sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(20), BABYLON.Space.LOCAL);

                // shipNode.position = new BABYLON.Vector3(-size.x/2, -0.03, -size.z/2);
                shipNode.position = new BABYLON.Vector3(-size.x / 2, -0.02, -size.z / 2);

                this.boundingInfo = engine3d.getMeshBoundingInfo(geometry);

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
                bbMesh.position = new BABYLON.Vector3(-size.x / 2, -0, -size.z / 2);
                this.bbMesh = bbMesh;

            } catch (error) {
                throw error;
            }
        };


    })();





    /**
     * Update
     */

    (function () {


        Player.prototype.updateLife = function(value) {
            this.life = value;
            this.lifeBar.update(value);
        };


        Player.prototype.shoot = function() {
            this.cannon.shoot();
        };


        Player.prototype.rotateDirection = function(angle) {
            const { game, engine3d, scene, geometry, node } = this;

            node.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(angle), BABYLON.Space.LOCAL);

            var matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(angle));
            this._direction = BABYLON.Vector3.TransformCoordinates(this._direction, matrix);

            this.cannon.setDirection(this._direction.clone());

        };


        Player.prototype.rotateLeft = function() {
            // if (this._velocity === 0) {
            //     return;
            // }
            this.rotateDirection(0.4);
        };


        Player.prototype.rotateRight = function() {
            // if (this._velocity === 0) {
            //     return;
            // }
            this.rotateDirection(-0.4);
        };


        Player.prototype.setVelocity = function(velocity) {
            this._velocity = velocity;
        };





        Player.prototype.openSailing = function() {
            const { game, engine3d, scene, geometry, node, sailing } = this;
            this.sailingDegree += 0.4;
            if (this.sailingDegree > 60) {
                this.sailingDegree = 60;
            }
            sailing.rotationQuaternion = BABYLON.Quaternion.Identity();
            sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(this.sailingDegree + 20), BABYLON.Space.LOCAL);

        };


        Player.prototype.closeSailing = function() {
            const { game, engine3d, scene, geometry, node, sailing } = this;
            this.sailingDegree -= 0.4;
            if (this.sailingDegree < 0) {
                this.sailingDegree = 0;
            }
            sailing.rotationQuaternion = BABYLON.Quaternion.Identity();
            sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(this.sailingDegree + 20), BABYLON.Space.LOCAL);

        };


        Player.prototype.update = function () {

            const { game, engine3d, scene, geometry, node, sailing } = this;

            // game.getPlayers().slice().forEach(p => {
            //     p.cannon.getBalls().forEach(ball => {
            //         game.getPlayers().filter(player => {
            //             return player !== p;
            //         }).forEach(player => {
            //             // ball.bbMesh.computeWorldMatrix(true);
            //             // player.bbMesh.computeWorldMatrix(true);
            //             const intersection = player.bbMesh.intersectsMesh(ball.bbMesh, true);
            //             if(intersection) {
            //                 player.bbMesh.material = engine3d.getEmissiveMaterialRGB({g:255, a: 0.2});
            //                 player.updateLife(player.life - 20);
            //                 ball.dispose();
            //             } else {
            //                 player.bbMesh.material = Player._getBBMaterial(scene);
            //             }
            //         });
            //     });
            // });


            if (!this._input) {
                return;   
            }

            // ##TODO
            // time=time+((new Date().getTime()/1000)-t1)
            // var tNow = window.performance.now();


            if (this._input._keys.forward) {
                this.openSailing();
            }
            if (this._input._keys.backward) {
                this.closeSailing();
            }
            if (this._input._keys.left) {
                this.rotateLeft();
            }
            if (this._input._keys.right) {
                this.rotateRight();
            }
            if (this._input._keys.space) {
                this.shoot();
            }

            let velocity = this._velocity;
            let direction = this._direction;

            const WATER_FRICTION = 0.0001;
            const WIND_FORCE_RATIO = 0.000004;
            const MAX_VEL = 0.05;


            // ##OLD
            // const accelleration = 0.001;
            const accelleration = - WATER_FRICTION + this.sailingDegree * WIND_FORCE_RATIO;
            // console.log("accelleration", accelleration);
            // console.log("velocity", velocity);


            velocity += accelleration;
            if (velocity < 0) {
                velocity = 0;
            }
            if (velocity > MAX_VEL) {
                velocity = MAX_VEL;
            }

            this.setVelocity(velocity);

            this.node.position.addInPlace(direction.scale(velocity));

        };



        // ##OLD
        Player.prototype.speedUp = function () {
            const { game, engine3d, scene, geometry, node, sailing } = this;
            this.speed += 0.01;
            if (this.speed >= 0.02) {
                this.speed = 0.02;
            }

            if (this.speed === 0) {
                sailing.setEnabled(true);
                sailing.rotationQuaternion = BABYLON.Quaternion.Identity();
                sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(20), BABYLON.Space.LOCAL);
            }
            if (this.speed === 0.01) {
                sailing.setEnabled(true);
                sailing.rotationQuaternion = BABYLON.Quaternion.Identity();
                sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(50), BABYLON.Space.LOCAL);
            }
            if (this.speed === 0.02) {
                sailing.setEnabled(true);
                sailing.rotationQuaternion = BABYLON.Quaternion.Identity();
                sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(80), BABYLON.Space.LOCAL);
            }

        };
        Player.prototype.speedDown = function () {
            const { game, engine3d, scene, geometry, node, sailing } = this;
            this.speed -= 0.01;
            if (this.speed <= 0) {
                this.speed = 0;
            }

            if (this.speed === 0) {
                sailing.setEnabled(true);
                sailing.rotationQuaternion = BABYLON.Quaternion.Identity();
                sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(20), BABYLON.Space.LOCAL);
            }
            if (this.speed === 0.01) {
                sailing.setEnabled(true);
                sailing.rotationQuaternion = BABYLON.Quaternion.Identity();
                sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(50), BABYLON.Space.LOCAL);
            }
            if (this.speed === 0.02) {
                sailing.setEnabled(true);
                sailing.rotationQuaternion = BABYLON.Quaternion.Identity();
                sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(80), BABYLON.Space.LOCAL);
            }

        };


    })();



    E3D.Player = Player;




})(E3D);

