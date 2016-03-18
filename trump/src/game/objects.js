game.module(
    'game.objects'
)
.body(function() {

game.addAudio('trump_coin_sound.mp3', 'trump_coin_sound');
game.addAudio('wall_collide_sound.ogg', 'wall_collide_sound');

game.addAsset('stacks_of_money.png', 'stacks_of_money');

game.createClass('Player', {
    onGround: false,  
    delegates: 0,  

    init: function(x, y) {
        delegates = 0;

        this.sprite = game.Animation.fromFrames('run');
        this.sprite.animationSpeed = 0.2;
        this.sprite.anchor.set(0.5, 0.6);
        this.sprite.play();

        this.runTextures = this.sprite.textures;
        this.jumpUpTextures = [game.Texture.fromFrame('jump-up.png')];
        this.jumpDownTextures = [game.Texture.fromFrame('jump-down.png')];
        this.hitTextures = [game.Texture.fromFrame('hit-wall.png')];

        this.body = new game.Body({
            position: {
                x: x,
                y: y
            },
            mass: 1,
            collisionGroup: 0,
            // 1 = floor
            // 2 = pickup
            // 3 = obstacle
            // 4 = oneway
            collideAgainst: [1, 2, 3, 4],
            velocityLimit: {
                x: 0,
                y: 1200
            }
        });
        this.body.collide = this.collide.bind(this);

        this.sprite.position.set(x, this.body.position.y);

        var shape = new game.Rectangle(80, 190);
        this.body.addShape(shape);
        game.scene.world.addBody(this.body);
        game.scene.addObject(this);
    },

    jump: function() {
        if (!this.onGround || this.killed) return;

        this.sprite.textures = this.jumpUpTextures;
        this.body.velocity.y = -this.body.velocityLimit.y;
        this.body.mass = 1;
        this.onGround = false;
    },

    collide: function(other) {
        if (other.collisionGroup === 1) { // floor
            this.body.velocity.y = 0;
            this.body.mass = 0;
            this.onGround = true;
        }
        else if (other.collisionGroup === 2) { // pickup
            other.parent.remove();
            game.audio.playSound("trump_coin_sound", false);
            delegates++;
            //this.parent.player.delegates++;
            
            return false;
        }
        else if (other.collisionGroup === 3) { // obstacle            
            // this.kill();

            return false;
        }
        else if (other.collisionGroup === 4) { // oneway
            if (this.body.last.y + this.body.shape.height / 2 <= other.position.y - other.shape.height / 2) {
                this.body.velocity.y = 0;
                this.onGround = true;
            }
            else return false;
        }
        return true;
    },

    kill: function() {
        game.audio.playSound("wall_collide_sound", false);
        this.killed = true;
        this.body.mass = 1;
        game.scene.world.removeBodyCollision(this.body);
        this.body.velocity.y = -this.body.velocityLimit.y / 2;
        this.sprite.textures = this.hitTextures;
        game.scene.addTimer(2000, function() {
            // Restart game
            game.system.setScene('Main');
        });
    },


// doesn't work, if we need to count lifes
    resurrect: function() {        
        this.body.mass = 1;
        game.scene.world.removeBodyCollision(this.body);
        
        y = this.body.velocity.y;
        this.body.velocity.y = -this.body.velocityLimit.y / 2;
        
        textures = this.sprite.textures;
        this.sprite.textures = this.hitTextures;

        game.scene.addTimer(2000, function() {
            // Restart game
            // game.system.setScene('Main');
            // bring all settings back
            this.body.mass = 0;
            game.scene.world.addBodyCollission(this.body);
            this.body.velocity = y; 
            this.sprite.textures = textures;
        });
    },

    update: function() {
        // Update sprite position
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;

        //this.text = "Delegates: " + delegates;

        if (this.killed) return;

        if (this.body.velocity.y > 0) this.onGround = false;

        // Update sprite textures
        if (!this.onGround && this.body.velocity.y > 0 && this.sprite.textures !== this.jumpDownTextures) {
            this.sprite.textures = this.jumpDownTextures;
        }
        if (this.onGround && this.sprite.textures !== this.runTextures) {
            this.sprite.textures = this.runTextures;
        }
    }
});

game.createClass('Coin', {
    init: function(x, y) {
/*
        this.sprite = game.Animation.fromFrames('coin-gold');
        this.sprite.animationSpeed = 0.2;
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.play();

*/

        this.sprite = new game.Sprite('stacks_of_money');
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.scale.x = 0;
        this.sprite.scale.y = 0;

        var tween = new game.Tween(this.sprite.scale);
        tween.to({x:1, y:1}, 500);
        tween.easing(game.Tween.Easing.Back.Out);
        tween.start();


        this.body = new game.Body({
            position: {
                x: x + this.sprite.width,
                y: y
            },
            collisionGroup: 2
        });

        this.body.parent = this;
        this.body.velocity.x = -600;
        var shape = new game.Rectangle(40, 60);
        this.body.addShape(shape);
        game.scene.objectContainer.addChild(this.sprite);
        game.scene.world.addBody(this.body);
        game.scene.addObject(this);
    },

    remove: function() {
        game.scene.world.removeBody(this.body);
        game.scene.objectContainer.removeChild(this.sprite);
        game.scene.removeObject(this);
    },

    update: function() {
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;

        if (this.body.position.x + this.sprite.width / 2 < 0) this.remove();
    }
});

game.createClass('Tires', {
    init: function(x, y) {
        this.sprite = new game.Sprite('tires.png');


        var rand = Math.random();
        if (rand <= 0.33) {
            this.sprite = new game.Sprite('crate_01.png');
        } 
        else if (rand <= 0.33 && rand > 0.66) {
            this.sprite = new game.Sprite('crate_02.png');
        }
        else {
            this.sprite = new game.Sprite('wall.png');        
        }

        this.sprite.anchor.set(0.5, 0.5);

        this.body = new game.Body({
            position: {
                x: x + this.sprite.width,
                y: y
            },
            collisionGroup: 3
        });

        this.body.velocity.x = -600;
        var shape = new game.Rectangle(this.sprite.width, this.sprite.height);
        this.body.addShape(shape);
        game.scene.objectContainer.addChild(this.sprite);
        game.scene.world.addBody(this.body);
        game.scene.addObject(this);
    },

    remove: function() {
        game.scene.world.removeBody(this.body);
        game.scene.objectContainer.removeChild(this.sprite);
        game.scene.removeObject(this);
    },

    update: function() {
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;

        if (this.body.position.x + this.sprite.width / 2 < 0) this.remove();
    }
});

game.createClass('Oneway', {
    init: function(x, y) {
        this.sprite = new game.Sprite('oneway.png');
        this.sprite.anchor.set(0.5, 0.5);

        this.body = new game.Body({
            position: {
                x: x + this.sprite.width,
                y: y
            },
            collisionGroup: 4
        });

        this.body.velocity.x = -600;
        var shape = new game.Rectangle(this.sprite.width, this.sprite.height);
        this.body.addShape(shape);
        game.scene.objectContainer.addChild(this.sprite);
        game.scene.world.addBody(this.body);
        game.scene.addObject(this);
    },

    remove: function() {
        game.scene.world.removeBody(this.body);
        game.scene.objectContainer.removeChild(this.sprite);
        game.scene.removeObject(this);
    },

    update: function() {
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;

        if (this.body.position.x + this.sprite.width / 2 < 0) this.remove();
    }
});

});
