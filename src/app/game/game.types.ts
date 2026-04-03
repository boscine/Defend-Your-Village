export enum GameState {
  MENU,
  CONTROLS,
  PLAYING,
  GAMEOVER
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
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  r: number;
  color: string;
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
