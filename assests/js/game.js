(() => {
  const apiBase = "https://68243c9365ba0580339965d9.mockapi.io/login";

  // ─── LEVEL CONFIGS ─────────────────────────────────────────────────────────
  const levelConfigs = [
    {
      // floating platforms
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
        { x: 800, y: 420 },
        { x: 800, y: 420 },
        { x: 800, y: 420 },
        { x: 1200, y: 420 },
      ],
    },
  ];
  // const levelConfigs = [
  //   {
  //     platforms: [
  //       { x: 400, y: 450, tileCount: 8 },
  //       { x: 700, y: 300, tileCount: 4 },
  //       { x: 1200, y: 450, tileCount: 8 },
  //     ],
  //     trophies: { repeat: 5, startX: 150, startY: 0, stepX: 200 },
  //     enemies: [
  //       { x: 400, y: 350 },
  //       { x: 700, y: 250 },
  //       { x: 1200, y: 350 },
  //     ],
  //   },
  //   {
  //     platforms: [
  //       { x: 500, y: 350, tileCount: 4 },
  //       { x: 900, y: 500, tileCount: 8 },
  //       { x: 1200, y: 350, tileCount: 4 },
  //     ],
  //     trophies: { repeat: 3, startX: 260, startY: 0, stepX: 300 },
  //     enemies: [
  //       { x: 500, y: 300 },
  //       { x: 900, y: 300 },
  //       { x: 800, y: 420 },
  //     ],
  //   },
  // ];

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
      const w = this.scale.width;
      const h = this.scale.height;

      // menu background fills entire canvas
      this.add.image(0, 0, "menuBG").setOrigin(0).setDisplaySize(w, h);

      this.add
        .text(w / 2, h / 4, "🎮 My Phaser Game", {
          font: "48px Arial",
          fill: "#ffffff",
        })
        .setOrigin(0.5);

      this.add
        .text(w / 2, h / 2 - 40, "▶ Play", {
          font: "32px Arial",
          fill: "#0f0",
        })
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerup", () => this.scene.start("GameScene", { level: 0 }));

      const rulesText =
        "• Each star gives you 1 point\n" +
        "• Killing an enemy gives you 2 points\n" +
        "• Goal: reach the flag as fast as possible\n" +
        "• Timer is running";
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
              .text(w / 2, h * 0.75, rulesText, {
                font: "20px Arial",
                fill: "#fff",
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
          fill: "#000000",
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
      const lvl = data.level ?? 0;

      // auth check
      const username = localStorage.getItem("username");
      const userId = localStorage.getItem("userId");
      if (!username || !userId) {
        alert("Please log in to play.");
        return void (window.location.href = "./login.html");
      }

      // fixed background
      this.add
        .tileSprite(0, 0, this.scale.width, this.scale.height, "sky")
        .setOrigin(0)
        .setScrollFactor(0);

      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // brick sizing
      const groundImg = this.textures.get("ground").getSourceImage();
      const nativeW = groundImg.width;
      const nativeH = groundImg.height;
      const targetH = 45;
      const scaleFactor = targetH / nativeH;
      const tileW = nativeW * scaleFactor;

      // floor (tiled)
      this.platforms = this.physics.add.staticGroup();
      const repeatCount = Math.ceil(WORLD_WIDTH / tileW);
      for (let i = 0; i < repeatCount; i++) {
        this.platforms
          .create(i * tileW, WORLD_HEIGHT, "ground")
          .setOrigin(0, 1)
          .setDisplaySize(tileW, targetH)
          .refreshBody();
      }

      // floating platforms
      levelConfigs[lvl].platforms.forEach((p) => {
        const count = p.tileCount || 1;
        const totalW = tileW * count;
        const startX = p.x - totalW / 2;
        for (let i = 0; i < count; i++) {
          this.platforms
            .create(startX + i * tileW, p.y, "ground")
            .setOrigin(0, 0.5)
            .setDisplaySize(tileW, targetH)
            .refreshBody();
        }
      });

      // player
      this.player = this.physics.add
        .sprite(100, 450, "player")
        .setBounce(0.2)
        .setCollideWorldBounds(true);
      this.physics.add.collider(this.player, this.platforms);
      this.cameras.main.startFollow(this.player);

      // animations
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

      // trophies & score
      const tcfg = levelConfigs[lvl].trophies;
      this.trophies = this.physics.add.group();
      for (let i = 0; i <= tcfg.repeat; i++) {
        const x = tcfg.startX + i * tcfg.stepX;
        this.trophies
          .create(x, tcfg.startY, "trophy")
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

      this.collected = 0;
      this.scoreText = this.add
        .text(16, 48, `0 pts`, {
          fontSize: "24px",
          fill: "#ffffff",
        })
        .setScrollFactor(0);

      // enemies
      this.enemies = this.physics.add.group();
      levelConfigs[lvl].enemies.forEach((pos) => {
        const e = this.enemies
          .create(pos.x, pos.y, "goomba")
          .setScale(0.1)
          .setCollideWorldBounds(true);
        const speed = Phaser.Math.Between(50, 100);
        const dir = Phaser.Math.Between(0, 1) ? 1 : -1;
        e.setVelocityX(speed * dir);
        e.setVelocityY(-Phaser.Math.Between(50, 100));
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

      // flag
      const floorTop = WORLD_HEIGHT - targetH;
      this.flag = this.physics.add
        .staticImage(WORLD_WIDTH - 50, floorTop, "flag")
        .setScale(0.24)
        .refreshBody();
      this.physics.add.overlap(
        this.player,
        this.flag,
        () => reachFlag.call(this, lvl),
        null,
        this
      );

      // HUD & timer
      this.cursors = this.input.keyboard.createCursorKeys();
      this.startTime = this.time.now;
      this.timerText = this.add
        .text(16, 16, "Time: 0s", {
          fontSize: "24px",
          fill: "#ffffff",
        })
        .setScrollFactor(0);

      this.isDead = false;
      this.levelComplete = false;
    }
    update() {
      if (this.isDead || this.levelComplete) return;
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160).anims.play("left", true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160).anims.play("right", true);
      } else {
        this.player.setVelocityX(0).anims.play("turn");
      }
      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
      }
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
          fill: "#ffffff",
        })
        .setOrigin(0.5);

      let data = await fetch(apiBase).then((r) => r.json());
      const makeList = (lvl) =>
        data
          .map((u) => ({
            name: u.username,
            time: u[`level${lvl}Time`],
            pts: u[`level${lvl}Points`],
          }))
          .filter((u) => u.time != null)
          .sort((a, b) => a.time - b.time);

      const [lb1, lb2] = [makeList(1), makeList(2)];

      this.add
        .text(width * 0.25, 120, "Level 1", {
          font: "32px Arial",
          fill: "#fff",
        })
        .setOrigin(0.5);
      lb1.slice(0, 10).forEach((u, i) => {
        this.add.text(
          width * 0.1,
          160 + i * 24,
          `${i + 1}. ${u.name} — ${u.pts}pts — ${u.time}s`,
          { font: "20px Arial", fill: "#fff" }
        );
      });

      this.add
        .text(width * 0.75, 120, "Level 2", {
          font: "32px Arial",
          fill: "#fff",
        })
        .setOrigin(0.5);
      lb2.slice(0, 10).forEach((u, i) => {
        this.add.text(
          width * 0.6,
          160 + i * 24,
          `${i + 1}. ${u.name} — ${u.pts}pts — ${u.time}s`,
          { font: "20px Arial", fill: "#fff" }
        );
      });

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

  // overlap handlers
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
      player.setTint(0xff0000);
      this.isDead = true;
      this.add
        .text(
          this.cameras.main.midPoint.x,
          this.cameras.main.midPoint.y,
          "💀 You died! Click to retry",
          { font: "32px Arial", fill: "#fff", backgroundColor: "#000" }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerup", () =>
          this.scene.restart({ level: this.scene.settings.data.level })
        );
    }
  }
  async function reachFlag(lvl) {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.physics.pause();
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    this.add
      .text(
        this.cameras.main.midPoint.x,
        this.cameras.main.midPoint.y,
        `🏁 Level ${lvl + 1} complete!\n${
          this.collected
        } pts in ${elapsed}s\nClick to continue`,
        {
          font: "32px Arial",
          fill: "#fff",
          backgroundColor: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerup", () => {
        const next = lvl + 1;
        if (next < levelConfigs.length) {
          this.scene.start("GameScene", { level: next });
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
