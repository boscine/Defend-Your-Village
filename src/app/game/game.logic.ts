import { GameState, Town, EnemyState, AttackHitbox, COLORS, Button, Particle, FloatingText } from './game.types';
import { SoundManager } from './game.sound';

export class GameLogic {
  // State properties
  public x = 100; public y = 330; public w = 50; public h = 50;
  public playerSpeed = 5; public frame = 0; public limit = 2;
  public counter = 0; public fps = 30; public fpsReset = 50;
  public direction = ""; public lastDirection = "left";
  public movement = true; public moveRight = false; public moveLeft = false;
  public moveUp = false; public moveDown = false; public attack = false;
  public attack2 = false; public charge = false;
  public gameover = false; public hurt = false; public hurtTimer = 0;
  public playerHealth = 100; public playermaxHealth = 100;
  public mana = 100; public maxMana = 100;
  public current_level = 1; public previous_level = 0;

  public width = 1000;
  public height = 400;

  public shakeIntensity = 0;
  public enemies = 5;
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public canLevelUp = true;
  public map = 1;
  public manaFlash = 0; // NEW: Visual indicator for insufficient mana

  public pausebutton = { x: 905, y: 15, width: 50, height: 40, boolean: false };
  public backtomenu_ui: Button = { x: 350, y: 320, width: 300, height: 50, hover: false };
  public town: Town = { x: 650, y: 100, w: 300, h: 300, alive: true, health: 100, maxHealth: 100, hurt: false, hurtTimer: 0 };
  public dummyMap: number[] = [];

  public enemy: EnemyState = {
    x: [], y: [], w: 20, h: 20, speed: [], enemydeath: [], attack: [], health: [], maxHealth: [], move: [],
    attackingplayer: [], playerattack_death: [], damage_value: [], blinking: [], blinkTimer: [],
    deathFrame: [], flash: [], hurt: [], hurtTimer: [], attackType: []
  };

  public enemy_Frame = 0; public enemy_limit = 8; public enemy_Fps = 8; public enemy_Counter = 0;

  public attackhitbox: AttackHitbox & { hitsThisSwing: number } = { x: 100, y: 250, w: 80, h: 60, attackhit: false, hitsThisSwing: 0 };
  public currentAttackIndex = 0;
  public attackFrameIndex = 0;
  public lastAttackTime = 0;
  public attackSpeed = 100;

  public playButton: Button = { x: 350, y: 150, width: 300, height: 50, hover: false };
  public controlsButton: Button = { x: 350, y: 220, width: 300, height: 50, hover: false };
  public settingsButton: Button = { x: 350, y: 290, width: 300, height: 50, hover: false };
  public exitButton: Button = { x: 400, y: 350, width: 200, height: 40, hover: false };
  
  // Settings Screen UI
  public volUpSFX: Button = { x: 550, y: 180, width: 40, height: 40, hover: false };
  public volDownSFX: Button = { x: 410, y: 180, width: 40, height: 40, hover: false };
  public volUpBGM: Button = { x: 550, y: 240, width: 40, height: 40, hover: false };
  public volDownBGM: Button = { x: 410, y: 240, width: 40, height: 40, hover: false };
  public settingsBackButton: Button = { x: 400, y: 320, width: 200, height: 40, hover: false };
  public menuFrame = 0;
  public lastMenuFrameTime = 0;
  public menuLoopCounter = 0; // NEW: To track blink cycles

  public gameState = GameState.START_OVERLAY;
  public soundManager = new SoundManager();

  constructor() {
    this.spawnEnemies();
  }

  update(timestamp: number) {
    if (this.gameState === GameState.MENU) {
      if (timestamp - this.lastMenuFrameTime > 200) {
        if (this.menuFrame === 4) {
          this.menuFrame = 0; // After blink, go back to start
        } else {
          this.menuFrame++;
          // Standard idle is 0, 1, 2
          if (this.menuFrame > 2) {
            this.menuFrame = 0;
            this.menuLoopCounter++;
            // Every 6 cycles, play frame 4 (blink)
            if (this.menuLoopCounter >= 6) {
              this.menuFrame = 4;
              this.menuLoopCounter = 0;
            }
          }
        }
        this.lastMenuFrameTime = timestamp;
      }
    } else if (this.gameState === GameState.PLAYING) {
      if (!this.pausebutton.boolean) {
        this.updateGame();
      } else {
        this.updatePaused();
      }
    }
  }

