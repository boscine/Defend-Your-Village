# 🔮 Defend Your Village

**Defend Your Village** is a dynamic action-defense game where you play as a powerful Enchantress protecting her home from an endless skeleton invasion. 

Master your magical skills, manage your mana, and keep the villagers safe by patrolling the forests and intersepting the skeletons before they reach Map 1.

---

## 🕹️ Controls

### ⌨️ Desktop (Keyboard)

| Key | Action |
| --- | --- |
| **W A S D** | Move the Enchantress |
| **J** | **Melee Strike** - Hits up to 2 enemies & heals the player |
| **K** | **Magic Beam** - Powerful conical blast (Requires 100 Mana) |
| **L** | **Charge Mana** - Channel energy to cast spells again |
| **ESC** | Tactical Pause |

### 📱 Mobile / Touch

The game automatically shows an on-screen gamepad when played on a touch device (phone or tablet):

| Control | Action |
| --- | --- |
| **D-Pad (▲ ▼ ◀ ▶)** | Move the Enchantress |
| **⚔ HIT** | Melee Strike — hits up to 2 enemies & restores health |
| **✦ BEAM** | Magic Beam — powerful ranged blast (Requires 100 Mana) |
| **⚡ MANA** | Charge Mana — hold to refill mana for the beam |
| **⏸ PAUSE** | Pause / Resume the game |

> The game is fully playable on portrait or landscape orientation. Landscape is recommended for the best experience on phones.

---

## ⚔️ Game Mechanics

- **Progressive Difficulty**: Enemies gain more health and move faster each level. Every level adds 3 additional enemies to the horde.
- **Village Defense**: If either the Player or the Village health reaches zero, the game is over.
- **Guiding HUD**: A pulsing guide will show you where the enemies are located across the 3 maps.
- **Life Steal**: Basic melee strikes restore health, incentivizing aggressive close-range combat.

---

## ♿ Accessibility

Open **Settings** from the main menu or pause screen to configure:

| Setting | Description |
| --- | --- |
| **Low-End Mode** | Disables heavy visual effects (shadows, filters, screen shake) for maximum FPS on older devices |
| **High Contrast** | Increases contrast on health bars and HUD elements |
| **Reduced Motion** | Removes floating/animated text and title bobbing |
| **FPS Counter** | Live frames-per-second badge in the bottom corner |

---

## 🚀 Deployment (Netlify)

This project is optimized for deployment on **Netlify**.

### Deployment Instructions:
1. **Repository Integration**: Point Netlify to this GitHub repository.
2. **Build Settings**:
    - **Build Command**: `npm run build`
    - **Publish Directory**: `dist/dyv` (verify this in `angular.json` under `outputPath`)
3. **Environment**: Ensure Node.js version is 18.x or above (Netlify automatically picks this based on `package.json`).

---

## 🛠️ Built With

- **Angular** - The Web Framework
- **Canvas API** - High-performance game rendering
- **Orbitron & Silkscreen** - Modern typography for HUD and Menu
- **Sleek Matte UI Design** - Premium dark-themed HUD frames
- **Mobile-First Touch API** - Full on-screen gamepad for touch devices
