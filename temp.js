(() => {
  const apiBase = "https://68243c9365ba0580339965d9.mockapi.io/login";
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  if (!username || !userId) {
    alert("Please log in to play.");
    window.location.href = "./login.html";
    return;
  }

  const levelConfigs = [
    {
      platforms: [
        { x: 400, y: 450, tileCount: 8 },
        { x: 700, y: 300, tileCount: 6 },
        { x: 1200, y: 400, tileCount: 8 },
        { x: 1500, y: 250, tileCount: 4 },
        { x: 1750, y: 150, tileCount: 10 },
      ],
      trophies: { repeat: 10, startX: 180, startY: 0, stepX: 200 },
      enemies: [
        { x: 400, y: 350 },
        { x: 600, y: 350 },
        { x: 1200, y: 350 },
        { x: 1500, y: 350 },
      ],
    },
    {
      platforms: [
        { x: 500, y: 350, tileCount: 10 },
        { x: 900, y: 500, tileCount: 8 },
        { x: 1200, y: 100, tileCount: 8 },
        { x: 1300, y: 200, tileCount: 8 },
        { x: 1500, y: 350, tileCount: 8 },
      ],
      trophies: { repeat: 10, startX: 200, startY: 0, stepX: 100 },
      enemies: [
        { x: 450, y: 320 },
        { x: 800, y: 420 },
        { x: 1200, y: 420 },
      ],
    },
  ];

  const WORLD_WIDTH = 2500;
  const WORLD_HEIGHT = 600;

  class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: "MenuScene" });
    }
    preload() {
      this.load.image("menuBG", "./assests/images/gameBackGround.png");
    }
    create() {
      const w = this.scale.width,
        h = this.scale.height;
      this.add.image(0, 0, "menuBG").setOrigin(0).setDisplaySize(w, h);

      this.add
        .text(w / 2, h / 4, "🎮 Shroom Destroyer", {
          font: "48px Arial",
          fill: "#fff",
        })
        .setOrigin(0.5);

      this.add
        .text(w / 2, h / 2 - 40, "▶ Play", { font: "32px Arial", fill: "#0f0" })
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerup", () => this.scene.start("GameScene", { level: 0 }));

      const rules =
        "• Each star = 1pt\n" +
        "• Kill enemy = 2pt\n" +
        "• Reach flag ASAP\n" +
        "• Timer runs";
      let info;
      this.add
        .text(w / 2, h / 2 + 10, "📜 Rules", {
          font: "32px Arial",
          fill: "#ff0",
        })
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerup", () => {
          if (!info) {
            info = this.add
              .text(w / 2, h * 0.75, rules, {
                font: "20px Arial",
                fill: "#000",
                align: "center",
                wordWrap: { width: 600 },
              })
              .setOrigin(0.5);
          } else {
            info.setVisible(!info.visible);
          }
        });

      this.add
        .text(w / 2, h / 2 + 80, "🏆 Leaderboard", {
          font: "32px Arial",
          fill: "#000",
        })
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerup", () => this.scene.start("LeaderboardScene"));
    }
  }

  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: "GameScene" });
    }
    preload() {
      this.load.image("sky", "./assests/images/gameBackGround.png");
      this.load.image("ground", "./assests/images/platform.webp");
      this.load.image(
        "trophy",
        "https://png.pngtree.com/png-vector/20220824/ourmid/pngtree-star-png-vector-icon-ui-game-png-image_6121753.png"
      );
      this.load.spritesheet(
        "player",
        "https://labs.phaser.io/assets/sprites/dude.png",
        { frameWidth: 32, frameHeight: 48 }
      );
      this.load.image("goomba", "./assests/images/goomba.png");
      this.load.image("flag", "./assests/images/flag.png");
    }
    create(data) {
      const lvl = data.level || 0;

      if (!localStorage.getItem("username")) {
        alert("Please log in to play.");
        return void (window.location.href = "./login.html");
      }

      // reset timer
      this.startTime = this.time.now;

      // background fixed
      this.add
        .tileSprite(0, 0, this.scale.width, this.scale.height, "sky")
        .setOrigin(0)
        .setScrollFactor(0);

      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // build platforms...
      const img = this.textures.get("ground").getSourceImage();
      const scaleF = 45 / img.height;
      const tileW = img.width * scaleF;
      this.platforms = this.physics.add.staticGroup();
      for (let i = 0; i < Math.ceil(WORLD_WIDTH / tileW); i++) {
        this.platforms
          .create(i * tileW, WORLD_HEIGHT, "ground")
          .setOrigin(0, 1)
          .setDisplaySize(tileW, 45)
          .refreshBody();
      }
      levelConfigs[lvl].platforms.forEach((p) => {
        const count = p.tileCount || 1;
        const total = tileW * count;
        const start = p.x - total / 2;
        for (let i = 0; i < count; i++) {
          this.platforms
            .create(start + i * tileW, p.y, "ground")
            .setOrigin(0, 0.5)
            .setDisplaySize(tileW, 45)
            .refreshBody();
        }
      });

      // player setup...
      this.player = this.physics.add
        .sprite(100, 450, "player")
        .setBounce(0.2)
        .setCollideWorldBounds(true);
      this.physics.add.collider(this.player, this.platforms);
      this.cameras.main.startFollow(this.player);

      this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({ key: "turn", frames: [{ key: "player", frame: 4 }] });
      this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("player", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
      });

      // trophies & enemies...
      const t = levelConfigs[lvl].trophies;
      this.trophies = this.physics.add.group();
      for (let i = 0; i <= t.repeat; i++) {
        this.trophies
          .create(t.startX + i * t.stepX, t.startY, "trophy")
          .setBounceY(Phaser.Math.FloatBetween(0.4, 0.4))
          .setScale(0.2);
      }
      this.physics.add.collider(this.trophies, this.platforms);
      this.physics.add.overlap(
        this.player,
        this.trophies,
        collectTrophy,
        null,
        this
      );

      this.enemies = this.physics.add.group();
      levelConfigs[lvl].enemies.forEach((pos) => {
        const e = this.enemies
          .create(pos.x, pos.y, "goomba")
          .setScale(0.1)
          .setCollideWorldBounds(true);
        const speed = Phaser.Math.Between(50, 100);
        e.setVelocity(
          speed * (Phaser.Math.Between(0, 1) ? 1 : -1),
          -Phaser.Math.Between(50, 100)
        );
        e.body.allowGravity = true;
        e.setBounce(1, 0.3);
      });
      this.physics.add.collider(this.enemies, this.platforms);
      this.physics.add.overlap(
        this.player,
        this.enemies,
        stompEnemy,
        null,
        this
      );

      // flag overlap...
      const floorY = WORLD_HEIGHT - 45;
      this.flag = this.physics.add
        .staticImage(WORLD_WIDTH - 50, floorY, "flag")
        .setScale(0.24)
        .refreshBody();
      this.physics.add.overlap(
        this.player,
        this.flag,
        () => reachFlag.call(this, lvl),
        null,
        this
      );

      // HUD
      this.levelText = this.add
        .text(16, 16, `Level ${lvl + 1}`, { fontSize: "24px", fill: "#fff" })
        .setScrollFactor(0);
      this.scoreText = this.add
        .text(16, 48, "0 pts", { fontSize: "24px", fill: "#fff" })
        .setScrollFactor(0);
      this.timerText = this.add
        .text(16, 80, "Time: 0s", { fontSize: "24px", fill: "#fff" })
        .setScrollFactor(0);

      const w = this.scale.width;
      this.controlsText = this.add
        .text(w - 16, 16, "R: Restart\nEsc: Menu", {
          fontSize: "18px",
          fill: "#fff",
          align: "right",
        })
        .setOrigin(1, 0)
        .setScrollFactor(0);
      // R to retry
      this.input.keyboard.once("keydown-R", () => {
        this.scene.restart({ level: lvl });
      });

      // ESC to go back to menu (and kill this scene)
      this.input.keyboard.on("keydown-ESC", () => {
        this.scene.start("MenuScene");
      });

      this.isDead = false;
      this.levelComplete = false;
      this.collected = 0;
    }

    update() {
      if (this.isDead || this.levelComplete) return;

      const cursors = this.input.keyboard.createCursorKeys();
      if (cursors.left.isDown) {
        this.player.setVelocityX(-160).anims.play("left", true);
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(160).anims.play("right", true);
      } else {
        this.player.setVelocityX(0).anims.play("turn");
      }
      if (cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
      }

      // update timer display
      const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
      this.timerText.setText(`Time: ${elapsed}s`);
    }
  }

  class LeaderboardScene extends Phaser.Scene {
    constructor() {
      super({ key: "LeaderboardScene" });
    }
    async create() {
      const { width, height } = this.cameras.main;
      this.add
        .text(width / 2, 40, "🏆 Leaderboard", {
          font: "48px Arial",
          fill: "#fff",
        })
        .setOrigin(0.5);

      const data = await fetch(apiBase).then((r) => r.json());
      const makeList = (lvl) =>
        data
          .map((u) => ({
            name: u.username,
            time: u[`level${lvl}Time`],
            pts: u[`level${lvl}Points`],
          }))
          .filter((u) => u.time != null)
          .sort((a, b) => a.time - b.time);

      const lb1 = makeList(1),
        lb2 = makeList(2);

      this.add
        .text(width * 0.25, 120, "Level 1", {
          font: "32px Arial",
          fill: "#fff",
        })
        .setOrigin(0.5);
      lb1.slice(0, 10).forEach((u, i) =>
        this.add.text(
          width * 0.1,
          160 + i * 24,
          `${i + 1}. ${u.name} — ${u.pts}pts — ${u.time}s`,
          {
            font: "20px Arial",
            fill: "#fff",
          }
        )
      );

      this.add
        .text(width * 0.75, 120, "Level 2", {
          font: "32px Arial",
          fill: "#fff",
        })
        .setOrigin(0.5);
      lb2.slice(0, 10).forEach((u, i) =>
        this.add.text(
          width * 0.6,
          160 + i * 24,
          `${i + 1}. ${u.name} — ${u.pts}pts — ${u.time}s`,
          {
            font: "20px Arial",
            fill: "#fff",
          }
        )
      );

      this.add
        .text(width / 2, height - 40, "← Back", {
          font: "28px Arial",
          fill: "#f00",
        })
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerup", () => this.scene.start("MenuScene"));
    }
  }

  function collectTrophy(player, trophy) {
    trophy.disableBody(true, true);
    this.collected++;
    this.scoreText.setText(`${this.collected} pts`);
  }

  function stompEnemy(player, enemy) {
    if (player.body.velocity.y > 0 && player.y < enemy.y) {
      enemy.disableBody(true, true);
      player.setVelocityY(-300);
      this.collected += 2;
      this.scoreText.setText(`${this.collected} pts`);
    } else {
      this.physics.pause();
      this.player.setTint(0xff0000);
      this.isDead = true;
      const cam = this.cameras.main;
      this.add
        .text(
          cam.scrollX + cam.width / 2,
          cam.height / 2,
          "💀 You died! Click R to retry",
          { font: "32px Arial", fill: "#fff", backgroundColor: "#000" }
        )
        .setOrigin(0.5);
    }
  }

  async function reachFlag(lvl) {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.physics.pause();

    const collectedThisLevel = this.collected;
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);

    const cam = this.cameras.main;
    this.add
      .text(
        cam.scrollX + cam.width / 2,
        cam.height / 2,
        `🏁 Level ${
          lvl + 1
        } complete!\n${collectedThisLevel} pts in ${elapsed}s\nClick R to continue`,
        {
          font: "32px Arial",
          fill: "#fff",
          backgroundColor: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // send points
    await fetch(`${apiBase}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [`level${lvl + 1}Points`]: collectedThisLevel }),
    }).catch(console.error);

    // send time
    await fetch(`${apiBase}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [`level${lvl + 1}Time`]: elapsed }),
    }).catch(console.error);

    this.input.keyboard.once("keydown-R", () => {
      const next = lvl + 1;
      if (next < levelConfigs.length) {
        this.scene.restart({ level: next });
      } else {
        this.scene.start("MenuScene");
      }
    });
  }

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    width: 800,
    height: WORLD_HEIGHT,
    physics: { default: "arcade", arcade: { gravity: { y: 300 } } },
    scene: [MenuScene, GameScene, LeaderboardScene],
  });
})();