  private updateGame() {
    if (this.gameover) return;

    if (this.movement) {
      if (this.moveLeft) this.movePlayerLeft();
      if (this.moveRight) this.movePlayerRight();
      if (this.moveUp) this.movePlayerUp();
      if (this.moveDown) this.movePlayerDown();
    }
    
    if (this.attack) this.animateAttack();
    if (this.attack2) this.handleAttack2();
    if (this.charge) this.handleCharge();

    if (!this.moveLeft && !this.moveRight && !this.moveUp && !this.moveDown && !this.attack && !this.attack2 && !this.charge) {
      if (this.direction !== "") { this.frame = 0; this.direction = ""; }
      this.fps = 3; this.limit = 3;
    }

    this.updateEnemies();
    this.checkLevel();
    this.clearEnemies();
    this.updateMap();
    this.updateFrames();
    this.updateParticles();
    this.updateFloatingTexts();

    if (this.town.health <= 0 || this.playerHealth <= 0) {
      this.gameover = true; this.gameState = GameState.GAMEOVER;
      this.moveLeft = false; this.moveRight = false; this.moveUp = false; this.moveDown = false;
      this.attack = false; this.attack2 = false; this.charge = false;
      this.movement = false;
    }

    if (this.shakeIntensity > 0) this.shakeIntensity *= 0.9;
  }

  private updatePaused() {
    // We intentionally do not reset speeds here, so they can be resumed.
    // The main update loop already skips calling move functions when paused.
  }

  private movePlayerLeft() { if (this.direction !== "left") this.frame = 0; this.fps = 8; this.limit = 8; this.direction = "left"; this.lastDirection = "left"; const nx = this.x - this.playerSpeed; if (this.checkEnemyCollision(nx, this.y)) return; if (this.map === 3 && this.x < 0) return; this.x = nx; }
  private movePlayerRight() { if (this.direction !== "right") this.frame = 0; this.fps = 8; this.limit = 8; this.direction = "right"; this.lastDirection = "right"; const nx = this.x + this.playerSpeed; if (this.checkEnemyCollision(nx, this.y)) return; if (this.map === 1 && this.x + this.w > this.town.x) return; this.x = nx; }
  private movePlayerUp() { if (this.direction !== "up") this.frame = 0; const ny = this.y - this.playerSpeed; if (this.checkEnemyCollision(this.x, ny)) return; if (this.y + this.h + 10 > 228) this.y = ny; this.direction = "up"; this.fps = 8; this.limit = 8; }
  private movePlayerDown() { if (this.direction !== "down") this.frame = 0; const ny = this.y + this.playerSpeed; if (this.checkEnemyCollision(this.x, ny)) return; if (this.y + this.h + 10 <= this.height - 40) this.y = ny; this.direction = "down"; this.fps = 8; this.limit = 8; }

  private checkEnemyCollision(px: number, py: number) {
    for (let i = 0; i < this.enemies; i++) {
      if (this.dummyMap[i] === this.map && !this.enemy.enemydeath[i]) {
        if (px < this.enemy.x[i] + this.enemy.w && px + this.w > this.enemy.x[i] && py < this.enemy.y[i] + this.enemy.h && py + this.h > this.enemy.y[i]) return true;
      }
    }
    return false;
  }

  private animateAttack() {
    const currentTime = Date.now();
    if (currentTime - this.lastAttackTime > this.attackSpeed) {
      const attackInfo = [6, 3, 3]; // frameCounts
      this.attackFrameIndex = (this.attackFrameIndex + 1) % attackInfo[this.currentAttackIndex];
      this.lastAttackTime = currentTime;
      if (this.attackFrameIndex === 0) {
        this.currentAttackIndex = (this.currentAttackIndex + 1) % 3;
        this.attackhitbox.w = 80; this.attackhitbox.h = 60; this.attackhitbox.y = this.y - 5;
        this.attackhitbox.x = this.lastDirection === "right" ? this.x + 30 : this.x - 60;
        this.attackhitbox.attackhit = true;
        this.attackhitbox.hitsThisSwing = 0; // Reset hit counter for new swing
        this.soundManager.playMelee();
      }
    }
    this.direction = "attack"; this.movement = false;
  }

