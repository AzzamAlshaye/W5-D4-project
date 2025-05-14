(() => {
  const apiBase = "https://68243c9365ba0580339965d9.mockapi.io/login";
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  if (!username || !userId) {
    // Grab the container and ensure it can be overlaid
    const container = document.getElementById("game-container");
    container.style.position = "relative";

    // Create the semi-transparent overlay
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999",
      color: "#fff",
      fontSize: "24px",
      textAlign: "center",
      padding: "1rem",
      boxSizing: "border-box",
    });
    overlay.textContent = "🔒 You must be logged in to play.";

    // (Optional) Add a button to go to login
    const btn = document.createElement("button");
    btn.textContent = "Go to Login";
    Object.assign(btn.style, {
      marginTop: "1rem",
      padding: "0.5rem 1rem",
      fontSize: "18px",
      cursor: "pointer",
    });
    btn.addEventListener("click", () => {
      window.location.href = "./login.html";
    });
    overlay.appendChild(btn);

    container.appendChild(overlay);
    return; // stop loading the rest of the game
  }

  // ─── CONSTANTS ──────────────────────────────────────────────────────────────
  const WORLD_WIDTH = 2500;
  const WORLD_HEIGHT = 600;

  // ─── STATIC LEVELS 1 & 2 ────────────────────────────────────────────────────
  const levelConfigs = [
    {
      // Level 1
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
      // Level 2
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
    {
      // Level 3
      platforms: [
        { x: 300, y: 220, tileCount: 6 },
        { x: 800, y: 400, tileCount: 6 },
        { x: 1300, y: 250, tileCount: 7 },
        { x: 1800, y: 350, tileCount: 6 },
        { x: 2200, y: 180, tileCount: 4 },
      ],
      trophies: { repeat: 8, startX: 150, startY: 50, stepX: 250 },
      enemies: [
        { x: 500, y: 300 },
        { x: 1000, y: 350 },
        { x: 1600, y: 280 },
        { x: 2100, y: 320 },
      ],
    },
    {
      // Level 4
      platforms: [
        { x: 240, y: 300, tileCount: 6 },
        { x: 650, y: 450, tileCount: 6 },
        { x: 1100, y: 220, tileCount: 5 },
        { x: 1550, y: 400, tileCount: 9 },
        { x: 2000, y: 300, tileCount: 4 },
      ],
      trophies: { repeat: 10, startX: 100, startY: 75, stepX: 220 },
      enemies: [
        { x: 400, y: 250 },
        { x: 900, y: 420 },
        { x: 1350, y: 360 },
        { x: 1800, y: 260 },
        { x: 2300, y: 310 },
      ],
    },
  ];

  // ─── HELPER: RANDOM LEVEL GENERATOR ─────────────────────────────────────────
  function generateRandomLevelConfig() {
    // Random number of platforms
    const platCount = Phaser.Math.Between(5, 8);
    const platforms = [];
    for (let i = 0; i < platCount; i++) {
      platforms.push({
        x: Phaser.Math.Between(200, WORLD_WIDTH - 200),
        y: Phaser.Math.Between(150, WORLD_HEIGHT - 150),
        tileCount: Phaser.Math.Between(4, 10),
      });
    }

    // Random trophies
    const repeat = Phaser.Math.Between(6, 12);
    const startX = Phaser.Math.Between(50, WORLD_WIDTH / 2);
    const startY = Phaser.Math.Between(0, 100);
    const stepX = Phaser.Math.Between(100, 180);

    // Random enemies
    const enemyCount = Phaser.Math.Between(3, 6);
    const enemies = [];
    for (let i = 0; i < enemyCount; i++) {
      enemies.push({
        x: Phaser.Math.Between(100, WORLD_WIDTH - 100),
        y: Phaser.Math.Between(100, WORLD_HEIGHT - 200),
      });
    }

    return {
      platforms,
      trophies: { repeat, startX, startY, stepX },
      enemies,
    };
  }

  // ─── MENU SCENE ─────────────────────────────────────────────────────────────
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

      const rules = [
        "• Each star = 1pt",
        "• Kill enemy = 2pt",
        "• Reach flag ASAP",
        "• Timer runs",
      ].join("\n");
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
          } else info.setVisible(!info.visible);
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

  // ─── GAME SCENE ─────────────────────────────────────────────────────────────
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

      // If this is Level 3 or 4, generate on-the-fly if needed
      if (lvl >= 2 && !levelConfigs[lvl].platforms) {
        levelConfigs[lvl] = generateRandomLevelConfig();
      }

      // Reset timer & background
      this.startTime = this.time.now;
      this.add
        .tileSprite(0, 0, this.scale.width, this.scale.height, "sky")
        .setOrigin(0)
        .setScrollFactor(0);

      // World bounds & camera
      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // Ground
      const img = this.textures.get("ground").getSourceImage();
      const scaleF = 45 / img.height,
        tileW = img.width * scaleF;
      this.platforms = this.physics.add.staticGroup();
      for (let i = 0; i < Math.ceil(WORLD_WIDTH / tileW); i++) {
        this.platforms
          .create(i * tileW, WORLD_HEIGHT, "ground")
          .setOrigin(0, 1)
          .setDisplaySize(tileW, 45)
          .refreshBody();
      }
      // Custom platforms
      levelConfigs[lvl].platforms.forEach((p) => {
        const total = tileW * p.tileCount,
          start = p.x - total / 2;
        for (let i = 0; i < p.tileCount; i++) {
          this.platforms
            .create(start + i * tileW, p.y, "ground")
            .setOrigin(0, 0.5)
            .setDisplaySize(tileW, 45)
            .refreshBody();
        }
      });

      // Player
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

      // Trophies
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

      // Enemies
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

      // Flag
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

      // HUD & Controls
      this.levelText = this.add
        .text(16, 16, `Level ${lvl + 1}`, { fontSize: "24px", fill: "#fff" })
        .setScrollFactor(0);
      this.scoreText = this.add
        .text(16, 48, "0 pts", { fontSize: "24px", fill: "#fff" })
        .setScrollFactor(0);
      this.timerText = this.add
        .text(16, 80, "Time: 0s", { fontSize: "24px", fill: "#fff" })
        .setScrollFactor(0);
      this.controlsText = this.add
        .text(this.scale.width - 16, 16, "R: Restart\nEsc: Menu", {
          fontSize: "18px",
          fill: "#fff",
          align: "right",
        })
        .setOrigin(1, 0)
        .setScrollFactor(0);

      this.input.keyboard.once("keydown-R", () =>
        this.scene.restart({ level: lvl })
      );
      this.input.keyboard.on("keydown-ESC", () =>
        this.scene.start("MenuScene")
      );

      this.isDead = false;
      this.levelComplete = false;
      this.collected = 0;
    }
    update() {
      if (this.isDead || this.levelComplete) return;
      const cursors = this.input.keyboard.createCursorKeys();
      if (cursors.left.isDown)
        this.player.setVelocityX(-160).anims.play("left", true);
      else if (cursors.right.isDown)
        this.player.setVelocityX(160).anims.play("right", true);
      else this.player.setVelocityX(0).anims.play("turn");

      if (cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
      }

      const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
      this.timerText.setText(`Time: ${elapsed}s`);
    }
  }

  // ─── LEADERBOARD SCENE ─────────────────────────────────────────────────────
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
            pts: u[`level${lvl}Points`],
            time: u[`level${lvl}Time`],
          }))
          .filter((u) => u.time != null)
          .sort((a, b) => a.time - b.time);

      // Layout for 4 levels: 2x2 grid
      const layout = [
        { lvl: 1, x: width * 0.25, y: 120 },
        { lvl: 2, x: width * 0.75, y: 120 },
        { lvl: 3, x: width * 0.25, y: 360 },
        { lvl: 4, x: width * 0.75, y: 360 },
      ];
      layout.forEach(({ lvl, x, y }) => {
        const list = makeList(lvl).slice(0, 10);
        this.add
          .text(x, y, `Level ${lvl}`, { font: "32px Arial", fill: "#fff" })
          .setOrigin(0.5);
        list.forEach((u, i) => {
          this.add.text(
            x - 150,
            y + 40 + i * 24,
            `${i + 1}. ${u.name} — ${u.pts}pts — ${u.time}s`,
            { font: "20px Arial", fill: "#fff" }
          );
        });
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

  // ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────
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
          {
            font: "32px Arial",
            fill: "#fff",
            backgroundColor: "#000",
            align: "center",
          }
        )
        .setOrigin(0.5);
    }
  }

  async function reachFlag(lvl) {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.physics.pause();

    const pts = this.collected;
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);

    const cam = this.cameras.main;
    this.add
      .text(
        cam.scrollX + cam.width / 2,
        cam.height / 2,
        `🏁 Level ${
          lvl + 1
        } complete!\n${pts} pts in ${elapsed}s\nClick R to continue`,
        {
          font: "32px Arial",
          fill: "#fff",
          backgroundColor: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Update API
    await fetch(`${apiBase}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [`level${lvl + 1}Points`]: pts }),
    }).catch(console.error);

    await fetch(`${apiBase}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [`level${lvl + 1}Time`]: elapsed }),
    }).catch(console.error);

    this.input.keyboard.once("keydown-R", () => {
      const next = lvl + 1;
      if (next < levelConfigs.length) this.scene.restart({ level: next });
      else this.scene.start("MenuScene");
    });
  }

  // ─── BOOT THE GAME ─────────────────────────────────────────────────────────
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    width: 800,
    height: WORLD_HEIGHT,
    physics: { default: "arcade", arcade: { gravity: { y: 300 } } },
    scene: [MenuScene, GameScene, LeaderboardScene],
  });
})();
