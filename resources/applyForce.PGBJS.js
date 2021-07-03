var createScene = function () {

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    // var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    var camera = new BABYLON.ArcRotateCamera("camera1", 0, 3.14/3, 10, new BABYLON.Vector3(0, 0, 0), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
    sphere.position.y = 2;

    var box = BABYLON.MeshBuilder.CreateBox("box", {
        width: 2
    }, scene);
    box.position.y = 2;
    box.position.z = 4;

    
    

    // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
    var ground = BABYLON.Mesh.CreateGround("ground1", 8, 8, 2, scene);
	ground.position.y = -1;

	scene.enablePhysics();
    
    scene.getPhysicsEngine().setGravity(new BABYLON.Vector3(0, -9.81, 0));



	ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
	sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
	box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.3 }, scene);




    

    var applyForce = function(target) {

        var forceDirection = new BABYLON.Vector3(0, 1, 0);
        var forceMagnitude = 9.81;

        target.physicsImpostor.applyForce(scene.getPhysicsEngine().gravity.negate(), target.getAbsolutePosition());

    };


    sphere.physicsImpostor.mass

    scene.onBeforeRenderObservable.add(() => {
        console.log(sphere.position.y);
        applyForce(sphere);
        applyForce(box);

        box.position.z -= 0.01;
    });
    


    return scene;

};