  private handleAttack2() {
    if (this.direction !== "attack2") { 
      this.frame = 0; 
      this.shakeIntensity = 5; // Cast start shake
      this.soundManager.playLaserCharge();
    }
    // attack4 has 10 frames
    this.fps = 10; this.limit = 10; this.direction = "attack2"; this.movement = false; 

    // Cap the frame at 9 to avoid "gap" disappearance issues
    if (this.frame > 9) this.frame = 9;
    
    // Play laser fire sound right when the beam visually starts on frame 6
    if (this.frame === 6 && this.mana > 0 && this.counter % Math.max(1, Math.floor(50 / this.fps)) === 0) {
        this.soundManager.playLaserFire();
    }

    // Slower mana drain to allow for a more visible beam duration
    // (5 units per tick, lasting ~20 game frames)
    if (this.frame >= 6 && this.mana > 0) {
      this.mana = Math.max(this.mana - 5, 0); 
    }

    // Once the animation reaches its final frame (9), the attack ends automatically
    if (this.frame === 9) {
      this.mana = 0; // Ensure it reaches zero after full cast
      this.frame = 0; // Reset frame to 0 immediately to avoid idle gap
      this.attack2 = false;
      this.direction = "";
      this.movement = true;
      this.shakeIntensity = 12; // Final fire shake
      this.createMagicResidue(this.x + (this.lastDirection === "right" ? 50 : -10), this.y + 15);
    }
  }

  private handleCharge() {
    if (this.direction !== "charge") this.frame = 0;
    this.fps = 6; this.limit = 2; this.direction = "charge"; this.movement = false;
    
    if (this.mana >= this.maxMana) {
      if (this.counter % Math.max(1, Math.floor(50 / this.fps)) === 0) {
        this.createFloatingText("MAX MANA", this.x + 10, this.y - 10, COLORS.cyan);
      }
      return; 
    }

    this.mana += 1;
    
    // Add charging aura particles
    this.createManaParticles(this.x + 25, this.y + 25);
    
    // Pulsing charge sound
    if (this.counter % Math.max(1, Math.floor(50 / this.fps)) === 0) {
      this.soundManager.playManaCharge();
    }
  }

  private updateEnemies() {
    for (let i = 0; i < this.enemies; i++) {
      if (!this.enemy.enemydeath[i]) {
        // Enemies always move unless dead or attacking
        if (this.enemy.move[i]) {
          this.enemy.x[i] += this.enemy.speed[i];
        }

        // Handle off-screen map transitions for enemies
        if (this.enemy.x[i] > this.width) {
          this.enemy.x[i] = -20;
          this.dummyMap[i] = Math.max(1, this.dummyMap[i] - 1);
        }

        // Town damage happens on Map 1 regardless of player position
        if (this.dummyMap[i] === 1 && this.enemy.x[i] + this.enemy.w > this.town.x) {
          // Trigger attack animation
          this.enemy.attackingplayer[i] = true;
          this.enemy.move[i] = false;
          
          // Apply damage synchronized with the sword swing (frame 6)
          if (this.enemy_Frame === 6 && !this.town.hurt) {
            // Slight decrease to village damage specifically (50% physical resistance)
            // Also add invulnerability frames for the town to prevent instant death from mobs
            this.town.health = Math.max(this.town.health - (this.enemy.damage_value[i] * 0.5), 0);
            this.town.hurt = true;
            this.town.hurtTimer = 15; // Town is invulnerable for 15 frames after any hit
          }
        }

        // Only process combat and player interaction if the enemy is on the player's current map
        // BAD MAP EDGE LOGIC FIX: Enemies cannot strike if THEY are too close to the screen edges
        if (this.dummyMap[i] === this.map && this.enemy.x[i] > 10 && this.enemy.x[i] < this.width - 50) {
          // Check collision with player (slightly decreased hitbox for fairness)
          if (this.checkCollision(this.x + 5, this.y + 5, this.w - 10, this.h - 10, this.enemy.x[i], this.enemy.y[i], this.enemy.w, this.enemy.h)) {
            // Skeleton attack hits on frame 6 of its 8-frame animation loop
            if (this.enemy_Frame === 6) { 
              this.playerHealth = Math.max(this.playerHealth - this.enemy.damage_value[i], 0); 
              this.hurt = true; this.hurtTimer = 10; 
              this.shakeIntensity = 12; // Dramatically increased shake on player hit
              this.soundManager.playPlayerHurt();
              // Knockback
              if (this.enemy.x[i] < this.x) this.x += 15; else this.x -= 15;
              this.createBlood(this.x + this.w / 2, this.y + this.h / 2);
            }
            this.enemy.attackingplayer[i] = true; this.enemy.move[i] = false;
          } else {
            // Priority Check: Only cancel attackingplayer if not currently striking the town on Map 1
            if (!(this.dummyMap[i] === 1 && this.enemy.x[i] + this.enemy.w > this.town.x)) {
              this.enemy.attackingplayer[i] = false;
            }
            // Allow movement if not hitting town and NOT hurt
            if (!(this.dummyMap[i] === 1 && this.enemy.x[i] + this.enemy.w > this.town.x) && !this.enemy.hurt[i]) {
              this.enemy.move[i] = true;
            } else {
              this.enemy.move[i] = false;
            }
          }

          // Handle player attacks
          if (this.attack2 && this.frame >= 6) { 
            if (this.checkLaserHit(i)) { 
              this.enemy.health[i] -= 3.5; // Balanced damage
              this.shakeIntensity = 5;
              this.enemy.hurt[i] = true;
              this.enemy.hurtTimer[i] = 5;
              if (this.counter % 3 === 0) {
                this.createBlood(this.enemy.x[i] + this.enemy.w / 2, this.enemy.y[i] + this.enemy.h / 2);
                this.soundManager.playEnemyHit();
              }
              if (this.enemy.health[i] <= 0) this.killEnemy(i); 
            } 
          }
          if (this.attackhitbox.attackhit && this.attackhitbox.hitsThisSwing < 2 && this.checkCollision(this.attackhitbox.x, this.attackhitbox.y, this.attackhitbox.w, this.attackhitbox.h, this.enemy.x[i], this.enemy.y[i], this.enemy.w, this.enemy.h)) {
            this.enemy.health[i] -= 10;
            this.enemy.hurt[i] = true;
            this.enemy.hurtTimer[i] = 25;
            this.enemy.move[i] = false; // Disable movement on hit
            this.shakeIntensity = 8; // Melee hit shake
            this.soundManager.playEnemyHit();
            this.createBlood(this.enemy.x[i] + this.enemy.w / 2, this.enemy.y[i] + this.enemy.h / 2);
            if (this.enemy.health[i] <= 0) this.killEnemy(i);
            
            this.attackhitbox.hitsThisSwing++; // Counter hits during this cycle
            // Reached our 2-enemy limit for this swing
            if (this.attackhitbox.hitsThisSwing >= 2) this.attackhitbox.attackhit = false;
            
            // Melee Life Steal & Mana Regen: Increase per enemy hit
            this.playerHealth = Math.min(this.playermaxHealth, this.playerHealth + 3);
            this.mana = Math.min(this.maxMana, this.mana + 5);
          }
        }
      }
    }
  }

