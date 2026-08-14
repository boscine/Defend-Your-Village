import { GameState, Town, EnemyState, AttackHitbox, COLORS, Button, Particle } from './game.types';

export class GameRenderer {
  constructor(private ctx: CanvasRenderingContext2D) { }

  draw(state: any, images: { [key: string]: HTMLImageElement }, loadedAttackImages: HTMLImageElement[]) {
    this.ctx.clearRect(0, 0, state.width, state.height);

    if (state.shakeIntensity > 0.5 && !state.accessibility?.lowEndMode && !state.pausebutton?.boolean) {
      this.ctx.save();
      this.ctx.translate((Math.random() - 0.5) * state.shakeIntensity, (Math.random() - 0.5) * state.shakeIntensity);
    }

    if (state.gameState === GameState.LOADING) {
      this.drawLoadingScreen(state);
    } else if (state.gameState === GameState.START_OVERLAY) {
      this.drawStartOverlay(state);
    } else if (state.gameState === GameState.MENU) {
      this.drawMenu(state, images);
    } else if (state.gameState === GameState.CONTROLS) {
      this.drawControls(state);
    } else if (state.gameState === GameState.SETTINGS) {
      this.drawSettings(state);
    } else if (state.gameState === GameState.PLAYING || state.gameState === GameState.GAMEOVER) {
      this.drawGame(state, images, loadedAttackImages);
    }

    if (state.shakeIntensity > 0.5 && !state.accessibility?.lowEndMode && !state.pausebutton?.boolean) {
      this.ctx.restore();
    }
  }

