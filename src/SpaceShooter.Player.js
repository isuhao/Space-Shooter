SpaceShooter.Bullet = function () {

    SpaceShooter.Element.call(this);
    this.name = 'bullet';
    this.stats = {
        damage: 1
    };
    this.collisionList = [
        'enemy'
    ];

    this.properties = {
        speed: {
            x: 0,
            y: -20
        }
    };
    this.radius = 5;
};

SpaceShooter.Bullet.prototype = Object.create(SpaceShooter.Element.prototype);
SpaceShooter.Bullet.prototype.constructor = SpaceShooter.Bullet;

SpaceShooter.Bullet.prototype.reset = function () {

    this.speed = {
        x: 0,
        y: 0
    };
    this.radius = 5;
    this.object.visible = false;
    this.object.position.x = 0;
    this.object.position.y = 0;
    this.object.beginFill(0xff0000, 1);
    this.object.drawCircle(this.object.position.x, this.object.position.y, this.radius);

};

SpaceShooter.Bullet.prototype.init = function () {
    this.object = new PIXI.Graphics();
    this.reset();
};
SpaceShooter.Bullet.prototype.shoot = function (x, y) {
    this.object.visible = true;
    this.object.position.x = x;
    this.object.position.y = y;
    this.speed = {
        x: this.properties.speed.x,
        y: this.properties.speed.y
    }
};
SpaceShooter.Bullet.prototype.update = function (time) {
    if (false !== SpaceShooter.Element.prototype.update.call(this, time)) {
        this.object.position.y += this.speed.y;
        this.object.position.x += this.speed.x;
        if (this.object.position.y < -5) {
            this.reset();
        }
    }
};
SpaceShooter.Bullet.prototype.collision = function (target) {
    if (target.name == 'enemy') {
        SpaceShooter.Tools.addHitSparkles(this.object.position.x, this.object.position.y, 0xff0000);
        target.damage(this.stats.damage);
    }
    this.reset();
};

SpaceShooter.Ship = function () {

    SpaceShooter.Element.call(this);
    this.playerId = 0;
    this.speed = {
        x: 0,
        y: 0
    };
    this.shooting = false;
    this.maxSpeed = 60;
    this.maxSpeedY = 10;
    this.stats = {
        score: 0,
        hp: 50,
        damage: 5
    };
    this.name = 'ship'; // initial name so enemies can't hit it. Will be 'ship'
    //this.hitArea = new PIXI.Rectangle(0,0,55,135);
    this.imuumCountdown = 300;
    this.currentTexture = 5;
    //this.collisionList = [
    //    'enemy'
    //];

    this.textures = [
        'smallfighter0001.png',
        'smallfighter0002.png',
        'smallfighter0003.png',
        'smallfighter0004.png',
        'smallfighter0005.png',
        'smallfighter0006.png',
        'smallfighter0007.png',
        'smallfighter0008.png',
        'smallfighter0009.png',
        'smallfighter0010.png',
        'smallfighter0011.png'
    ];
    this.textureSpeed = (this.maxSpeed * 2) / this.textures.length;
    this.tint = randomColor({luminosity: 'light'}).replace(/#/, '0x');
    this.originalTint = this.tint;

    this.bullets = [];
    this.bulletCounter = 5;
    for (var i = 0; i < 20; i++) {
        var bullet = new SpaceShooter.Bullet();
        bullet.init();
        bullet.add();
        this.bullets.push(bullet);
    }

};

SpaceShooter.Ship.prototype = Object.create(SpaceShooter.Element.prototype);
SpaceShooter.Ship.prototype.constructor = SpaceShooter.Ship;

SpaceShooter.Ship.prototype.init = function () {
    SpaceShooter.Element.prototype.init.call(this);
    this.object.tint = this.tint;
    this.object.zIndex = 11;
};

SpaceShooter.Ship.prototype.setSpeed = function (x, y) {
    if (x > this.maxSpeed) {
        x = this.maxSpeed;
    }
    else if (x < -(this.maxSpeed)) {
        x = -(this.maxSpeed);
    }
    if (y > this.maxSpeedY) {
        y = this.maxSpeedY;
    }
    else if (y < -(this.maxSpeedY)) {
        y = -(this.maxSpeedY);
    }
    this.speed = {
        x: x,
        y: y
    }
};

SpaceShooter.Ship.prototype.collision = function (element) {
    if (this.imuumCountdown <= 0 && element.stats != null && element.stats.damage != null) {
        this.stats.hp -= element.stats.damage;
    }
    if (element.stats != null && element.stats.hp != null) {
        element.damage(this.stats.damage);
    }
    if (this.stats.hp <= 0) {
        this.died();
        return;
    }
    var halfX = this.object.width / 2;
    var randomX = getRandom(this.object.position.x - halfX, this.object.position.x + halfX);
    var halfY = this.object.height / 2;
    var randomY = getRandom(this.object.position.y - halfY, this.object.position.y + halfY);
    SpaceShooter.Tools.addHitSparkles(randomX, randomY, this.object.tint);
};

/**
 * Player died
 */
SpaceShooter.Ship.prototype.died = function () {

    this.name = 'ship';
    this.tint = this.originalTint;
    this.imuumCountdown = 300;
    this.stats.hp = 50;
    SpaceShooter.Tools.addExplosion(this.object.position.x, this.object.position.y, this.object.tint);
    this.object.position.x = renderer.width / 2;
    this.object.position.y = renderer.height - this.object.height - 20;
    this.speed.x = 0;
    this.speed.y = 0;
    vibrate(this.playerId, 600); // 36 frames on 60fps
    SpaceShooter.removeLife();

};

SpaceShooter.Ship.prototype.update = function () {
    if (this.object.visible == false) {
        return;
    }
    if (this.imuumCountdown > 0) {
        this.imuumCountdown--;
        if (this.imuumCountdown%20<10) {
            this.object.tint = 0x000000;
        }
        else {
            this.object.tint = this.originalTint;
        }
        if (this.imuumCountdown <= 0) {
            this.object.tint = this.originalTint;
        }
    }
    this.object.position.y += this.speed.y;
    this.object.position.x += this.speed.x;
    if (this.object.position.x < 0) {
        this.object.position.x = 0;
    }
    else if (this.object.position.x > SpaceShooter.settings.width) {
        this.object.position.x = SpaceShooter.settings.width;
    }
    if (this.object.position.y < 0) {
        this.object.position.y = 0;
    }
    else if (this.object.position.y > SpaceShooter.settings.height) {
        this.object.position.y = SpaceShooter.settings.height;
    }
    var texture = Math.floor(this.speed.x / this.textureSpeed) + Math.floor(this.textures.length / 2);
    if (texture < 0) {
        texture = 0;
    }
    else if (texture >= this.textures.length) {
        texture = this.textures.length - 1;
    }
    if (texture != this.currentTexture) {
        this.currentTexture = texture;
        this.object.texture = this.textures[this.currentTexture];
    }
    if (this.shooting == true) {
        this.bulletCounter--;
        if (this.bulletCounter <= 0) {
            for (var i = 0; i < this.bullets.length; i++) {
                if (!this.bullets[i].object.visible) {
                    this.bullets[i].shoot(this.object.position.x, this.object.position.y);
                    this.bulletCounter = 5;
                    break;
                }
            }
        }
    }

    // Do some collision detection here
    var collisionObject = this.checkCollision();
    if (collisionObject != false || this.object.position.y < 0) {
        if (collisionObject != false) {
            this.collision(collisionObject);
        }
    }
};