  private checkCollision(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) { return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2; }
  private checkLaserHit(enemyIdx: number) {
    const beamY = this.y + 11; // Matches renderer height (+81 from bounding box)
    const ey = this.enemy.y[enemyIdx]; const eh = this.enemy.h;
    // Widened hitbox for more reliable hit registration
    if (ey < beamY + 30 && ey + eh > beamY - 30) {
      if (this.lastDirection === "left") return this.enemy.x[enemyIdx] < this.x;
      else return this.enemy.x[enemyIdx] > this.x;
    }
    return false;
  }
  private killEnemy(i: number) { this.enemy.enemydeath[i] = true; this.enemy.move[i] = false; this.enemy.speed[i] = 0; }

  private checkLevel() {
    let allDead = true; for (let i = 0; i < this.enemies; i++) if (!this.enemy.enemydeath[i]) allDead = false;
    if (allDead && this.canLevelUp) {
      this.canLevelUp = false;
      this.soundManager.playLevelUp();
      setTimeout(() => { this.current_level++; this.spawnEnemies(); this.canLevelUp = true; }, 3000);
    }
  }

  public spawnEnemies() {
    this.enemies = Math.floor(5 + (this.current_level - 1) * 2); // Slightly lower scaling
    for (let i = 0; i < this.enemies; i++) {
      this.enemy.x[i] = Math.random() * 500; this.enemy.y[i] = 180 + Math.random() * 130;
      this.enemy.health[i] = 20 + this.current_level * 12; this.enemy.maxHealth[i] = this.enemy.health[i];
      this.enemy.enemydeath[i] = false; 
      this.enemy.move[i] = true; // MUST START MOVING
      this.enemy.attackingplayer[i] = false;
      this.enemy.attack[i] = false;
      this.enemy.attackType[i] = Math.floor(Math.random() * 3);
      
      // Speed scales slightly with level
      this.enemy.speed[i] = 0.4 + (this.current_level * 0.08) + Math.random() * 0.1;
      this.dummyMap[i] = 3; // ALWAYS spawn in the furthest forest
      this.enemy.deathFrame[i] = 0; this.enemy.blinkTimer[i] = 0;
      // Damage starts low (1.0 at lvl 1) and grows
      this.enemy.damage_value[i] = Math.min(10, 1 + (this.current_level - 1) * 1.5);
      
      // Enemies no longer grow in size
      this.enemy.w = 20; this.enemy.h = 20;
    }
  }

