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

  // Image assets
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

    assets.forEach(asset => {
      const img = new Image();
      img.src = asset.path;
      this.images[asset.name] = img;
    });

    const attackPaths = [
      "assets/Enchantress/Attack_1.png",
      "assets/Enchantress/Attack_2.png",
      "assets/Enchantress/Attack_3.png"
    ];

    attackPaths.forEach((path, index) => {
      const img = new Image();
      img.src = path;
      this.loadedAttackImages[index] = img;
    });
  }

  private startGameLoop() {
    const loop = (timestamp: number) => {
      this.logic.update(timestamp);
      this.renderer.draw(this.logic, this.images, this.loadedAttackImages);
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
    if (event.repeat) return; // Prevent repeated triggers from holding keys
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
              this.logic.manaFlash = 1.0; // Trigger the "not enough mana" flash
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
      this.logic.settingsBackButton.hover = this.checkInBounds(mx, my, this.logic.settingsBackButton);
    } else if (this.logic.gameState === GameState.PLAYING && this.logic.pausebutton.boolean) {
      this.logic.backtomenu_ui.hover = this.checkInBounds(mx, my, this.logic.backtomenu_ui);
    }
  }

  handleCanvasClick(event: MouseEvent) {
    this.logic.soundManager.enable(); // Unlock audio context on user interaction
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const mx = event.clientX - rect.left; const my = event.clientY - rect.top;
    
    if (this.logic.gameState === GameState.START_OVERLAY) {
      this.logic.soundManager.playMenuClick();
      this.logic.gameState = GameState.MENU;
    } else if (this.logic.gameState === GameState.MENU) {
      if (this.checkInBounds(mx, my, this.logic.playButton)) { this.logic.soundManager.playMenuClick(); this.logic.resetGame(); }
      else if (this.checkInBounds(mx, my, this.logic.controlsButton)) { this.logic.soundManager.playMenuClick(); this.logic.gameState = GameState.CONTROLS; }
      else if (this.checkInBounds(mx, my, this.logic.settingsButton)) { this.logic.soundManager.playMenuClick(); this.logic.gameState = GameState.SETTINGS; }
    } else if (this.logic.gameState === GameState.CONTROLS) {
      if (this.checkInBounds(mx, my, this.logic.exitButton)) { this.logic.soundManager.playMenuClick(); this.logic.gameState = GameState.MENU; }
    } else if (this.logic.gameState === GameState.SETTINGS) {
      const sm = this.logic.soundManager;
      if (this.checkInBounds(mx, my, this.logic.volDownSFX)) { sm.playMenuClick(); sm.sfxVolume = Math.max(0, sm.sfxVolume - 0.1); }
      else if (this.checkInBounds(mx, my, this.logic.volUpSFX)) { sm.playMenuClick(); sm.sfxVolume = Math.min(1, sm.sfxVolume + 0.1); }
      else if (this.checkInBounds(mx, my, this.logic.volDownBGM)) { sm.playMenuClick(); sm.bgmVolume = Math.max(0, sm.bgmVolume - 0.1); sm.updateVolumes(); }
      else if (this.checkInBounds(mx, my, this.logic.volUpBGM)) { sm.playMenuClick(); sm.bgmVolume = Math.min(1, sm.bgmVolume + 0.1); sm.updateVolumes(); }
      else if (this.checkInBounds(mx, my, this.logic.settingsBackButton)) { sm.playMenuClick(); this.logic.gameState = GameState.MENU; }
    } else if (this.logic.gameState === GameState.PLAYING && this.logic.pausebutton.boolean) {
      if (this.checkInBounds(mx, my, this.logic.backtomenu_ui)) { 
        this.logic.soundManager.playMenuClick(); 
        this.logic.gameState = GameState.MENU; 
        this.logic.pausebutton.boolean = false; 
        this.logic.soundManager.startBGM(); 
      }
      else { this.logic.pausebutton.boolean = false; this.logic.soundManager.startBGM(); }
    }
  }

  private checkInBounds(x: number, y: number, btn: any) { return x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height; }
}
