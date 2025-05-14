// game.js
(() => {
  const apiBase = "https://68243c9365ba0580339965d9.mockapi.io/login";
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  if (!username || !userId) {
    alert("Please log in to play.");
    window.location.href = "./login.html";
    return;
  }

  // ─── LEVEL CONFIGS ─────────────────────────────────────────────────────────
  const levelConfigs = [
    {
      platforms: [
        { x: 400, y: 450 },
        { x: 700, y: 300 },
        { x: 1200, y: 450 },
      ],
      trophies: { repeat: 5, startX: 150, startY: 0, stepX: 200 },
      enemies: [
        { x: 400, y: 350 },
        { x: 700, y: 250 },
        { x: 1200, y: 350 },
      ],
    },
    {
      platforms: [
        { x: 500, y: 350 },
        { x: 900, y: 500 },
        { x: 1200, y: 350 },
      ],
      trophies: { repeat: 3, startX: 260, startY: 0, stepX: 300 },
      enemies: [
        { x: 500, y: 300 },
        { x: 900, y: 300 },
        { x: 800, y: 420 },
      ],
    },
  ];

  let currentLevel = 0;
  let collectedThisLevel = 0;
  let totalCollected = 0;

  const WORLD_WIDTH = 1600;
  const WORLD_HEIGHT = 600;

  const config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 800,
    height: WORLD_HEIGHT,
    physics: {
      default: "arcade",
      arcade: { gravity: { y: 300 }, debug: false },
    },
    scene: { preload, create, update },
  };
  new Phaser.Game(config);

  function preload() {
    this.load.image("sky", "./assests/images/gameBackGround.png");
    this.load.image(
      "ground",
      "https://labs.phaser.io/assets/sprites/platform.png"
    );
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

  function create() {
    // ── background/world/camera ────────────────────────────────────────────────
    this.add.tileSprite(0, 0, 800, 600, "sky").setOrigin(0).setScrollFactor(0);

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // ── floor & platforms ──────────────────────────────────────────────────────
    this.platforms = this.physics.add.staticGroup();
    this.platforms
      .create(WORLD_WIDTH / 2, 584, "ground")
      .setDisplaySize(WORLD_WIDTH, 32)
      .refreshBody();
    levelConfigs[currentLevel].platforms.forEach((p) => {
      const plt = this.platforms.create(p.x, p.y, "ground");
      if (p.scale) plt.setScale(p.scale).refreshBody();
    });

    // ── player ─────────────────────────────────────────────────────────────────
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

    // ── trophies & score ───────────────────────────────────────────────────────
    const tcfg = levelConfigs[currentLevel].trophies;
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

    collectedThisLevel = 0;
    this.scoreText = this.add
      .text(
        16,
        48,
        `Level ${currentLevel + 1} – Collected: 0 (Total: ${totalCollected})`,
        {
          fontSize: "24px",
          fill: "#ffffff",
        }
      )
      .setScrollFactor(0);

    // ── Goombas ────────────────────────────────────────────────────────────────
    this.enemies = this.physics.add.group();
    levelConfigs[currentLevel].enemies.forEach((pos) => {
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

    // award 2 points on stomp, update score
    this.physics.add.overlap(
      this.player,
      this.enemies,
      (player, enemy) => {
        if (player.body.velocity.y > 0 && player.y < enemy.y) {
          enemy.disableBody(true, true);
          player.setVelocityY(-300);
          // add 2 points for killing a Goomba
          totalCollected += 2;
          this.scoreText.setText(
            `Level ${
              currentLevel + 1
            } – Collected: ${collectedThisLevel} (Total: ${totalCollected})`
          );
        } else {
          triggerDeath.call(this);
        }
      },
      null,
      this
    );

    // ── win flag at proper spot ────────────────────────────────────────────────
    const floorTop = 568;
    const flagX = WORLD_WIDTH - 50;
    this.flag = this.physics.add.staticImage(flagX, 0, "flag").setScale(0.24);
    const halfFlag = this.flag.displayHeight / 2;
    this.flag.setY(floorTop - halfFlag);
    this.flag.refreshBody();
    const b = this.flag.getBounds();
    this.add
      .graphics({ lineStyle: { width: 2, color: 0xff0000 } })
      .setScrollFactor(1)
      .strokeRect(b.x, b.y, b.width, b.height);
    this.physics.add.overlap(this.player, this.flag, reachFlag, null, this);

    // ── input & HUD ───────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-R", () => this.scene.restart());
    this.startTime = this.time.now;
    this.timerText = this.add
      .text(16, 16, "Time: 0s", { fontSize: "24px", fill: "#ffffff" })
      .setScrollFactor(0);
    this.add
      .text(600, 16, "Press R to restart", {
        fontSize: "18px",
        fill: "#ffffff",
      })
      .setScrollFactor(0);

    this.isDead = false;
    this.levelComplete = false;
  }

  function update() {
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
    if (this.player.y > WORLD_HEIGHT) {
      triggerDeath.call(this);
    }

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    this.timerText.setText(`Time: ${elapsed}s`);
  }

  // ─── handlers ────────────────────────────────────────────────────────────────

  async function collectTrophy(player, trophy) {
    trophy.disableBody(true, true);
    collectedThisLevel++;
    totalCollected++;
    this.scoreText.setText(
      `Level ${
        currentLevel + 1
      } – Collected: ${collectedThisLevel} (Total: ${totalCollected})`
    );
    try {
      await fetch(`${apiBase}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trophies: totalCollected }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  function triggerDeath() {
    if (this.isDead) return;
    this.isDead = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    const cam = this.cameras.main;
    this.add
      .text(
        cam.scrollX + cam.width / 2,
        cam.height / 2,
        "💀 You died! Click to retry",
        {
          fontSize: "32px",
          fill: "#ffffff",
          backgroundColor: "#000000",
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => this.scene.restart());
  }

  async function reachFlag() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.physics.pause();
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    try {
      await fetch(`${apiBase}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: elapsed }),
      });
    } catch (e) {
      console.error(e);
    }
    const cam = this.cameras.main;
    const isLast = currentLevel >= levelConfigs.length - 1;
    const msg = isLast
      ? `🎉 Game over! Your time: ${elapsed}s\nClick to restart.`
      : `🏁 Level ${
          currentLevel + 1
        } complete!\nTime: ${elapsed}s\nClick to continue.`;
    this.add
      .text(cam.scrollX + cam.width / 2, cam.height / 2, msg, {
        fontSize: "32px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => {
        if (isLast) {
          currentLevel = 0;
          totalCollected = 0;
        } else {
          currentLevel++;
        }
        collectedThisLevel = 0;
        this.levelComplete = false;
        this.scene.restart();
      });
  }
})();
