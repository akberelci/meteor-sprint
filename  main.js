"use strict";

// DOM hazır olmadan çalışmasın diye:
window.addEventListener("load", () => {
  const W = 800, H = 500;

  let player, cursors, keys, meteors;
  let score = 0;
  let scoreText;
  let ended = false;

  const config = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: "game",
    backgroundColor: "#111827",
    physics: {
      default: "arcade",
      arcade: { debug: false }
    },
    scene: { create, update }
  };

  new Phaser.Game(config);

  function create() {
    // Player
    player = this.add.rectangle(W / 2, H - 40, 60, 24, 0x22c55e);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys("A,D,R");

    // Meteors
    meteors = this.physics.add.group();

    // Spawn
    this.time.addEvent({
      delay: 650,
      loop: true,
      callback: () => spawnMeteor(this)
    });

    // Score
    score = 0;
    scoreText = this.add.text(16, 14, "Score: 0", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff"
    });

    // Collision
    this.physics.add.overlap(player, meteors, () => gameOver.call(this));
  }

  function spawnMeteor(scene) {
    if (ended) return;

    const x = Phaser.Math.Between(20, W - 20);
    const r = Phaser.Math.Between(14, 28);

    const m = scene.add.circle(x, -30, r, 0xef4444);
    scene.physics.add.existing(m);

    // Basit ve stabil hız artışı
    const speed = 260 + Math.min(500, score * 0.35);
    m.body.setVelocityY(speed);

    meteors.add(m);
  }

  function gameOver() {
    if (ended) return;
    ended = true;

    this.physics.pause();

    this.add.text(W / 2, H / 2, `GAME OVER\nScore: ${Math.floor(score)}\nPress R`, {
      fontFamily: "Arial",
      fontSize: "34px",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5);
  }

  function update(_, delta) {
    // Restart
    if (ended) {
      if (Phaser.Input.Keyboard.JustDown(keys.R)) location.reload();
      return;
    }

    // Move
    const SPEED = 420;
    let vx = 0;

    if (cursors.left.isDown || keys.A.isDown) vx = -SPEED;
    if (cursors.right.isDown || keys.D.isDown) vx = SPEED;

    player.body.setVelocityX(vx);

    // Score
    score += delta * 0.02;
    scoreText.setText("Score: " + Math.floor(score));

    // Cleanup
    meteors.children.iterate((m) => {
      if (m && m.y > H + 80) m.destroy();
    });
  }
});
