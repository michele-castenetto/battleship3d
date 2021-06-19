(async function() {
    try {
        

        var engine3d = new Engine3d();
        window.engine3d = engine3d;
        engine3d.init(document.getElementById("canvas_grafica"));

        engine3d.start();

        engine3d.scene.debugLayer.show();   


        var game = new Game(engine3d);

        game.init();
        window.game = game;


        game.loadSounds();


        game.buildAmbient();


        var box = BABYLON.MeshBuilder.CreateBox("box", {}, engine3d.scene);
        box.position = new BABYLON.Vector3(10, 0, 10);



        




    } catch (error) {
        console.log(error);
    }
})();

