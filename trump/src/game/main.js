game.module(
    'game.main'
)
.require(
    'game.assets',
    'game.objects',
    'engine.core'
)
.body(function() {

game.addAudio('jump_sound.mp3', 'jump_sound');
game.addAudio('trump_song.mp3', 'trump_song');
game.addAudio('trump_coin_sound.mp3', 'trump_coin_sound');
game.addAudio('wall_collide_sound.ogg', 'wall_collide_sound');


game.createScene('Main', {
    init: function() {
        this.world = new game.World(0, 2000);

        game.audio.setMusicVolume(10)
        game.audio.playMusic("trump_song", true);
    
        var floorBody = new game.Body({
            position: {
                x: game.system.width / 2,
                y: game.system.height - 40
            },
            collisionGroup: 1
        });
        var floorShape = new game.Rectangle(game.system.width, 50);
        floorBody.addShape(floorShape);
        this.world.addBody(floorBody);

        var bg = new game.Sprite('01_sky_moon.png').addTo(this.stage);
        this.addParallax('03_city.png', 150, -200);
        this.addParallax('04_city.png', 100, -300);
        this.addParallax('05_trees.png', 100, -400);
        this.addParallax('05_bush.png', 50, -500);
        this.addParallax('platform.png', 0, -600);

        var text = new game.PIXI.Text("Delegates: ", { font: '60px Comic Sans MS' });
        this.stage.addChild(text);

        this.objectContainer = new game.Container().addTo(this.stage);
        this.playerContainer = new game.Container().addTo(this.stage);

        this.player = new game.Player(400, game.system.height - 400);
        this.player.sprite.addTo(this.playerContainer);

        this.addTimer(1200, this.spawnRandomObject.bind(this), true);
        this.spawnRandomObject();

        this.addTimer(500, this.spawnCoin.bind(this), true);
        this.spawnCoin();
    },

    spawnRandomObject: function() {
        var rand = Math.random();
        if (rand < 0.5) {
            var coin = new game.Coin(game.system.width, 400 + Math.random() * 400);
        }
        else if (rand < 0.8) {
            var oneway = new game.Oneway(game.system.width, 700);
        }
        else {
            var tires = new game.Tires(game.system.width, 850);
        }
    },

    spawnCoin: function() {
        var rand = Math.random();
        var coin = new game.Coin(game.system.width, 400 + Math.random() * 400);
    },

    addParallax: function(texture, pos, speed) {
        var sprite = new game.TilingSprite(texture, game.system.width);
        sprite.speed.x = speed;
        sprite.position.y = game.system.height - sprite.height - pos;
        this.addObject(sprite);
        this.stage.addChild(sprite);
    },

    mousedown: function() {
        this.player.jump();
        game.audio.playSound("jump_sound", false);
    },

    keydown: function(key) {
        if (key === 'SPACE') {
            this.player.jump();
            game.audio.playSound("jump_sound", false);        
        } else if (key == 'ESC') {
            alert('pause');            
        }
    }
});

});
