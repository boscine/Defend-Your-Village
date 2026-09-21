export enum GameState {
  LOADING,
  START_OVERLAY,
  MENU,
  CONTROLS,
  PLAYING,
  GAMEOVER,
  SETTINGS
}

export interface AccessibilitySettings {
  lowEndMode: boolean;       // Ultra performance mode: disables heavy shadows, filters, and screen shake
  highContrast: boolean;     // Increases contrast on healthbars and text elements
  reducedMotion: boolean;    // Removes floating/animating text motion and title bobbing
  showFps: boolean;          // Displays live FPS and performance counter
  screenReaderText: string;  // Text announced for ARIA / screen readers
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Button extends Point, Size {
  hover: boolean;
}

export interface Town {
  x: number;
  y: number;
  w: number;
  h: number;
  health: number;
  maxHealth: number;
  hurt: boolean;
  hurtTimer: number;
  alive: boolean;
}

export interface EnemyState {
  [key: string]: any;
  x: number[];
  y: number[];
  w: number;
  h: number;
  speed: number[];
  enemydeath: boolean[];
  attack: boolean[];
  health: number[];
  maxHealth: number[];
  move: boolean[];
  attackingplayer: boolean[];
  playerattack_death: boolean[];
  damage_value: number[];
  blinking: boolean[];
  blinkTimer: number[];
  deathFrame: number[];
  flash: boolean[];
  hurt: boolean[];
  hurtTimer: number[];
  attackType: number[];
}

export interface AttackHitbox {
  x: number;
  y: number;
  w: number;
  h: number;
  attackhit: boolean;
}

export const COLORS = {
  cyan: "#25B4DA",
  blue: "#6C8CAC",
  red: "#C7494C",
  maroon: "#7A404B",
  gold: "#D7CF9E",
  tan: "#B87C5F",
  dark: "#1C2630",
  white: "#E1DEDD"
};

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
}
