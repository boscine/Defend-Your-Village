import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from './game.types';
import { GameRenderer } from './game.renderer';
import { GameLogic } from './game.logic';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private renderer!: GameRenderer;
  public logic: GameLogic = new GameLogic();
  private animationId?: number;

  private images: { [key: string]: HTMLImageElement } = {};
  private loadedAttackImages: HTMLImageElement[] = [];

  constructor() {}

  ngAfterViewInit() {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.canvasRef.nativeElement.width = 1000;
    this.canvasRef.nativeElement.height = 400;
    this.renderer = new GameRenderer(ctx);
    this.initAssets();
    this.startGameLoop();
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private initAssets() {
    const assets = [
      { name: 'idle', path: 'assets/Enchantress/Idle.png' },
      { name: 'run', path: 'assets/Enchantress/Run.png' },
      { name: 'dead', path: 'assets/Enchantress/Dead.png' },
      { name: 'attack4', path: 'assets/Enchantress/Attack_4.png' },
      { name: 'attack1', path: 'assets/Enchantress/Attack_1.png' },
      { name: 'hurt', path: 'assets/Enchantress/Hurt.png' },
      { name: 'profile', path: 'assets/Enchantress/Profile.png' },
      { name: 'bg1', path: 'assets/background/Battleground1.png' },
      { name: 'bg2', path: 'assets/background/game_background_2.png' },
      { name: 'bg3', path: 'assets/background/game_background_1.png' },
      { name: 'skeleton_walk', path: 'assets/Skeleton/Walk.png' },
      { name: 'skeleton_attack', path: 'assets/Skeleton/Attack_1.png' },
      { name: 'skeleton_attack2', path: 'assets/Skeleton/Attack_2.png' },
      { name: 'skeleton_attack3', path: 'assets/Skeleton/Attack_3.png' },
      { name: 'skeleton_death', path: 'assets/Skeleton/Dead.png' },
      { name: 'skeleton_hurt', path: 'assets/Skeleton/Hurt.png' },
      { name: 'village1', path: 'assets/background/Villagebuilding1.png' },
      { name: 'village2', path: 'assets/background/Villagebuilding2.png' },
      { name: 'village3', path: 'assets/background/Villagebuilding3.png' },
      { name: 'village4', path: 'assets/background/Villagebuilding4.png' },
      { name: 'village5', path: 'assets/background/Villagebuilding5.png' },
      { name: 'buildingSmith', path: 'assets/background/Villagebuilding5.png' }
    ];

    const attackPaths = [
      "assets/Enchantress/Attack_1.png",
      "assets/Enchantress/Attack_2.png",
      "assets/Enchantress/Attack_3.png"
    ];

    const totalToLoad = assets.length + attackPaths.length;
    this.logic.loadingTotal = totalToLoad;
    this.logic.loadingLoaded = 0;
    this.logic.loadingProgress = 0;
    this.logic.gameState = GameState.LOADING;

    const onAssetLoaded = (name: string) => {
      this.logic.loadingLoaded++;
      this.logic.loadingProgress = this.logic.loadingLoaded / totalToLoad;
      this.logic.loadingStatusText = `Loaded asset ${this.logic.loadingLoaded} of ${totalToLoad}: ${name}`;
      
      if (this.logic.loadingLoaded >= totalToLoad) {
        this.logic.loadingStatusText = "Preloading complete! Preparing battlefield...";
        setTimeout(() => {
          this.logic.gameState = GameState.START_OVERLAY;
        }, 500);
      }
    };

    assets.forEach(asset => {
      const img = new Image();
      img.onload = () => onAssetLoaded(asset.name);
      img.onerror = () => onAssetLoaded(asset.name + ' (fallback)');
      img.src = asset.path;
      this.images[asset.name] = img;
    });

    attackPaths.forEach((path, index) => {
      const img = new Image();
      img.onload = () => onAssetLoaded(`attack_anim_${index + 1}`);
      img.onerror = () => onAssetLoaded(`attack_anim_${index + 1}`);
      img.src = path;
      this.loadedAttackImages[index] = img;
    });
  }

  private startGameLoop() {
    const loop = (timestamp: number) => {
      // During LOADING the screen is essentially static — run logic+render only
      // on the loading state so the progress bar still updates, but skip the
      // full game-play render path (saves ~60 wasted heavy renders per second). (Fix #9)
      if (this.logic.gameState !== GameState.LOADING || this.logic.loadingProgress < 1) {
        this.logic.update(timestamp);
        this.renderer.draw(this.logic, this.images, this.loadedAttackImages);
      }
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") { 
      if (this.logic.gameState === GameState.PLAYING) {
        this.logic.pausebutton.boolean = !this.logic.pausebutton.boolean; 
        if (this.logic.pausebutton.boolean) this.logic.soundManager.stopBGM();
        else this.logic.soundManager.startBGM();
      }
      return; 
    }
    if (event.repeat) return;
    if (this.logic.gameState === GameState.PLAYING && !this.logic.pausebutton.boolean && !this.logic.gameover) {
      switch (event.key.toLowerCase()) {
        case "w": this.logic.moveUp = true; break; case "s": this.logic.moveDown = true; break;
        case "a": if (this.logic.movement && !this.logic.moveRight) this.logic.moveLeft = true; break;
        case "d": if (this.logic.movement && !this.logic.moveLeft) this.logic.moveRight = true; break;
        case "j": if (!this.logic.attack2 && !this.logic.charge && this.logic.movement) this.logic.attack = true; break;
        case "k": 
          if (!this.logic.attack2 && !this.logic.attack && !this.logic.charge && this.logic.movement) {
            if (this.logic.mana >= 100) {
              this.logic.attack2 = true; 
            } else {
              this.logic.manaFlash = 1.0;
              this.logic.createFloatingText("NO MANA", this.logic.x + 10, this.logic.y - 10, '#FF4136');
            }
          } break;
        case "l": if (!this.logic.attack && !this.logic.attack2) this.logic.charge = true; break;
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (this.logic.gameState === GameState.PLAYING) {
      if (["j", "l"].includes(event.key.toLowerCase())) { this.logic.direction = ""; this.logic.movement = true; this.logic.limit = 2; this.logic.frame = 0; }
      switch (event.key.toLowerCase()) {
        case "a": this.logic.moveLeft = false; this.logic.lastDirection = "left"; break; case "d": this.logic.moveRight = false; this.logic.lastDirection = "right"; break;
        case "w": this.logic.moveUp = false; break; case "s": this.logic.moveDown = false; break;
        case "j": this.logic.attack = false; this.logic.attackhitbox.attackhit = false; break; 
        case "l": this.logic.charge = false; break;
      }
    }
  }

  handleMouseMove(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const mx = event.clientX - rect.left; const my = event.clientY - rect.top;
    if (this.logic.gameState === GameState.MENU || this.logic.gameState === GameState.CONTROLS) {
      this.logic.playButton.hover = this.checkInBounds(mx, my, this.logic.playButton);
      this.logic.controlsButton.hover = this.checkInBounds(mx, my, this.logic.controlsButton);
      this.logic.settingsButton.hover = this.checkInBounds(mx, my, this.logic.settingsButton);
      this.logic.exitButton.hover = this.checkInBounds(mx, my, this.logic.exitButton);
    } else if (this.logic.gameState === GameState.SETTINGS) {
      this.logic.volUpSFX.hover = this.checkInBounds(mx, my, this.logic.volUpSFX);
      this.logic.volDownSFX.hover = this.checkInBounds(mx, my, this.logic.volDownSFX);
      this.logic.volUpBGM.hover = this.checkInBounds(mx, my, this.logic.volUpBGM);
      this.logic.volDownBGM.hover = this.checkInBounds(mx, my, this.logic.volDownBGM);
      this.logic.toggleLowEndBtn.hover = this.checkInBounds(mx, my, this.logic.toggleLowEndBtn);
      this.logic.toggleContrastBtn.hover = this.checkInBounds(mx, my, this.logic.toggleContrastBtn);
      this.logic.toggleMotionBtn.hover = this.checkInBounds(mx, my, this.logic.toggleMotionBtn);
      this.logic.settingsBackButton.hover = this.checkInBounds(mx, my, this.logic.settingsBackButton);
    } else if (this.logic.gameState === GameState.PLAYING && this.logic.pausebutton.boolean) {
      this.logic.backtomenu_ui.hover = this.checkInBounds(mx, my, this.logic.backtomenu_ui);
      this.logic.resumeButton.hover = this.checkInBounds(mx, my, this.logic.resumeButton);
      this.logic.pauseSettingsButton.hover = this.checkInBounds(mx, my, this.logic.pauseSettingsButton);
    }
  }

  handleCanvasClick(event: MouseEvent) {
    this.logic.soundManager.enable();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const mx = event.clientX - rect.left; const my = event.clientY - rect.top;
    this.processCanvasInteraction(mx, my);
  }

  // ─────────────────────────────────────────────────────────────
  // Touch events on the canvas (for menu / settings interactions)
  // ─────────────────────────────────────────────────────────────

  handleTouchStart(event: TouchEvent) {
    event.preventDefault(); // Prevent ghost mouse-click delay on mobile
    this.logic.soundManager.enable();
  }

  handleTouchEnd(event: TouchEvent) {
    event.preventDefault();
    if (event.changedTouches.length === 0) return;
    const touch = event.changedTouches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();

    // Scale touch coordinates from CSS pixels to canvas logical pixels
    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;
    const mx = (touch.clientX - rect.left) * scaleX;
    const my = (touch.clientY - rect.top) * scaleY;

    this.processCanvasInteraction(mx, my);
  }

  handleTouchMove(event: TouchEvent) {
    // Prevent default scrolling while the finger moves over the canvas
    event.preventDefault();
  }

  /**
   * Shared click/tap handler — works for both mouse (desktop) and touch (mobile)
   * because touch coordinates are already scaled to canvas space by the caller.
   */
  private processCanvasInteraction(mx: number, my: number) {
    if (this.logic.gameState === GameState.START_OVERLAY) {
      this.logic.soundManager.playMenuClick();
      this.logic.gameState = GameState.MENU;
    } else if (this.logic.gameState === GameState.MENU) {
      if (this.checkInBounds(mx, my, this.logic.playButton)) { this.logic.soundManager.playMenuClick(); this.logic.resetGame(); this.renderer.invalidateGradients(); }
      else if (this.checkInBounds(mx, my, this.logic.controlsButton)) { this.logic.soundManager.playMenuClick(); this.logic.gameState = GameState.CONTROLS; }
      else if (this.checkInBounds(mx, my, this.logic.settingsButton)) {
        this.logic.soundManager.playMenuClick();
        this.logic.settingsPreviousState = GameState.MENU;
        this.logic.gameState = GameState.SETTINGS;
      }
    } else if (this.logic.gameState === GameState.CONTROLS) {
      if (this.checkInBounds(mx, my, this.logic.exitButton)) { this.logic.soundManager.playMenuClick(); this.logic.gameState = GameState.MENU; }
    } else if (this.logic.gameState === GameState.SETTINGS) {
      const sm = this.logic.soundManager;
      if (this.checkInBounds(mx, my, this.logic.volDownSFX)) { sm.playMenuClick(); sm.sfxVolume = Math.max(0, sm.sfxVolume - 0.1); }
      else if (this.checkInBounds(mx, my, this.logic.volUpSFX)) { sm.playMenuClick(); sm.sfxVolume = Math.min(1, sm.sfxVolume + 0.1); }
      else if (this.checkInBounds(mx, my, this.logic.volDownBGM)) { sm.playMenuClick(); sm.bgmVolume = Math.max(0, sm.bgmVolume - 0.1); sm.updateVolumes(); }
      else if (this.checkInBounds(mx, my, this.logic.volUpBGM)) { sm.playMenuClick(); sm.bgmVolume = Math.min(1, sm.bgmVolume + 0.1); sm.updateVolumes(); }
      else if (this.checkInBounds(mx, my, this.logic.toggleLowEndBtn)) { sm.playMenuClick(); this.logic.accessibility.lowEndMode = !this.logic.accessibility.lowEndMode; }
      else if (this.checkInBounds(mx, my, this.logic.toggleContrastBtn)) { sm.playMenuClick(); this.logic.accessibility.highContrast = !this.logic.accessibility.highContrast; }
      else if (this.checkInBounds(mx, my, this.logic.toggleMotionBtn)) { sm.playMenuClick(); this.logic.accessibility.reducedMotion = !this.logic.accessibility.reducedMotion; }
      else if (this.checkInBounds(mx, my, this.logic.settingsBackButton)) {
        sm.playMenuClick();
        if (this.logic.settingsPreviousState === GameState.PLAYING) {
          this.logic.gameState = GameState.PLAYING;
        } else {
          this.logic.gameState = GameState.MENU;
        }
      }
    } else if (this.logic.gameState === GameState.PLAYING && this.logic.pausebutton.boolean) {
      if (this.checkInBounds(mx, my, this.logic.resumeButton)) {
        this.logic.soundManager.playMenuClick();
        this.logic.pausebutton.boolean = false;
        this.logic.soundManager.startBGM();
      } else if (this.checkInBounds(mx, my, this.logic.pauseSettingsButton)) {
        this.logic.soundManager.playMenuClick();
        this.logic.settingsPreviousState = GameState.PLAYING;
        this.logic.gameState = GameState.SETTINGS;
      } else if (this.checkInBounds(mx, my, this.logic.backtomenu_ui)) { 
        this.logic.soundManager.playMenuClick(); 
        this.logic.gameState = GameState.MENU; 
        this.logic.pausebutton.boolean = false; 
        this.logic.soundManager.startBGM(); 
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // On-screen button press/release handlers (mobile D-pad & actions)
  // ─────────────────────────────────────────────────────────────

  /**
   * Called by the mobile touch control buttons in the template.
   * Maps virtual button names ('up', 'left', 'j', 'k', 'l', 'esc') to the
   * same game logic flags that keyboard input sets.
   */
  onTouchBtn(action: string, isPress: boolean, event: TouchEvent) {
    // Prevent the touch from propagating to the canvas or triggering click events
    event.preventDefault();
    event.stopPropagation();

    // Unlock audio context on first user gesture (same as mouse click on canvas)
    this.logic.soundManager.enable();

    if (isPress) {
      this.onMobileBtnPress(action);
    } else {
      this.onMobileBtnRelease(action);
    }
  }

  private onMobileBtnPress(action: string) {
    // Pause / ESC — always allowed
    if (action === 'esc') {
      if (this.logic.gameState === GameState.PLAYING) {
        this.logic.pausebutton.boolean = !this.logic.pausebutton.boolean;
        if (this.logic.pausebutton.boolean) this.logic.soundManager.stopBGM();
        else this.logic.soundManager.startBGM();
      }
      return;
    }

    if (this.logic.gameState !== GameState.PLAYING) return;
    if (this.logic.pausebutton.boolean) return;
    if (this.logic.gameover) return;

    switch (action) {
      case 'up':    this.logic.moveUp = true;    break;
      case 'down':  this.logic.moveDown = true;  break;
      case 'left':
        if (this.logic.movement && !this.logic.moveRight) this.logic.moveLeft = true;
        break;
      case 'right':
        if (this.logic.movement && !this.logic.moveLeft) this.logic.moveRight = true;
        break;
      case 'j':
        if (!this.logic.attack2 && !this.logic.charge && this.logic.movement) this.logic.attack = true;
        break;
      case 'k':
        if (!this.logic.attack2 && !this.logic.attack && !this.logic.charge && this.logic.movement) {
          if (this.logic.mana >= 100) {
            this.logic.attack2 = true;
          } else {
            this.logic.manaFlash = 1.0;
            this.logic.createFloatingText("NO MANA", this.logic.x + 10, this.logic.y - 10, '#FF4136');
          }
        }
        break;
      case 'l':
        if (!this.logic.attack && !this.logic.attack2) this.logic.charge = true;
        break;
    }
  }

  private onMobileBtnRelease(action: string) {
    if (this.logic.gameState !== GameState.PLAYING) return;

    switch (action) {
      case 'up':    this.logic.moveUp = false;   break;
      case 'down':  this.logic.moveDown = false; break;
      case 'left':
        this.logic.moveLeft = false;
        this.logic.lastDirection = 'left';
        break;
      case 'right':
        this.logic.moveRight = false;
        this.logic.lastDirection = 'right';
        break;
      case 'j':
        this.logic.attack = false;
        this.logic.attackhitbox.attackhit = false;
        this.logic.direction = "";
        this.logic.movement = true;
        this.logic.limit = 2;
        this.logic.frame = 0;
        break;
      case 'l':
        this.logic.charge = false;
        this.logic.direction = "";
        this.logic.movement = true;
        this.logic.limit = 2;
        this.logic.frame = 0;
        break;
      case 'k':
        // attack2 ends automatically at frame 9; nothing to reset on release
        break;
    }
  }

  private checkInBounds(x: number, y: number, btn: any) { return x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height; }
}
