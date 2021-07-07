(async function() {
    try {
        

        const { Engine3d, Game, PlayerControllerInput } = E3D;


        var engine3d = new Engine3d();
        window.engine3d = engine3d;
        engine3d.init(document.getElementById("canvas_grafica"));

        engine3d.start();
        
        var game = new Game(engine3d);

        await game.init();
        window.game = game;


        var player1 = await game.addPlayer({
            name: "player1"
        });
        player1.setColor({r: 240, g: 50});  

        game.setCurrentPlayer(player1);
        game.addPlayerControllerInput(player1);

        
        game.setActiveCamera(player1.playerCamera);



        //##TEST
        // var enermy1 = await game.addPlayer({
        //     name: "enermy1",
        //     position: new BABYLON.Vector3(3, 0, 0)
        // });
        // // enermy1.setColor({g: 255, r: 100});
        // enermy1.setColor({g: 50, b: 255});


        
        game.addEnermies({
            num: 2
        });



        // game.enableXR(player1);
        

        
        
        



    } catch (error) {
        console.log(error);
    }
})();