  private clearEnemies() {
    for (let i = this.enemies - 1; i >= 0; i--) {
      if (this.enemy.enemydeath[i]) {
        // Play out death animation once and stay on the final frame (index 3 for the 4-frame sheet)
        this.enemy.blinkTimer[i]++; 
        if (this.enemy.blinkTimer[i] % 15 === 0 && this.enemy.deathFrame[i] < 3) {
          this.enemy.deathFrame[i]++;
        }
        if (this.enemy.blinkTimer[i] > 100) {
          const keys = Object.keys(this.enemy);
          keys.forEach(key => { if (Array.isArray(this.enemy[key])) this.enemy[key].splice(i, 1); });
          this.dummyMap.splice(i, 1); this.enemies -= 1;
        }
      }
    }
  }

  private updateMap() {
    if (this.x < -20 && (this.map === 1 || this.map === 2)) { this.map++; this.x = this.width - 50; }
    else if (this.x > this.width - 30 && (this.map === 2 || this.map === 3)) { this.map--; this.x = 20; }
  }

  private updateFrames() {
    this.counter++;
    const playerUpdateInterval = Math.max(1, Math.floor(50 / (this.fps || 1)));
    if (this.counter % playerUpdateInterval === 0) {
      this.frame = (this.frame + 1) % this.limit;
    }
    
    if (this.manaFlash > 0) this.manaFlash -= 0.05; // Fade mana flash

    this.enemy_Counter++;
    const enemyUpdateInterval = Math.max(1, Math.floor(50 / (this.enemy_Fps || 1)));
    if (this.enemy_Counter % enemyUpdateInterval === 0) {
      this.enemy_Frame = (this.enemy_Frame + 1) % this.enemy_limit;
    }
    if (this.hurt) { this.hurtTimer--; if (this.hurtTimer <= 0) this.hurt = false; }
    if (this.town.hurt) { this.town.hurtTimer--; if (this.town.hurtTimer <= 0) this.town.hurt = false; }
    for (let i = 0; i < this.enemies; i++) {
      if (this.enemy.hurt[i]) {
        this.enemy.hurtTimer[i]--;
        if (this.enemy.hurtTimer[i] <= 0) this.enemy.hurt[i] = false;
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  private updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.5; // Float upwards slowly
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  public createFloatingText(text: string, px: number, py: number, color: string = COLORS.white) {
    // Prevent spamming the exact same text at the exact same time
    if (this.floatingTexts.some(ft => ft.text === text && ft.life > 40)) return;
    this.floatingTexts.push({ text, x: px, y: py, life: 60, maxLife: 60, color });
  }

  public createBlood(px: number, py: number) { for (let i = 0; i < 6; i++) { this.particles.push({ x: px, y: py, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 25, r: 2 + Math.random() * 3, color: "red" }); } }
  public createDebris(px: number, py: number) { for (let i = 0; i < 8; i++) { this.particles.push({ x: px, y: py, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 6, life: 30, r: 3 + Math.random() * 4, color: Math.random() > 0.5 ? "#5D6D7E" : "#85929E" }); } }
  public createMagicResidue(px: number, py: number) { for (let i = 0; i < 15; i++) { this.particles.push({ x: px, y: py, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12, life: 40, r: 1 + Math.random() * 4, color: Math.random() > 0.5 ? "#00FFFF" : "#FFFFFF" }); } }
  public createManaParticles(px: number, py: number) { if (Math.random() > 0.2) this.particles.push({ x: px + (Math.random() - 0.5) * 60, y: py + 20, vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 3, life: 20, r: 1 + Math.random() * 2, color: "#00FFFF" }); }

  public resetGame() {
    this.x = 100; this.y = 330; // Updated to your preferred hitbox height
    this.playerHealth = 100; this.mana = 100;
    this.town.health = 100; this.town.alive = true; 
    this.current_level = 1; this.enemies = 5; 
    this.map = 1; // RESET TO FIRST MAP
    this.gameover = false; 
    this.gameState = GameState.PLAYING;
    this.dummyMap = []; // Clear current enemy map assignments
    this.spawnEnemies();
    this.particles = [];
    this.floatingTexts = [];
  }
}
