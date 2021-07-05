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


        const sideJoystickOffset = 50;
        const bottomJoystickOffset = -50;


        const buildEllipse = function(name, params = {}) {
            let rect = new BABYLON.GUI.Ellipse();
            rect.name = name;
            rect.width = params.width;
            rect.height = params.height;
            rect.thickness = params.thickness;
            rect.color = params.color;
            rect.background = params.background;
            rect.isPointerBlocker = true;
            rect.alpha = params.alpha;

            rect.paddingLeft = "0px";
            rect.paddingRight = "0px";
            rect.paddingTop = "0px";
            rect.paddingBottom = "0px";
            rect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            rect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            return rect;
        };
        PlayerControllerInput.prototype.buildLeftController = function(adt) {
            
            const _this = this;
            const { engine3d, scene, debug } = this;

            let xAddPos = 0;
            let yAddPos = 0;

            let leftThumbContainer = buildEllipse("leftThumb", {
                width: "200px",
                height: "200px",
                thickness: 4,
                color: "#ffffff",
                background: null,
                alpha: 0.4,
            });
            leftThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            leftThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            leftThumbContainer.left = sideJoystickOffset;
            leftThumbContainer.top = bottomJoystickOffset;

            let leftInnerThumbContainer = buildEllipse("leftInnterThumb", {
                width: "80px",
                height: "80px",
                thickness: 4,
                color: "#ffffff",
                background: null,
                alpha: 1,
            });

            let leftPuck = buildEllipse("leftPuck", {
                width: "60px",
                height: "60px",
                thickness: 0,
                color: "#ffffff",
                background: "#ffffff",
                alpha: 1,
            });

            leftThumbContainer.onPointerDownObservable.add((coordinates) => {
                leftPuck.isDown = true;
                leftPuck.isVisible = true;
                leftPuck.floatLeft = coordinates.x-(leftThumbContainer._currentMeasure.width*0.5)-sideJoystickOffset;
                leftPuck.left = leftPuck.floatLeft;
                leftPuck.floatTop = adt._canvas.height - coordinates.y-(leftThumbContainer._currentMeasure.height*0.5)+bottomJoystickOffset;
                leftPuck.top = leftPuck.floatTop*-1;
                
            });
      
            leftThumbContainer.onPointerUpObservable.add(function(coordinates) {
                xAddPos = 0;
                yAddPos = 0;
                leftPuck.isDown = false;
                leftPuck.isVisible = false;
                _this._keys.right = false;
                _this._keys.left = false;
                _this._keys.forward = false;
                _this._keys.backward = false;
            });
            
            leftThumbContainer.onPointerMoveObservable.add(function(coordinates) {
                if (leftPuck.isDown) {
                    xAddPos = coordinates.x-(leftThumbContainer._currentMeasure.width*0.5)-sideJoystickOffset;
                    yAddPos = adt._canvas.height - coordinates.y-(leftThumbContainer._currentMeasure.height*0.5)+bottomJoystickOffset;
                    leftPuck.floatLeft = xAddPos;
                    leftPuck.floatTop = yAddPos*-1;
                    leftPuck.left = leftPuck.floatLeft;
                    leftPuck.top = leftPuck.floatTop;
                    _this._keys.right = xAddPos > 50;
                    _this._keys.left = xAddPos < -50;
                    _this._keys.forward = yAddPos > 50;
                    _this._keys.backward = yAddPos < -50;
                }
            });

            adt.addControl(leftThumbContainer);
            leftThumbContainer.addControl(leftInnerThumbContainer);
            leftThumbContainer.addControl(leftPuck);
            leftPuck.isVisible = false;

        };
        PlayerControllerInput.prototype.buildRightController = function(adt) {
            const _this = this;
            const { engine3d, scene, debug } = this;

            let rightThumbContainer = buildEllipse("rightThumb", {
                width: "200px",
                height: "200px",
                thickness: 0,
                color: "#ffffff",
                background: null,
                alpha: 0.4,
            });
            rightThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            rightThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            rightThumbContainer.left = -sideJoystickOffset;
            rightThumbContainer.top = bottomJoystickOffset;
            
            let rightInnerThumbContainer = buildEllipse("rightInnterThumb", {
                width: "80px",
                height: "80px",
                thickness: 4,
                color: "#ffffff",
                background: null,
                alpha: 1,
            });
            
            let rightPuck = buildEllipse("rightPuck", {
                width: "60px",
                height: "60px",
                thickness: 0,
                color: "#ffffff",
                background: "#ffffff",
                alpha: 1,
            });
            
            rightInnerThumbContainer.onPointerDownObservable.add((coordinates) => {
                rightPuck.isDown = true;
                rightPuck.isVisible = true;
                _this._keys.space = true;
            });
     
            rightInnerThumbContainer.onPointerUpObservable.add(function(coordinates) {
                rightPuck.isDown = false;
                rightPuck.isVisible = false;
                _this._keys.space = false;
            });

            adt.addControl(rightThumbContainer);
            rightThumbContainer.addControl(rightInnerThumbContainer);
            rightThumbContainer.addControl(rightPuck);
            rightPuck.isVisible = false;

        };
        PlayerControllerInput.prototype.initVirtualJoystickInput = function() {

            let adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

            this.buildLeftController(adt);

            this.buildRightController(adt);

        };


        PlayerControllerInput.prototype.initKeyboardInput = function() {
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
        };

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




    const PlayerBar = (function() {
        
        function PlayerBar(game, params = {}) {
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

            this.getColor = null;

            // ##TODO
            // this.width = params.width || 0.6;
            // this.heigth = params.width || 0.1;
            // this.margin = params.depth || 0.02;

        }


        PlayerBar.HEIGHT = 0.1;
        PlayerBar.WIDTH = 0.6;
        PlayerBar.MARGIN = 0.02;


        PlayerBar.prototype.dispose = function () {
            this.node.dispose();
        };


        PlayerBar.prototype.getBarColor = function(percentage) {
            if (this.getBarColorFn) {
                return this.getBarColorFn(percentage);
            } else {
                return {r: 255, g: 100, b: 0, a:0.7};
            }
        };


        PlayerBar.prototype.updateGeometry = function() {

            const { game, engine3d, scene, geometry, node } = this;


            if (!this.outerBox) {

                const outerBox = BABYLON.MeshBuilder.CreateBox("outer", {
                    width: PlayerBar.HEIGHT + PlayerBar.MARGIN,
                    height: PlayerBar.HEIGHT + PlayerBar.MARGIN,
                    depth: PlayerBar.WIDTH + PlayerBar.MARGIN,
                }, scene);
                outerBox.material = engine3d.getEmissiveMaterialRGB({r: 255, g: 255, b: 255, a:0.3});
                
                this.outerBox = outerBox;
                outerBox.parent = geometry;
                
            }

            if (!this.innerBox) {

                const innerBox = BABYLON.MeshBuilder.CreateBox("inner", {
                    width: PlayerBar.HEIGHT,
                    height: PlayerBar.HEIGHT,
                    depth: PlayerBar.WIDTH,
                }, scene);
                innerBox.material = engine3d.getEmissiveMaterialRGB({r: 255, g: 255, b: 255, a:0.3});
                
                this.innerBox = innerBox;
                innerBox.parent = this.outerBox;
                
            }

            const percentage = Math.floor((this.value/this.maxValue) * 100);
            this.innerBox.isVisible = percentage !== 0;

            const color = this.getBarColor(percentage);
            this.innerBox.material = engine3d.getEmissiveMaterialRGB(color);

            this.innerBox.scaling = new BABYLON.Vector3(1, 1, percentage/100);
            this.innerBox.position.z = -(PlayerBar.WIDTH - PlayerBar.WIDTH * (percentage/100)) * 0.5;

        };


        PlayerBar.prototype.init = function(params = {}) {
            let { value, maxValue = 100 } = params;
            this.maxValue = maxValue;
            this.value = value !== undefined ? value : maxValue;

            this.getBarColorFn = params.getBarColorFn;

            this.updateGeometry();
        };


        PlayerBar.prototype.update = function(value) {
            if (value === this.value) {
                return;
            }

            this.value = value;
            this.updateGeometry();

        };


        return PlayerBar;

    })();
    E3D.PlayerBar = PlayerBar;







    //##REF particleSystem
    // https://www.babylonjs-playground.com/#1K0NSN#1
    
    const WakeEmitter = (function() {
        
        function WakeEmitter(game) {
            const _this = this;

            this.game = game;
            this.engine3d = game.engine3d;
            this.scene = this.engine3d.scene;

            this.particleSystem = null;
            this.emitter = null;

        }


        WakeEmitter.prototype.buildParticleSystem = function(scene, emitter) {
          
            // Create a particle system
            var particleSystem = new BABYLON.ParticleSystem("wake", 2000, scene);

            //Texture of each particle
            particleSystem.particleTexture = new BABYLON.Texture("./assets/textures/flare.png", scene);

            // Where the particles come from
            particleSystem.emitter = emitter;
            particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, -0.1); 
            particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0.1);

            // Colors of all particles
            // particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
            // particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
            particleSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
            particleSystem.color2 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

            // Size of each particle (random between...
            particleSystem.minSize = 0.02;
            particleSystem.maxSize = 0.03;

            // Life time of each particle (random between...
            particleSystem.minLifeTime = 0.5;
            particleSystem.maxLifeTime = 1;

            // Emission rate
            // particleSystem.emitRate = 1500;
            particleSystem.emitRate = 1000;

            // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

            // Set the gravity of all particles
            // particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
            particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

            // Direction of each particle after it has been emitted
            // particleSystem.direction1 = new BABYLON.Vector3(-7, 8, 3);
            // particleSystem.direction2 = new BABYLON.Vector3(7, 8, -3);
            particleSystem.direction1 = new BABYLON.Vector3(-1, 0, -1);
            particleSystem.direction2 = new BABYLON.Vector3(-1, 0, 1);

            // Angular speed, in radians
            particleSystem.minAngularSpeed = 0;
            // particleSystem.maxAngularSpeed = Math.PI;
            particleSystem.maxAngularSpeed = 0;

            // Speed
            // particleSystem.minEmitPower = 1;
            // particleSystem.maxEmitPower = 3;
            particleSystem.minEmitPower = 0.5;
            particleSystem.maxEmitPower = 0.5;
            particleSystem.updateSpeed = 0.005;
            
            var updateFunction = function(particles) {
                for (var index = 0; index < particles.length; index++) {
                    var particle = particles[index];
                    particle.age += this._scaledUpdateSpeed;
                    
                    if (particle.age >= particle.lifeTime) { // Recycle
                        particles.splice(index, 1);
                        this._stockParticles.push(particle);
                        index--;
                        continue;
                    } else {
                        particle.colorStep.scaleToRef(this._scaledUpdateSpeed, this._scaledColorStep);
                        particle.color.addInPlace(this._scaledColorStep);
                        
                        if (particle.color.a < 0)
                        particle.color.a = 0;
                        
                        particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;
                        
                        particle.direction.scaleToRef(this._scaledUpdateSpeed, this._scaledDirection);
                        particle.position.addInPlace(this._scaledDirection);
                        
                        // this.gravity.scaleToRef(this._scaledUpdateSpeed, this._scaledGravity);
                        // particle.direction.addInPlace(this._scaledGravity);
                    }
                } 
            };            
            particleSystem.updateFunction = updateFunction;

            return particleSystem;

        };


        WakeEmitter.prototype.init = function(params = {}) {
            const { scene } = this;

            const emitter = new BABYLON.TransformNode("wake_emitter", scene); 
            this.emitter = emitter;

            const particleSystem = this.buildParticleSystem(scene, emitter);
            this.particleSystem = particleSystem;

        };


        WakeEmitter.prototype.start = function() {
            this.particleSystem.start();
        };


        WakeEmitter.prototype.stop = function() {
            this.particleSystem.stop();
        };


        return WakeEmitter;


    })();
    E3D.WakeEmitter = WakeEmitter;
    



    const Player = (function () {

        function Player(game, params = {}) {
            const _this = this;

            this.name = params.name || "player";

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
            this.wakeEmitter = null;

            // shoot

            this.inShootingState = false;
            this.shootStartTime = null;

        }

        Player.SHOOT_MIN_TIME = 100;
        Player.SHOOT_MAX_TIME = 2000;
        Player.SHOOT_MIN_SPEED = 10;
        Player.SHOOT_MAX_SPEED = 30;


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

                const shootBar = this.addShootBar();
                
                await this.buildGeometry();
                
                // this.addPhysics();

                this.addAnimations();

                this.addWakeEmitter();

                // this.bbMesh.isVisible = true;

            } catch (error) {
                throw error;
            }
        };


        Player.prototype.addWakeEmitter = function() {
            const { game, engine3d, scene, node } = this;

            const wakeEmitter = new WakeEmitter(game);
            wakeEmitter.init();
            wakeEmitter.emitter.parent = node;
            wakeEmitter.emitter.position = new BABYLON.Vector3(-0.4, 0, 0);
            this.wakeEmitter = wakeEmitter;

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

            const lifeBar = new PlayerBar(game);
            lifeBar.node.parent = node;
            lifeBar.node.position = new BABYLON.Vector3(-0.3, 0.8, 0);
            lifeBar.init({
                value: 100,
                maxValue: 100,
                getBarColorFn: function(percentage) {
                    let color = null;
                    if (percentage > 60) {
                        color = {r: 100, g: 255, b: 0, a:0.7};
                    } else if(percentage > 30) {
                        color = {r: 255, g: 255, b: 50, a:0.7};
                    } else {
                        color = {r: 255, g: 100, b: 0, a:0.7};
                    }
        
                    return color;
                }
            });

            this.lifeBar = lifeBar;

            return lifeBar;

        };


        Player.prototype.addShootBar = function() {
            const { game, node } = this;

            const shootBar = new PlayerBar(game);
            shootBar.node.parent = node;
            shootBar.node.position = new BABYLON.Vector3(-0.3, 0.6, 0);
            shootBar.init({
                value: 0,
                maxValue: 100,
            });

            this.shootBar = shootBar;

            return shootBar;

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


        Player.prototype.runDeadAnimation = function() {
            
            const { engine3d, scene, geometry, node } = this;

            const animation1 = new BABYLON.Animation("1", "position.y", 30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            let keys1 = [];
            keys1.push({
                frame: 0,
                value: 0
            });
            keys1.push({
                frame: 20,
                value: -0.4
            });
            keys1.push({
                frame: 100,
                value: -2
            });

            animation1.setKeys(keys1);

            const animation2 = new BABYLON.Animation("2", "rotation.x", 30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            keys2 = [];
            keys2.push({
                frame: 0,
                value: 0
            });
            keys2.push({
                frame: 20,
                value: BABYLON.Tools.ToRadians(15),
            });
            keys2.push({
                frame: 50,
                value: BABYLON.Tools.ToRadians(20),
            });
            keys2.push({
                frame: 80,
                value: BABYLON.Tools.ToRadians(70),
            });
            keys2.push({
                frame: 100,
                value: BABYLON.Tools.ToRadians(90),
            });

            animation2.setKeys(keys2);

            var animationGroup = new BABYLON.AnimationGroup("player_dead");
            animationGroup.addTargetedAnimation(animation1, node);
            animationGroup.addTargetedAnimation(animation2, node);

            animationGroup.normalize(0, 100);

            animationGroup.play();
            
            return animationGroup;

        };


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

                flag.material = flag.material.clone();
                flag.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(180), BABYLON.Space.LOCAL);

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


        Player.prototype.shoot = function(shootVelocity) {
            this.cannon.shoot(shootVelocity);
        };


        Player.prototype.rotateDirection = function(angle) {
            const { game, engine3d, scene, geometry, node } = this;

            node.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(angle), BABYLON.Space.LOCAL);

            var matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(angle));
            this._direction = BABYLON.Vector3.TransformCoordinates(this._direction, matrix);

            this.cannon.setDirection(this._direction.clone());

        };
        Player.prototype.rotateLeft = function() {
            this.rotateDirection(0.4);
        };
        Player.prototype.rotateRight = function() {
            this.rotateDirection(-0.4);
        };
        

        Player.prototype.getVelocity = function() {
            return this._velocity;
        };
        Player.prototype.setVelocity = function(velocity) {
            this._velocity = velocity;
        };


        Player.prototype.setSailing = function(degree) {
            const { game, engine3d, scene, geometry, node, sailing } = this;
            this.sailingDegree = degree;
            if (this.sailingDegree < 0) {
                this.sailingDegree = 0;
            }
            if (this.sailingDegree > 60) {
                this.sailingDegree = 60;
            }
            sailing.rotationQuaternion = BABYLON.Quaternion.Identity();
            sailing.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(this.sailingDegree + 20), BABYLON.Space.LOCAL);
        };
        Player.prototype.openSailing = function() {
            const { game, engine3d, scene, geometry, node, sailing } = this;
            this.setSailing(this.sailingDegree + 0.4);
        };
        Player.prototype.closeSailing = function() {
            const { game, engine3d, scene, geometry, node, sailing } = this;
            this.setSailing(this.sailingDegree - 0.4);
        };


        Player.prototype.update = function (deltaTime) {

            const { game, engine3d, scene, geometry, node, sailing } = this;
            const { SHOOT_MIN_SPEED, SHOOT_MAX_SPEED, SHOOT_MIN_TIME, SHOOT_MAX_TIME } = Player;

            if (this._input) {
                
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
                    if (!this.inShootingState) {
                        this.shootStartTime = performance.now();
                        this.inShootingState = true;
                    }
                    let delta = Math.floor(performance.now() - this.shootStartTime);
                    if (delta < SHOOT_MIN_TIME) {
                        delta = SHOOT_MIN_TIME;
                    }
                    if (delta > SHOOT_MAX_TIME) {
                        delta = SHOOT_MAX_TIME;
                    }
                    const value = (delta - SHOOT_MIN_TIME) * ( 100/(SHOOT_MAX_TIME - SHOOT_MIN_TIME) );
                    this.shootBar.update(value);


                } else {
                    if (this.inShootingState) {
                        this.inShootingState = false;
                        let delta = Math.floor(performance.now() - this.shootStartTime);
                        if (delta < SHOOT_MIN_TIME) {
                            delta = SHOOT_MIN_TIME;
                        }
                        if (delta > SHOOT_MAX_TIME) {
                            delta = SHOOT_MAX_TIME;
                        }
                        // console.log("delta", delta);

                        const shootVelocity = (delta - SHOOT_MIN_TIME) * ( (SHOOT_MAX_SPEED - SHOOT_MIN_SPEED)/(SHOOT_MAX_TIME - SHOOT_MIN_TIME) ) + SHOOT_MIN_SPEED;
                        // console.log("shootVelocity", shootVelocity);

                        this.shootBar.update(0);
                        this.shoot(shootVelocity);

                    }

                }

            }

            
            let velocity = this._velocity;
            let direction = this._direction;

            // const WATER_FRICTION = 0.0001;
            const WATER_FRICTION = 0.00001;
            const WIND_FORCE_RATIO = 0.000004;
            const MAX_VEL = 0.05;
            const actualMaxVel = 0.01 + MAX_VEL * (this.sailingDegree/60);

            let accelleration = this.sailingDegree * WIND_FORCE_RATIO;
            if (this.sailingDegree === 0) {
                accelleration -= WATER_FRICTION;
            }

            // console.log("accelleration", accelleration);
            // console.log("velocity", velocity);


            velocity += accelleration;
            if (velocity < 0) {
                velocity = 0;
            }
            if (velocity > actualMaxVel) {
                velocity = actualMaxVel;
            }

            this.setVelocity(velocity);

            if (velocity > 0.01) {
                this.wakeEmitter.start();
            } else {
                this.wakeEmitter.stop();
            }

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