  private drawLoadingScreen(state: any) {
    // Dark background
    this.ctx.fillStyle = "#0c0d14";
    this.ctx.fillRect(0, 0, state.width, state.height);

    // Title
    this.ctx.fillStyle = COLORS.cyan;
    this.ctx.font = "bold 38px 'Orbitron'";
    this.ctx.textAlign = "center";
    this.ctx.fillText("DEFEND YOUR VILLAGE", state.width / 2, state.height / 2 - 60);

    // Loading status text
    this.ctx.fillStyle = "#A0AEC0";
    this.ctx.font = "14px 'Silkscreen', monospace";
    this.ctx.fillText(state.loadingStatusText, state.width / 2, state.height / 2 - 15);

    // Outer progress bar track
    const barW = 400;
    const barH = 22;
    const barX = (state.width - barW) / 2;
    const barY = state.height / 2 + 15;

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    this.ctx.strokeStyle = COLORS.cyan;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    (this.ctx as any).roundRect(barX, barY, barW, barH, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Inner progress bar fill
    const progress = Math.min(Math.max(state.loadingProgress, 0), 1);
    if (progress > 0) {
      const fillW = Math.max(12, (barW - 6) * progress);
      const grad = this.ctx.createLinearGradient(barX, barY, barX + barW, barY);
      grad.addColorStop(0, COLORS.cyan);
      grad.addColorStop(1, "#38EF7D");
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      (this.ctx as any).roundRect(barX + 3, barY + 3, fillW, barH - 6, 4);
      this.ctx.fill();
    }

    // Percentage text inside bar
    const pctText = `${Math.round(progress * 100)}%`;
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "bold 13px 'Orbitron'";
    this.ctx.fillText(pctText, state.width / 2, barY + 16);

    // Subtext hint
    this.ctx.fillStyle = "#718096";
    this.ctx.font = "12px 'Silkscreen'";
    this.ctx.fillText("OPTIMIZING ASSETS FOR LOW-END & HIGH PERFORMANCE", state.width / 2, state.height / 2 + 75);
    this.ctx.textAlign = "start";
  }

  private drawStartOverlay(state: any) {
    this.ctx.fillStyle = "#111"; // Dark background
    this.ctx.fillRect(0, 0, state.width, state.height);
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 40px 'Orbitron'";
    this.ctx.textAlign = "center";
    this.ctx.fillText("DEFEND YOUR VILLAGE", state.width / 2, state.height / 2 - 20);
    
    // Pulsing text
    this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(Date.now() / 400))})`;
    this.ctx.font = "20px 'Silkscreen'";
    this.ctx.fillText("CLICK ANYWHERE TO START", state.width / 2, state.height / 2 + 30);
    this.ctx.textAlign = "start";
  }

  private drawMenu(state: any, images: { [key: string]: HTMLImageElement }) {
    const bg = images['bg1'];
    if (bg && bg.complete) {
      this.ctx.drawImage(bg, 0, 0, state.width, state.height);
      this.ctx.fillStyle = "rgba(15, 15, 27, 0.4)";
      this.ctx.fillRect(0, 0, state.width, state.height);
    }
    const playerIdle = images['idle'];
    if (playerIdle && playerIdle.complete) {
      this.ctx.drawImage(playerIdle, state.menuFrame * 128, 0, 128, 128, 50, 280, 120, 120);
    }
    this.ctx.font = "bold 70px 'Orbitron'";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText("DEFEND YOUR VILLAGE", state.width / 2, 100 + Math.sin(Date.now() / 600) * 8);
    this.drawStyledButton("Play", state.playButton);
    this.drawStyledButton("Controls", state.controlsButton);
    this.drawStyledButton("Settings", state.settingsButton);
  }

  private drawStyledButton(text: string, btn: Button) {
    const grad = this.ctx.createLinearGradient(btn.x, btn.y, btn.x + btn.width, btn.y);
    grad.addColorStop(0, btn.hover ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)");
    grad.addColorStop(1, btn.hover ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)");
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    (this.ctx as any).roundRect(btn.x, btn.y, btn.width, btn.height, 8);
    this.ctx.fill();
    this.ctx.strokeStyle = btn.hover ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 22px 'Orbitron'";
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 8);
    this.ctx.textAlign = "start";
  }

  private drawControls(state: any) {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    this.ctx.fillRect(0, 0, state.width, state.height);
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 45px 'Orbitron'";
    this.ctx.textAlign = "center";
    this.ctx.fillText("BATTLE COMMANDS", state.width / 2, 100);
    const controls = [
      { key: "W A S D", action: "Move enchantress" },
      { key: "J", action: "Melee strike" },
      { key: "K", action: "Magic Beam" },
      { key: "L", action: "Charge Mana" },
      { key: "ESC", action: "Tactical Pause" }
    ];
    this.ctx.font = "20px 'Silkscreen'";
    controls.forEach((c, i) => {
      const y = 160 + i * 38;
      this.ctx.fillStyle = COLORS.cyan; this.ctx.textAlign = "right";
      this.ctx.fillText(c.key, state.width / 2 - 40, y);
      this.ctx.fillStyle = "white"; this.ctx.textAlign = "left";
      this.ctx.fillText(" - " + c.action, state.width / 2 - 20, y);
    });
    this.ctx.textAlign = "center";
    this.drawStyledButton("Go back", state.exitButton);
  }

  private drawSettings(state: any) {
    const W = state.width, H = state.height;
    const sm = state.soundManager;

    // Blurred dark background
    this.ctx.fillStyle = "rgba(6, 8, 18, 0.97)";
    this.ctx.fillRect(0, 0, W, H);

    // ── Title ──
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 30px 'Orbitron'";
    this.ctx.fillText("SETTINGS", W / 2, 48);
    // Thin cyan underline
    this.ctx.strokeStyle = "rgba(37, 180, 218, 0.5)";
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(W / 2 - 100, 56); this.ctx.lineTo(W / 2 + 100, 56);
    this.ctx.stroke();
    this.ctx.restore();

    // ── Layout: two cards side by side ──
    const cardY = 72, cardH = 240, gap = 16;
    const totalW = W - 80;
    const cardW = (totalW - gap) / 2;
    const leftX = 40, rightX = leftX + cardW + gap;

    // Helper: draw a frosted card
    const drawCard = (x: number, y: number, w: number, h: number, label: string) => {
      this.ctx.save();
      this.ctx.fillStyle = "rgba(20, 28, 46, 0.9)";
      (this.ctx as any).roundRect(x, y, w, h, 10);
      this.ctx.fill();
      this.ctx.strokeStyle = "rgba(255,255,255,0.08)";
      this.ctx.lineWidth = 1;
      (this.ctx as any).roundRect(x, y, w, h, 10);
      this.ctx.stroke();
      // Card label tab
      this.ctx.fillStyle = COLORS.cyan;
      this.ctx.font = "bold 10px 'Orbitron'";
      this.ctx.textAlign = "left";
      this.ctx.fillText(label, x + 14, y + 18);
      // Tab underline
      this.ctx.strokeStyle = "rgba(37,180,218,0.3)";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 14, y + 24); this.ctx.lineTo(x + w - 14, y + 24);
      this.ctx.stroke();
      this.ctx.restore();
    };

    drawCard(leftX, cardY, cardW, cardH, "AUDIO");
    drawCard(rightX, cardY, cardW, cardH, "ACCESSIBILITY");

    // ── AUDIO CARD: Volume rows ──
    const drawVolumeRow = (label: string, value: number, rowY: number, downBtn: any, upBtn: any) => {
      const rowX = leftX + 14;
      const rowW = cardW - 28;

      this.ctx.save();
      // Row label
      this.ctx.fillStyle = "rgba(200,215,230,0.8)";
      this.ctx.font = "bold 11px 'Orbitron'";
      this.ctx.textAlign = "left";
      this.ctx.fillText(label, rowX, rowY);

      // Volume track background
      const trackX = rowX, trackY = rowY + 6, trackW = rowW - 84, trackH = 6;
      this.ctx.fillStyle = "rgba(255,255,255,0.08)";
      (this.ctx as any).roundRect(trackX, trackY, trackW, trackH, 3);
      this.ctx.fill();

      // Volume fill
      const fillW = value * trackW;
      if (fillW > 0) {
        const grad = this.ctx.createLinearGradient(trackX, 0, trackX + trackW, 0);
        grad.addColorStop(0, COLORS.cyan);
        grad.addColorStop(1, "#38EF7D");
        this.ctx.fillStyle = grad;
        (this.ctx as any).roundRect(trackX, trackY, fillW, trackH, 3);
        this.ctx.fill();
        // Gloss
        this.ctx.fillStyle = "rgba(255,255,255,0.25)";
        (this.ctx as any).roundRect(trackX, trackY, fillW, 3, [3,3,0,0]);
        this.ctx.fill();
      }
      // Track border
      this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
      this.ctx.lineWidth = 1;
      (this.ctx as any).roundRect(trackX, trackY, trackW, trackH, 3);
      this.ctx.stroke();

      // Percent label
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 12px 'Orbitron'";
      this.ctx.textAlign = "center";
      this.ctx.fillText(Math.round(value * 100) + "%", trackX + trackW + 28, rowY + 2);

      // – button
      downBtn.x = leftX + cardW - 68; downBtn.y = rowY - 11; downBtn.width = 26; downBtn.height = 20;
      const downHover = downBtn.hover;
      this.ctx.fillStyle = downHover ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)";
      (this.ctx as any).roundRect(downBtn.x, downBtn.y, downBtn.width, downBtn.height, 5);
      this.ctx.fill();
      this.ctx.strokeStyle = downHover ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)";
      this.ctx.lineWidth = 1;
      (this.ctx as any).roundRect(downBtn.x, downBtn.y, downBtn.width, downBtn.height, 5);
      this.ctx.stroke();
      this.ctx.fillStyle = "#fff"; this.ctx.font = "bold 14px 'Orbitron'"; this.ctx.textAlign = "center";
      this.ctx.fillText("−", downBtn.x + downBtn.width / 2, downBtn.y + 14);

      // + button
      upBtn.x = leftX + cardW - 36; upBtn.y = rowY - 11; upBtn.width = 26; upBtn.height = 20;
      const upHover = upBtn.hover;
      this.ctx.fillStyle = upHover ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)";
      (this.ctx as any).roundRect(upBtn.x, upBtn.y, upBtn.width, upBtn.height, 5);
      this.ctx.fill();
      this.ctx.strokeStyle = upHover ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)";
      (this.ctx as any).roundRect(upBtn.x, upBtn.y, upBtn.width, upBtn.height, 5);
      this.ctx.stroke();
      this.ctx.fillStyle = "#fff"; this.ctx.font = "bold 14px 'Orbitron'"; this.ctx.textAlign = "center";
      this.ctx.fillText("+", upBtn.x + upBtn.width / 2, upBtn.y + 14);

      this.ctx.restore();
    };

    drawVolumeRow("SFX VOLUME",   sm.sfxVolume, cardY + 52,  state.volDownSFX, state.volUpSFX);
    drawVolumeRow("MUSIC VOLUME", sm.bgmVolume, cardY + 110, state.volDownBGM, state.volUpBGM);

    // Audio note
    this.ctx.save();
    this.ctx.fillStyle = "rgba(150,165,180,0.5)";
    this.ctx.font = "9px 'Silkscreen'";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Click canvas first to enable audio", leftX + 14, cardY + 148);
    this.ctx.restore();

    // ── ACCESSIBILITY CARD: Toggle rows ──
    const drawToggleRow = (label: string, sublabel: string, value: boolean, btn: any, rowY: number) => {
      const rowX = rightX + 14;
      const rowW = cardW - 28;

      this.ctx.save();
      // Row separator
      if (rowY > cardY + 35) {
        this.ctx.strokeStyle = "rgba(255,255,255,0.05)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(rowX, rowY - 10); this.ctx.lineTo(rowX + rowW, rowY - 10);
        this.ctx.stroke();
      }

      // Label
      this.ctx.fillStyle = "rgba(210,220,230,0.9)";
      this.ctx.font = "bold 11px 'Orbitron'";
      this.ctx.textAlign = "left";
      this.ctx.fillText(label, rowX, rowY + 4);

      // Sub-label
      this.ctx.fillStyle = "rgba(140,155,170,0.6)";
      this.ctx.font = "9px 'Silkscreen'";
      this.ctx.fillText(sublabel, rowX, rowY + 18);

      // Toggle pill
      const pillW = 58, pillH = 22;
      btn.x = rightX + cardW - pillW - 14;
      btn.y = rowY - 4;
      btn.width = pillW;
      btn.height = pillH;

      // Pill background
      this.ctx.fillStyle = value ? "rgba(37, 210, 140, 0.25)" : "rgba(255,255,255,0.06)";
      (this.ctx as any).roundRect(btn.x, btn.y, pillW, pillH, 11);
      this.ctx.fill();
      this.ctx.strokeStyle = value ? "rgba(37,210,140,0.6)" : "rgba(255,255,255,0.12)";
      this.ctx.lineWidth = 1;
      (this.ctx as any).roundRect(btn.x, btn.y, pillW, pillH, 11);
      this.ctx.stroke();

      // Pill label
      this.ctx.fillStyle = value ? "#40DCA0" : "rgba(180,195,210,0.6)";
      this.ctx.font = "bold 10px 'Orbitron'";
      this.ctx.textAlign = "center";
      this.ctx.fillText(value ? "ON" : "OFF", btn.x + pillW / 2, btn.y + 15);

      this.ctx.restore();
    };

    drawToggleRow("LOW-END MODE",     "Disables FX & particles",       state.accessibility.lowEndMode,    state.toggleLowEndBtn,    cardY + 50);
    drawToggleRow("HIGH CONTRAST",    "Brighter HUD elements",         state.accessibility.highContrast,  state.toggleContrastBtn,  cardY + 120);
    drawToggleRow("REDUCED MOTION",   "Removes floating text motion",  state.accessibility.reducedMotion, state.toggleMotionBtn,    cardY + 190);

    // ── Save & Back button ──
    state.settingsBackButton.x = W / 2 - 110;
    state.settingsBackButton.y = cardY + cardH + 22;
    state.settingsBackButton.width = 220;
    state.settingsBackButton.height = 44;
    this.drawStyledButton("← SAVE & BACK", state.settingsBackButton);
  }

  private drawGame(state: any, images: { [key: string]: HTMLImageElement }, loadedAttackImages: HTMLImageElement[]) {
    const bgImg = images[`bg${state.map}`] || images['bg1'];
    if (bgImg) this.ctx.drawImage(bgImg, 0, 0, state.width, state.height);
    
    // Darken map 1 for atmosphere
    if (state.map === 1) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      this.ctx.fillRect(0, 0, state.width, state.height);
    }

    if (state.map === 1) { this.drawTown(state, images); }
    this.drawVillageHealthBar(state);
    
    // Y-SORTING ENTITIES
    let entities: any[] = [];
    // Player entity
    entities.push({ type: 'player', y: state.y });
    // Enemy entities
    for (let i = 0; i < state.enemies; i++) {
      if (state.dummyMap[i] === state.map) {
        entities.push({ type: 'enemy', y: state.enemy.y[i], id: i });
      }
    }
    // Sort by Y-coordinate
    entities.sort((a, b) => a.y - b.y);

    // DRAW SORTED
    entities.forEach(ent => {
      if (ent.type === 'player') this.drawPlayer(state, images, loadedAttackImages);
      else this.drawEnemy(state, images, ent.id);
    });

    this.drawParticles(state);
    this.drawFloatingTexts(state);
    this.drawUI(state, images);

    // DRAW MAGIC BEAM ON TOP OF EVERYTHING
    if (state.direction === "attack2" && state.frame >= 6) this.drawMagicBeam(state);

    // GUIDING MISSION SIGNS
    if (!state.gameover) {
      let ahead = 0; let behind = 0; let here = 0;
      for (let i = 0; i < state.enemies; i++) {
        if (state.enemy.enemydeath[i]) continue;
        if (state.dummyMap[i] < state.map) behind++; 
        else if (state.dummyMap[i] > state.map) ahead++;
        else here++;
      }
      
      if (here === 0) {
        if (behind > 0) this.drawEnemyGuide(state, "RESCUE VILLAGE →", true);
        else if (ahead > 0) this.drawEnemyGuide(state, "← ENEMIES", false);
      }
    }
  }

  private drawEnemyGuide(state: any, text: string, isRight: boolean) {
    const pulse = Math.abs(Math.sin(Date.now() / 300)) * 10;
    const x = isRight ? state.width - 250 - pulse : 50 + pulse;
    const y = 200;
    
    this.ctx.save();
    this.ctx.shadowBlur = 15; this.ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
    this.ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
    this.ctx.font = "bold 22px 'Orbitron'";
    this.ctx.textAlign = "start";
    this.ctx.fillText(text, x, y);
    
    // Arrow detail
    this.ctx.beginPath();
    if (isRight) {
      this.ctx.moveTo(x + 210 + pulse, y - 8);
      this.ctx.lineTo(x + 225 + pulse, y - 5);
      this.ctx.lineTo(x + 210 + pulse, y - 2);
    } else {
      this.ctx.moveTo(x - 20, y - 10);
      this.ctx.lineTo(x - 35, y - 7);
      this.ctx.lineTo(x - 20, y - 4);
    }
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawVillageHealthBar(state: any) {
    const hp = state.town.health;
    const maxHp = state.town.maxHealth;
    const pct = Math.max(0, Math.min(1, hp / maxHp));
    const isLow = pct < 0.35;
    const isCritical = pct < 0.15;
    const pulse = isCritical ? Math.abs(Math.sin(Date.now() / 250)) : 0;

    if (state.map === 1) {
      // ── MAP 1: Floating totem panel anchored above the village ──
      const panelW = 220;
      const panelH = 52;
      const panelX = state.town.x + state.town.w / 2 - panelW / 2;
      const panelY = state.town.y - 72;

      this.ctx.save();

      // Drop shadow
      this.ctx.shadowColor = "rgba(0,0,0,0.7)";
      this.ctx.shadowBlur = 12;
      this.ctx.shadowOffsetY = 4;

      // Panel background
      this.ctx.fillStyle = "rgba(8, 12, 22, 0.92)";
      (this.ctx as any).roundRect(panelX, panelY, panelW, panelH, 8);
      this.ctx.fill();
      this.ctx.shadowBlur = 0; this.ctx.shadowOffsetY = 0;

      // Panel border — glows red when critical
      this.ctx.strokeStyle = isCritical
        ? `rgba(255, 60, 60, ${0.5 + pulse * 0.5})`
        : isLow ? "rgba(255, 160, 30, 0.6)" : "rgba(80, 220, 160, 0.4)";
      this.ctx.lineWidth = 1.5;
      (this.ctx as any).roundRect(panelX, panelY, panelW, panelH, 8);
      this.ctx.stroke();

      // Connector stem (visual anchor to the village)
      const stemX = panelX + panelW / 2;
      this.ctx.strokeStyle = "rgba(255,255,255,0.12)";
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([3, 3]);
      this.ctx.beginPath();
      this.ctx.moveTo(stemX, panelY + panelH);
      this.ctx.lineTo(stemX, state.town.y - 4);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Shield icon (drawn with canvas primitives)
      const iconX = panelX + 14; const iconY = panelY + panelH / 2;
      this.ctx.fillStyle = isCritical ? `rgba(255,80,80,${0.7 + pulse * 0.3})` : isLow ? "#FFA020" : "#40DCA0";
      this.ctx.beginPath();
      this.ctx.moveTo(iconX, iconY - 9);
      this.ctx.lineTo(iconX + 7, iconY - 6);
      this.ctx.lineTo(iconX + 7, iconY + 1);
      this.ctx.quadraticCurveTo(iconX + 7, iconY + 8, iconX, iconY + 11);
      this.ctx.quadraticCurveTo(iconX - 7, iconY + 8, iconX - 7, iconY + 1);
      this.ctx.lineTo(iconX - 7, iconY - 6);
      this.ctx.closePath();
      this.ctx.fill();

      // Label
      this.ctx.fillStyle = "rgba(200,215,230,0.85)";
      this.ctx.font = "bold 9px 'Orbitron'";
      this.ctx.textAlign = "left";
      this.ctx.fillText("VILLAGE", panelX + 28, panelY + 17);

      // HP readout
      const hpText = `${Math.ceil(hp)} / ${maxHp}`;
      this.ctx.fillStyle = isCritical ? `rgba(255,100,100,${0.8 + pulse * 0.2})` : "#ffffff";
      this.ctx.font = `bold 13px 'Orbitron'`;
      this.ctx.fillText(hpText, panelX + 28, panelY + 32);

      // Bar track
      const bx = panelX + 28; const by = panelY + 37;
      const bw = panelW - 44; const bh = 7;
      this.ctx.fillStyle = "rgba(255,255,255,0.08)";
      (this.ctx as any).roundRect(bx, by, bw, bh, 3);
      this.ctx.fill();

      // Bar fill gradient
      const barColor = isCritical
        ? (pulse > 0.5 ? "#FF3C3C" : "#CC0000")
        : isLow ? "#FFA020" : "#40DCA0";
      const fillW = Math.max(0, pct * bw);
      if (fillW > 0) {
        const grad = this.ctx.createLinearGradient(bx, 0, bx + bw, 0);
        grad.addColorStop(0, barColor);
        grad.addColorStop(1, isCritical ? "#FF8080" : isLow ? "#FFD060" : "#00F5A0");
        this.ctx.fillStyle = grad;
        (this.ctx as any).roundRect(bx, by, fillW, bh, 3);
        this.ctx.fill();

        // Gloss sheen on bar
        this.ctx.fillStyle = "rgba(255,255,255,0.25)";
        (this.ctx as any).roundRect(bx, by, fillW, Math.ceil(bh / 2), [3, 3, 0, 0]);
        this.ctx.fill();
      }

      // Bar border
      this.ctx.strokeStyle = "rgba(255,255,255,0.15)";
      this.ctx.lineWidth = 1;
      (this.ctx as any).roundRect(bx, by, bw, bh, 3);
      this.ctx.stroke();

      // Segment ticks (4 ticks = 5 segments of 20%)
      this.ctx.strokeStyle = "rgba(0,0,0,0.35)";
      this.ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        const tx = bx + bw * (i / 5);
        this.ctx.beginPath(); this.ctx.moveTo(tx, by + 1); this.ctx.lineTo(tx, by + bh - 1); this.ctx.stroke();
      }

      this.ctx.restore();

    } else {
      // ── MAP 2/3: Compact top-right HUD panel ──
      const panelW = 190;
      const panelH = 50;
      const panelX = state.width - panelW - 12;
      const panelY = 12;

      this.ctx.save();

      // Panel shadow
      this.ctx.shadowColor = "rgba(0,0,0,0.6)";
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetY = 3;

      // Panel background
      this.ctx.fillStyle = "rgba(8, 12, 22, 0.92)";
      (this.ctx as any).roundRect(panelX, panelY, panelW, panelH, 7);
      this.ctx.fill();
      this.ctx.shadowBlur = 0; this.ctx.shadowOffsetY = 0;

      // Panel border
      this.ctx.strokeStyle = isCritical
        ? `rgba(255,60,60,${0.5 + pulse * 0.5})`
        : isLow ? "rgba(255,160,30,0.55)" : "rgba(80,220,160,0.35)";
      this.ctx.lineWidth = 1.5;
      (this.ctx as any).roundRect(panelX, panelY, panelW, panelH, 7);
      this.ctx.stroke();

      // Shield icon
      const iconX = panelX + 16; const iconY = panelY + panelH / 2;
      this.ctx.fillStyle = isCritical ? `rgba(255,80,80,${0.7 + pulse * 0.3})` : isLow ? "#FFA020" : "#40DCA0";
      this.ctx.beginPath();
      this.ctx.moveTo(iconX, iconY - 9);
      this.ctx.lineTo(iconX + 7, iconY - 6);
      this.ctx.lineTo(iconX + 7, iconY + 1);
      this.ctx.quadraticCurveTo(iconX + 7, iconY + 7, iconX, iconY + 10);
      this.ctx.quadraticCurveTo(iconX - 7, iconY + 7, iconX - 7, iconY + 1);
      this.ctx.lineTo(iconX - 7, iconY - 6);
      this.ctx.closePath();
      this.ctx.fill();

      // Divider line
      this.ctx.strokeStyle = "rgba(255,255,255,0.08)";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(panelX + 30, panelY + 6);
      this.ctx.lineTo(panelX + 30, panelY + panelH - 6);
      this.ctx.stroke();

      // Label row
      this.ctx.fillStyle = "rgba(180,200,220,0.7)";
      this.ctx.font = "bold 8px 'Orbitron'";
      this.ctx.textAlign = "left";
      this.ctx.fillText("VILLAGE DEFENSE", panelX + 37, panelY + 17);

      // HP readout
      const hpStr = `${Math.ceil(hp)} / ${maxHp}`;
      this.ctx.fillStyle = isCritical ? `rgba(255,100,100,${0.85 + pulse * 0.15})` : "#ffffff";
      this.ctx.font = "bold 13px 'Orbitron'";
      this.ctx.fillText(hpStr, panelX + 37, panelY + 32);

      // Bar track
      const bx = panelX + 37; const by = panelY + 37;
      const bw = panelW - 47; const bh = 6;
      this.ctx.fillStyle = "rgba(255,255,255,0.07)";
      (this.ctx as any).roundRect(bx, by, bw, bh, 3);
      this.ctx.fill();

      // Bar fill
      const fillW = Math.max(0, pct * bw);
      if (fillW > 0) {
        const grad = this.ctx.createLinearGradient(bx, 0, bx + bw, 0);
        grad.addColorStop(0, isCritical ? "#CC0000" : isLow ? "#FFA020" : "#40DCA0");
        grad.addColorStop(1, isCritical ? "#FF6060" : isLow ? "#FFD060" : "#00F5A0");
        this.ctx.fillStyle = grad;
        (this.ctx as any).roundRect(bx, by, fillW, bh, 3);
        this.ctx.fill();

        // Gloss
        this.ctx.fillStyle = "rgba(255,255,255,0.22)";
        (this.ctx as any).roundRect(bx, by, fillW, Math.ceil(bh / 2), [3, 3, 0, 0]);
        this.ctx.fill();
      }

      // Bar border
      this.ctx.strokeStyle = "rgba(255,255,255,0.12)";
      this.ctx.lineWidth = 1;
      (this.ctx as any).roundRect(bx, by, bw, bh, 3);
      this.ctx.stroke();

      // Segment ticks
      this.ctx.strokeStyle = "rgba(0,0,0,0.3)";
      this.ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        const tx = bx + bw * (i / 5);
        this.ctx.beginPath(); this.ctx.moveTo(tx, by + 1); this.ctx.lineTo(tx, by + bh - 1); this.ctx.stroke();
      }

      // Critical pulse ring around panel
      if (isCritical) {
        this.ctx.strokeStyle = `rgba(255,60,60,${pulse * 0.4})`;
        this.ctx.lineWidth = 3;
        (this.ctx as any).roundRect(panelX - 2, panelY - 2, panelW + 4, panelH + 4, 9);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }
  }

  private drawTown(state: any, images: { [key: string]: HTMLImageElement }) {
    let tx = state.town.x, ty = state.town.y;
    if (state.town.hurt) { tx += (Math.random() - 0.5) * 4; ty += (Math.random() - 0.5) * 4; }
    this.ctx.save();
    if (state.town.hurt) { this.ctx.shadowBlur = 15; this.ctx.shadowColor = "rgba(255, 0, 0, 0.8)"; }
    const v = [images['village1'], images['village2'], images['village3'], images['village4'], images['village5'], images['buildingSmith']];
    if (v[3] && v[3].complete) this.ctx.drawImage(v[3], tx - 100, ty - 60, 160, 160);
    if (v[4] && v[4].complete) this.ctx.drawImage(v[4], tx + 180, ty - 60, 160, 160);
    if (v[0] && v[0].complete) this.ctx.drawImage(v[0], tx, ty, state.town.w, state.town.h);
    if (v[1] && v[1].complete) this.ctx.drawImage(v[1], tx + 120, ty + 20, 140, 140);
    if (v[2] && v[2].complete) this.ctx.drawImage(v[2], tx - 60, ty + 40, 120, 120);
    if (state.town.hurt) { this.ctx.fillStyle = "rgba(255, 0, 0, 0.2)"; this.ctx.fillRect(tx - 100, ty - 60, 440, 240); }
    this.ctx.restore();
    if (v[5] && v[5].complete) this.ctx.drawImage(v[5], 0, 200, 500, 300, tx - 30, ty, state.town.w + 160, state.town.h + 40);
  }

  private drawPlayer(state: any, images: { [key: string]: HTMLImageElement }, loadedAttackImages: HTMLImageElement[]) {
    let img = images['idle']; let sourceFrame = state.frame;
    if (["left", "right", "up", "down"].includes(state.direction)) img = images['run'];
    if (state.direction === "attack") { img = loadedAttackImages[state.currentAttackIndex]; sourceFrame = state.attackFrameIndex; }
    if (state.direction === "attack2") img = images['attack4'];
    if (state.direction === "charge") img = images['attack1'];
    if (state.hurt) { img = images['hurt']; sourceFrame = state.frame % 2; }
    if (state.gameover) img = images['dead'];
    if (img && img.complete) {
      this.ctx.save(); this.ctx.beginPath(); this.ctx.translate(state.x + state.w / 2, state.y + state.h);
      this.ctx.scale(1.5, 0.4); this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.45)"; this.ctx.fill(); this.ctx.restore();
      const flipped = state.lastDirection === "left";
      this.ctx.save();
      if (state.hurt) {
        this.ctx.shadowBlur = 15; this.ctx.shadowColor = "red";
        this.ctx.filter = "brightness(1.5) sepia(1) saturate(5) hue-rotate(-50deg)"; // Reddish tint
      }
      if (flipped) {
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(img, sourceFrame * 128, 0, 128, 128, -state.x - state.w - 30, state.y - 70, 120, 120);
      }
      else {
        this.ctx.drawImage(img, sourceFrame * 128, 0, 128, 128, state.x - 30, state.y - 70, 120, 120);
      }
      this.ctx.restore();

      if (state.direction === "attack2") {
        this.drawFiringBar(state);
      }
    }
  }

  private drawMagicBeam(state: any) {
    const beamY = state.y + 8; const beamHeight = 40; const beamWidth = state.width; 
    const pulse = Math.sin(Date.now() / 50) * 8;
    this.ctx.save();
    if (state.lastDirection === "left") { this.ctx.scale(-1, 1); this.renderBeamEffect(-state.x + 13, beamY - pulse / 2, beamWidth, beamHeight + pulse); }
    else { this.renderBeamEffect(state.x + 45, beamY - pulse / 2, beamWidth, beamHeight + pulse); }
    this.ctx.restore();
    
    // Add extra particles along the beam for intensity
    if (Math.random() > 0.5) {
      const bx = state.x + (state.lastDirection === "right" ? 100 : -100);
      state.particles.push({ 
        x: bx + Math.random() * 400 * (state.lastDirection === "right" ? 1 : -1), 
        y: beamY + Math.random() * 40 - 20, 
        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, 
        life: 10, r: 1 + Math.random() * 2, color: "#99FFFF" 
      });
    }
  }

  private renderBeamEffect(bx: number, by: number, bw: number, bh: number) {
    // Dynamic animated core
    const time = Date.now() / 100;
    const centerY = by + bh / 2;
    const startH = 3; // THIN START as requested
    const endH = bh; // Full target height at distance

    const coreGrad = this.ctx.createLinearGradient(bx, by, bx, by + bh);
    coreGrad.addColorStop(0, "rgba(0, 255, 255, 0)"); 
    coreGrad.addColorStop(0.2 + Math.sin(time) * 0.05, "rgba(0, 255, 255, 0.8)");
    coreGrad.addColorStop(0.5, "#fff"); 
    coreGrad.addColorStop(0.8 - Math.sin(time) * 0.05, "rgba(0, 255, 255, 0.8)"); 
    coreGrad.addColorStop(1, "rgba(0, 255, 255, 0)");

    this.ctx.save();
    
    // Conical outer glow
    this.ctx.shadowBlur = 30; this.ctx.shadowColor = "#00ffff"; 
    this.ctx.fillStyle = "rgba(0, 217, 255, 0.25)";
    this.ctx.beginPath();
    this.ctx.moveTo(bx, centerY - (startH + 5) / 2);
    this.ctx.lineTo(bx + bw, centerY - (endH + 20) / 2);
    this.ctx.lineTo(bx + bw, centerY + (endH + 20) / 2);
    this.ctx.lineTo(bx, centerY + (startH + 5) / 2);
    this.ctx.fill();
    
    // Conical core
    this.ctx.shadowBlur = 0; 
    this.ctx.fillStyle = coreGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(bx, centerY - startH / 2);
    this.ctx.lineTo(bx + bw, centerY - endH / 2);
    this.ctx.lineTo(bx + bw, centerY + endH / 2);
    this.ctx.lineTo(bx, centerY + startH / 2);
    this.ctx.fill();
    
    // Electric arcs (tightened at start point)
    this.ctx.beginPath(); this.ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"; this.ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        let lx = bx; let ly = centerY;
        this.ctx.moveTo(lx, ly);
        for(let step = 1; step <= 10; step++) {
            const progress = step / 10;
            lx = bx + bw * progress; 
            const currentSpread = (startH + 2) + (endH - startH) * progress;
            ly = centerY + (Math.random() - 0.5) * currentSpread;
            this.ctx.lineTo(lx, ly);
        }
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawEnemy(state: any, images: { [key: string]: HTMLImageElement }, i: number) {
    let img = images['skeleton_walk'];
    if (state.enemy.enemydeath[i]) img = images['skeleton_death'];
    else if (state.enemy.hurt[i]) img = images['skeleton_hurt'];
    else if (state.enemy.attack[i] || state.enemy.attackingplayer[i]) {
      const type = state.enemy.attackType[i] || 0;
      const attackKeys = ['skeleton_attack', 'skeleton_attack2', 'skeleton_attack3'];
      img = images[attackKeys[type]];
    }

    if (img && img.complete) {
      // Draw shadow (LOWERED) - ONLY IF ALIVE
      if (!state.enemy.enemydeath[i]) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(state.enemy.x[i] + 5, state.enemy.y[i] + 40);
        this.ctx.scale(1.8, 0.5);
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(0,0,0,0.5)";
        this.ctx.fill();
        this.ctx.restore();
      }

      let currentFrame = 0;
      const sheetFrames = Math.floor(img.width / 128) || 1; 

      if (state.enemy.enemydeath[i]) {
        currentFrame = state.enemy.deathFrame[i]; 
      } else {
        currentFrame = state.enemy_Frame % sheetFrames;
      }

      // Draw skeleton with high-fidelity framing (100x100)
      this.ctx.save();
      if (state.enemy.attackingplayer[i] && !state.enemy.enemydeath[i]) {
          this.ctx.shadowBlur = 10; this.ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
      }
      if (state.enemy.hurt[i]) {
          this.ctx.filter = "brightness(2) contrast(1.5)";
      }
      this.ctx.drawImage(img, currentFrame * 128, 0, 128, 128, state.enemy.x[i] - 40, state.enemy.y[i] - 60, 100, 100);
      this.ctx.restore();

      if (!state.enemy.enemydeath[i]) {
        this.ctx.fillStyle = "rgba(0,0,0,0.5)";
        this.ctx.fillRect(state.enemy.x[i], state.enemy.y[i] - 25, 20, 3);
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(state.enemy.x[i], state.enemy.y[i] - 25, (state.enemy.health[i] / state.enemy.maxHealth[i]) * 20, 3);
      }
    }
  }

  private drawParticles(state: any) {
    state.particles.forEach((p: Particle) => { this.ctx.fillStyle = p.color || "red"; this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); this.ctx.fill(); });
  }

  private drawUI(state: any, images: { [key: string]: HTMLImageElement }) { this.drawHealthBar(state, images); this.drawManaBar(state); this.drawLevelUI(state); if (state.pausebutton.boolean) this.drawPauseOverlay(state); }

  private drawHealthBar(state: any, images: { [key: string]: HTMLImageElement }) {
    const x = 1, y = 10, w_f = 260, h_f = 45, b_x = x + 80, b_h = 10, b_w = 160, b_y = y + (h_f / 2) - (b_h / 2);
    this.ctx.fillStyle = "rgba(94, 97, 100, 0.85)"; this.ctx.fillRect(x, y, w_f, h_f);
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.05)"; this.ctx.fillRect(b_x, b_y, b_w, b_h);
    
    const flash = state.playerHealth < state.playermaxHealth * 0.25 && Date.now() % 400 < 200;
    this.ctx.fillStyle = flash ? "white" : "#FF0055"; this.ctx.fillRect(b_x, b_y, (state.playerHealth / state.playermaxHealth) * b_w, b_h);
    
    // Border for health bar slot
    this.ctx.strokeStyle = flash ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.3)";
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(b_x, b_y, b_w, b_h);

    const prof = images['profile'];
    if (prof && prof.complete) this.ctx.drawImage(prof, 0, 1, 70, 50, 20, 10, 60, 45);
  }

  private drawManaBar(state: any) {
    const x = 77, y = 65, w_f = 168, h_f = 18; // Aligned with health bar slot
    this.ctx.fillStyle = "rgba(28, 38, 48, 0.85)"; this.ctx.fillRect(x, y, w_f, h_f);
    
    // Background bar mana flash (represents the "missing" mana or threshold)
    if (state.manaFlash > 0) {
      this.ctx.save();
      const currentW = (state.mana / state.maxMana) * (w_f - 8);
      const targetW = (100 / state.maxMana) * (w_f - 8); // Mana required at 100
      this.ctx.fillStyle = `rgba(0, 255, 255, ${state.manaFlash * 0.45})`;
      // Draw from current mana position to the required 100 mana mark
      this.ctx.fillRect(x + 4 + currentW, y + 4, Math.max(0, targetW - currentW), h_f - 8);
      
      // NOT ENOUGH MANA text (Moved below the bar)
      this.ctx.fillStyle = `rgba(255, 255, 255, ${state.manaFlash})`;
      this.ctx.font = "bold 13px 'Orbitron'";
      this.ctx.fillText("NOT ENOUGH MANA!", x, y + h_f + 14);
      this.ctx.restore();
    }
    
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.05)"; this.ctx.fillRect(x + 4, y + 4, w_f - 8, h_f - 8);
    this.ctx.fillStyle = "#00FFFF"; this.ctx.fillRect(x + 4, y + 4, (state.mana / state.maxMana) * (w_f - 8), h_f - 8);
  }

  private drawLevelUI(state: any) {
    this.ctx.fillStyle = "rgba(28, 38, 48, 0.6)"; this.ctx.fillRect(state.width / 2 - 60, 10, 120, 35);
    this.ctx.strokeStyle = COLORS.gold; this.ctx.lineWidth = 1; this.ctx.strokeRect(state.width / 2 - 60, 10, 120, 35);
    this.ctx.fillStyle = COLORS.white; this.ctx.font = "bold 18px 'Orbitron'"; this.ctx.textAlign = "center";
    this.ctx.fillText("LVL " + state.current_level, state.width / 2, 33); this.ctx.textAlign = "start";
  }

  private drawPauseOverlay(state: any) {
    const W = state.width, H = state.height;

    // Dim the game behind
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    this.ctx.fillRect(0, 0, W, H);

    // ── Frosted panel ──
    const panelW = 340, panelH = 280;
    const panelX = W / 2 - panelW / 2, panelY = H / 2 - panelH / 2 - 10;

    this.ctx.save();
    this.ctx.shadowColor = "rgba(0,0,0,0.8)";
    this.ctx.shadowBlur = 30;
    this.ctx.shadowOffsetY = 8;
    this.ctx.fillStyle = "rgba(10, 14, 26, 0.96)";
    (this.ctx as any).roundRect(panelX, panelY, panelW, panelH, 14);
    this.ctx.fill();
    this.ctx.shadowBlur = 0; this.ctx.shadowOffsetY = 0;

    // Panel border
    this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
    this.ctx.lineWidth = 1.5;
    (this.ctx as any).roundRect(panelX, panelY, panelW, panelH, 14);
    this.ctx.stroke();
    this.ctx.restore();

    // ── Header ──
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 34px 'Orbitron'";
    this.ctx.fillText("PAUSED", W / 2, panelY + 48);

    // Thin divider under heading
    this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(panelX + 24, panelY + 60);
    this.ctx.lineTo(panelX + panelW - 24, panelY + 60);
    this.ctx.stroke();
    this.ctx.restore();

    // ── Buttons (Resume / Settings / Quit) ──
    const btnW = panelW - 48, btnH = 44;
    const btnX = panelX + 24;

    // Resume button — highlighted
    state.resumeButton.x = btnX;
    state.resumeButton.y = panelY + 76;
    state.resumeButton.width = btnW;
    state.resumeButton.height = btnH;
    this.ctx.save();
    const resumeGrad = this.ctx.createLinearGradient(btnX, 0, btnX + btnW, 0);
    resumeGrad.addColorStop(0, state.resumeButton.hover ? "rgba(37,180,218,0.5)" : "rgba(37,180,218,0.25)");
    resumeGrad.addColorStop(1, state.resumeButton.hover ? "rgba(56,239,125,0.4)" : "rgba(56,239,125,0.15)");
    this.ctx.fillStyle = resumeGrad;
    (this.ctx as any).roundRect(btnX, state.resumeButton.y, btnW, btnH, 8);
    this.ctx.fill();
    this.ctx.strokeStyle = state.resumeButton.hover ? "rgba(37,210,140,0.8)" : "rgba(37,210,140,0.35)";
    this.ctx.lineWidth = 1.5;
    (this.ctx as any).roundRect(btnX, state.resumeButton.y, btnW, btnH, 8);
    this.ctx.stroke();
    this.ctx.fillStyle = state.resumeButton.hover ? "#ffffff" : "rgba(200,235,220,0.9)";
    this.ctx.font = "bold 14px 'Orbitron'";
    this.ctx.textAlign = "center";
    this.ctx.fillText("▶  RESUME", W / 2, state.resumeButton.y + 28);
    this.ctx.restore();

    // Settings button
    state.pauseSettingsButton.x = btnX;
    state.pauseSettingsButton.y = panelY + 132;
    state.pauseSettingsButton.width = btnW;
    state.pauseSettingsButton.height = btnH;
    this.drawStyledButton("⚙  SETTINGS", state.pauseSettingsButton);

    // Quit button
    state.backtomenu_ui.x = btnX;
    state.backtomenu_ui.y = panelY + 188;
    state.backtomenu_ui.width = btnW;
    state.backtomenu_ui.height = btnH;
    this.ctx.save();
    this.ctx.fillStyle = state.backtomenu_ui.hover ? "rgba(200,40,40,0.25)" : "rgba(255,255,255,0.06)";
    (this.ctx as any).roundRect(btnX, state.backtomenu_ui.y, btnW, btnH, 8);
    this.ctx.fill();
    this.ctx.strokeStyle = state.backtomenu_ui.hover ? "rgba(220,60,60,0.7)" : "rgba(255,255,255,0.1)";
    this.ctx.lineWidth = 1.5;
    (this.ctx as any).roundRect(btnX, state.backtomenu_ui.y, btnW, btnH, 8);
    this.ctx.stroke();
    this.ctx.fillStyle = state.backtomenu_ui.hover ? "#FF6060" : "rgba(200,180,180,0.7)";
    this.ctx.font = "bold 14px 'Orbitron'";
    this.ctx.textAlign = "center";
    this.ctx.fillText("✕  QUIT TO MENU", W / 2, state.backtomenu_ui.y + 28);
    this.ctx.restore();

    // ESC hint
    this.ctx.save();
    this.ctx.fillStyle = "rgba(130,145,160,0.5)";
    this.ctx.font = "9px 'Silkscreen'";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Press ESC to resume", W / 2, panelY + panelH - 10);
    this.ctx.restore();
  }

  private drawFiringBar(state: any) {
    const w = state.w + 20, h = 10, x = state.x - 10, y = state.y - 60;
    // Frame
    this.ctx.fillStyle = "rgba(28, 38, 48, 0.85)";
    this.ctx.fillRect(x, y, w, h);
    // Background slot
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    // Progress (cyan)
    this.ctx.fillStyle = "#00FFFF";
    const progress = (state.frame + 1) / state.limit;
    this.ctx.fillRect(x + 2, y + 2, progress * (w - 4), h - 4);
  }

  private drawFloatingTexts(state: any) {
    if (!state.floatingTexts || state.floatingTexts.length === 0) return;
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.font = "bold 16px 'Orbitron'";
    state.floatingTexts.forEach((ft: any) => {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      this.ctx.fillStyle = ft.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = ft.color;
      this.ctx.fillText(ft.text, ft.x, ft.y);
    });
    this.ctx.restore();
  }
}
