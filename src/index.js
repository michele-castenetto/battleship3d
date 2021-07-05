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


        var player2 = await game.addPlayer({
            name: "player2",
            position: new BABYLON.Vector3(3, 0, 0)
        });
        player2.setColor({g: 255, r: 100});
        
        
        game.setCurrentPlayer(player1);

        game.addPlayerControllerInput(player1);



        // game.setActiveCamera(player1.playerCamera);



    } catch (error) {
        console.log(error);
    }
})();

