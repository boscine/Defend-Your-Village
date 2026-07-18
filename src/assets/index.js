
function startGame() {
    const canvas = document.getElementById("lala");
    const ctx = canvas.getContext("2d");

    const width = 1000;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    let x = 100, y = 250, w = 50, h = 50, playerSpeed = 5, frame = 0, limit = 2, counter = 0, fps = 30, fpsReset = 50, direction = "", lastDirection = "left", movement = true, moveRight = false, moveLeft = false, moveUp = false, moveDown = false, attack = false, attack2 = false, charge = false;
    let gameover = false, hurt = false, hurtTimer = 0;
    let playerHealth = 100, playermaxHealth = 100;
    let map = 1;
    (mana = 100), (maxMana = 100);
    let attacklimit = 4;
    let current_level = 1, previous_level = 0; let mana_aura = { y: y };
    let dummyMap = [];

    // UI Visual Effects
    let shakeIntensity = 0;
    const colors = {
        cyan: "#25B4DA",
        blue: "#6C8CAC",
        red: "#C7494C",
        maroon: "#7A404B",
        gold: "#D7CF9E",
        tan: "#B87C5F",
        dark: "#1C2630",
        white: "#E1DEDD"
    };

    let enemies = 5;
    let particles = [];
    let canLevelUp = true;
    let currentspeed_enemy = 0.5;
    let pausebutton = { x: 905, y: 15, width: 50, height: 40, boolean: false };

    let backtomenu_ui = { x: 700, y: 345, w: 300, h: 50 };


    // TOWN DEFENSE OBJECTIVE
    let town = { x: 700, y: 200, w: 200, h: 200, alive: true, health: 100, maxHealth: 100, hurt: false, hurtTimer: 0 };

    let enemy_Frame = 0, enemy_limit = 3, enemy_Fps = 10, enemy_Counter = 0;
    let enemy = {
        x: [], y: [], w: 20, h: 20, speed: [], enemydeath: [], attack: [], health: [], maxHealth: [], move: [],
        attackingplayer: [], playerattack_death: [], damage_value: [], blinking: [], blinkTimer: [],
        deathFrame: [], flash: [], hurt: [], hurtTimer: []
    };

    let zombiedied = new Image();
    zombiedied.src = "WildZombie/Dead.png";

    let skeleton_attack = new Image(); let skeleton_death = new Image();
    skeleton_attack.src = "Skeleton/Attack_1.png"; skeleton_death.src = "Skeleton/Dead.png";



    let skeleton_attack1 = new Image();
    skeleton_attack1.src = "Skeleton/Attack_3.png";

    let skeleton = new Image();
    skeleton.src = "Skeleton/Walk.png";

    let skeleton_hurt = new Image();
    skeleton_hurt.src = "Skeleton/Hurt.png";

    let bullet = { x: x - 50, color: "rgb(0, 217, 255)", w: 1000, h: 50 };
    let attackhitbox = { x: x, y: y, w: 80, h: 60, attackhit: false };

    let playerRight = new Image(), playerLeft = new Image(), attackFrame2 = new Image(), idle = new Image(), idleMirror = new Image(), deadFrame = new Image(), profile = new Image(), background = new Image(), chargeFrame = new Image(), hurtFrame = new Image();
    playerRight.src = "Enchantress/Run.png"; playerLeft.src = "Enchantress/Run.png"; attackFrame2.src = "Enchantress/Attack_4.png"; idle.src = "Enchantress/Idle.png"; deadFrame.src = "Enchantress/Dead.png"; profile.src = "Enchantress/Profile.png"; background.src = "background/Battleground1.png"; chargeFrame.src = "Enchantress/Attack_1.png"; hurtFrame.src = "Enchantress/Hurt.png";

    let playerDeath = new Image();
    playerDeath.src = "Enchantress/Dead.png";

    let buttonpause = new Image();
    buttonpause.src = "Buttons/pause-button.png";

    let buildingSmith = new Image();
    buildingSmith.src = "background/Villagebuilding5.png";

    let Villagebuilding1 = new Image();
    Villagebuilding1.src = "background/Villagebuilding1.png";

    let Villagebuilding2 = new Image();
    Villagebuilding2.src = "background/Villagebuilding2.png";

    let Villagebuilding3 = new Image();
    Villagebuilding3.src = "background/Villagebuilding3.png";

    let Villagebuilding4 = new Image();
    Villagebuilding4.src = "background/Villagebuilding4.png";

    let Villagebuilding5 = new Image();
    Villagebuilding5.src = "background/Villagebuilding5.png";


    const attackImages = [
        { src: "Enchantress/Attack_1.png", frameCount: 6 },
        { src: "Enchantress/Attack_2.png", frameCount: 3 },
        { src: "Enchantress/Attack_3.png", frameCount: 3 },
    ];
    let imagesLoaded = 0;
    const loadedImages = [];

    attackImages.forEach((attackImage, index) => {
        const img = new Image();
        img.src = attackImage.src;
        img.onload = () => {
            imagesLoaded++;
            loadedImages[index] = img;
            if (imagesLoaded == attackImages.length) {
                requestAnimationFrame(gameLoop);
            }
        };
    });

    if (gameover == false) {
        mgazombies();
    }

    function mgazombies() {
        for (let i = 0; i < enemies; i++) {
            dummyMap[i] = 3;

            let spawnX, spawnY, colliding;
            let attempts = 0;

            // Loop until we find a clear spot or max attempts reached
            do {
                colliding = false;
                spawnX = Math.floor(Math.random() * 500) + 1;
                spawnY = Math.floor(Math.random() * 130) + 180;
                attempts++;

                // Check against previously spawned enemies in this loop
                for (let j = 0; j < i; j++) {
                    let dx = spawnX - enemy.x[j];
                    let dy = spawnY - enemy.y[j];
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 50) { // Keep enemies at least 50px apart
                        colliding = true;
                        break;
                    }
                }
            } while (colliding && attempts < 20);

            enemy.x[i] = spawnX;
            enemy.y[i] = spawnY;
            enemy.enemydeath[i] = false;
            enemy.attack[i] = false;
            enemy.move[i] = true;
            enemy.attackingplayer[i] = false;
            enemy.playerattack_death[i] = false;
            enemy.damage_value[i] = 0.1 * current_level;
            enemy.blinking[i] = false;
            enemy.blinkTimer[i] = 0;
            enemy.deathFrame[i] = 0;
            enemy.flash[i] = false;
            enemy.hurt[i] = false;
            enemy.hurtTimer[i] = 0;
            enemy.health[i] = 20 + (current_level * 5); // Enemies get tougher
            enemy.maxHealth[i] = enemy.health[i];
            enemy.speed[i] = Math.floor(Math.random() * 0.005) + (currentspeed_enemy * 0.8); // Slightly slower than player
        }
    }

    function pause_func() {
        for (let i = 0; i < enemies; i++) {
            enemy.attack[i] = false;
            enemy.attackingplayer[i] = false;
            enemy.move[i] = false;
            playerSpeed = 0;
            enemy.speed[i] = Math.floor(Math.random() * 0);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.64)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "white";
        ctx.font = "bold 50px 'Orbitron'";
        ctx.textAlign = "center";
        ctx.fillText("Paused", width / 2, height / 2 - 20);

        ctx.font = "18px 'Silkscreen'";
        ctx.fillText("Click anywhere to continue", width / 2, height / 2 + 40);

        // Exit button text
        ctx.font = "bold 20px 'Orbitron'";
        ctx.fillText("Quit to Menu", backtomenu_ui.x + backtomenu_ui.w / 2, backtomenu_ui.y + backtomenu_ui.h / 2 + 7);
        ctx.textAlign = "start";


    }

    function gameover_func() {
        for (let i = 0; i < enemies; i++) {
            enemy.attack[i] = false;
            enemy.attackingplayer[i] = false;
            enemy.move[i] = false;
            playerSpeed = 0;
            enemy.speed[i] = Math.floor(Math.random() * 0);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.64)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "white";
        ctx.font = "bold 60px 'Orbitron'";
        ctx.textAlign = "center";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff0000";
        ctx.fillText("GAME OVER", width / 2, height / 2 - 10);
        ctx.shadowBlur = 0;

        ctx.font = "18px 'Silkscreen'";
        ctx.fillText("Final Level Reached: " + current_level, width / 2, height / 2 + 40);
        ctx.fillText("Click anywhere for Main Menu", width / 2, height / 2 + 75);
        ctx.textAlign = "start";
    }

    function clearzombies() {
        for (let i = enemies - 1; i >= 0; i--) {
            if (enemy.enemydeath[i] == true) {
                if (!enemy.blinking[i]) {
                    enemy.blinking[i] = true;
                    enemy.blinkTimer[i] = 0; // Use as pulse counter
                    enemy.move[i] = false;
                    enemy.speed[i] = 0;
                } else {
                    enemy.blinkTimer[i]++;

                    // First stage: falling animation
                    if (enemy.deathFrame[i] < 3) {
                        if (enemy.blinkTimer[i] % 15 == 0) enemy.deathFrame[i]++;
                    }

                    // Final stage: atomic removal to keep all arrays in sync
                    if (enemy.blinkTimer[i] > 100) {
                        enemy.x.splice(i, 1);
                        enemy.y.splice(i, 1);
                        enemy.speed.splice(i, 1);
                        enemy.enemydeath.splice(i, 1);
                        enemy.attack.splice(i, 1);
                        enemy.health.splice(i, 1);
                        enemy.maxHealth.splice(i, 1);
                        enemy.move.splice(i, 1);
                        enemy.attackingplayer.splice(i, 1);
                        enemy.playerattack_death.splice(i, 1);
                        enemy.damage_value.splice(i, 1);
                        enemy.blinking.splice(i, 1);
                        enemy.blinkTimer.splice(i, 1);
                        enemy.deathFrame.splice(i, 1);
                        enemy.flash.splice(i, 1);
                        enemy.hurt.splice(i, 1);
                        enemy.hurtTimer.splice(i, 1);

                        dummyMap.splice(i, 1);
                        enemies -= 1;
                    }
                }
            }
        }
    }

    function level() {
        let levelup = true;

        for (let i = 0; i < enemies; i++) {
            if (enemy.enemydeath[i] == false) {
                levelup = false;
                break;
            }

        }
        if (levelup && canLevelUp) {
            canLevelUp = false;

            if (current_level >= 10) {
                for (let i = 0; i < zombies; i++) {
                    dummyMap[i] = 4;
                }
                currentspeed_enemy += current_level - 9.5;
            }

            if (current_level >= 0) {
                enemies += 5;
            }
            enemies += current_level;
            setTimeout(function () {
                mgazombies();
                canLevelUp = true;
                current_level += 1;
                previous_level += 1;

            }, 5500);
        }
    }

    function unpause_func() {
        for (let i = 0; i < enemies; i++) {
            playerSpeed = 5;
            enemy.speed[i] = Math.floor(Math.random() * 0.005) + currentspeed_enemy;
        }
    }

    function back_to_main() {
        const script = document.createElement('script');
        script.src = 'mainmenu.js';
        script.onload = () => start_menu();
        document.body.appendChild(script);
    }


    function update() {

        if (moveLeft) movePlayerLeft();
        if (moveRight) movePlayerRight();
        if (moveUp) movePlayerUp();
        if (moveDown) movePlayerDown();
        if (attack) handleAttack1();
        if (attack2) handleAttack2();
        if (charge) handleCharge();
        if (pausebutton.boolean) pause_func();
        if (!pausebutton.boolean) unpause_func();




        if (!moveLeft && !moveRight && !moveUp && !moveDown && !attack && !attack2 && !charge) {
            direction = "";
            fps = fpsReset;
        }
        if (gameover == true) gameover_func();
        update_dummy();
        level();
        clearzombies();
        updateMap();
        updateFrames();
        updateParticles();
    }

    function createBlood(px, py) {
        for (let i = 0; i < 6; i++) {
            particles.push({
                x: px, y: py,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 25,
                r: 2 + Math.random() * 3,
                color: "red"
            });
        }
    }

    function createDebris(px, py) {
        for (let i = 0; i < 8; i++) {
            particles.push({
                x: px + (Math.random() - 0.5) * 50,
                y: py + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 6, // Upward burst
                life: 30,
                r: 3 + Math.random() * 4,
                color: Math.random() > 0.5 ? "#5D6D7E" : "#85929E" // Stone colors
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;
            particles[i].vy += 0.2; // Gravity
            particles[i].life--;
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            // Use specific color if defined
            ctx.fillStyle = particles[i].color || "red";
            ctx.beginPath();
            ctx.arc(particles[i].x, particles[i].y, particles[i].r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function movePlayerLeft() {
        fps = 4;
        direction = "left";
        let newX = x - playerSpeed;
        if (checkEnemyCollision(newX, y)) return;
        if (map == 2 || map == 3 || (map == 1 && x > 20)) x = newX;
    }

    function movePlayerRight() {
        fps = 4;
        direction = "right";
        let newX = x + playerSpeed;
        if (checkEnemyCollision(newX, y)) return;
        if (map == 1 && x + w < town.x) x = newX;
        if (map == 2 || map == 3) x = newX;
    }

    function movePlayerUp() {
        let newY = y - playerSpeed;
        if (checkEnemyCollision(x, newY)) return;
        if (movement && y + h + 10 > 220) {
            y = newY;
            attackhitbox.y = y + 18;
            direction = "up";
            fps = 4;
        }
    }

    function movePlayerDown() {
        let newY = y + playerSpeed;
        if (checkEnemyCollision(x, newY)) return;
        if (movement && y + h + 10 <= height) {
            y = newY;
            attackhitbox.y = y + 18;
            direction = "down";
            fps = 4;
        }
    }

    function checkEnemyCollision(px, py) {
        for (let i = 0; i < enemies; i++) {
            if (dummyMap[i] == map && !enemy.enemydeath[i]) {
                // Standard bounding box collision check
                // px, py is player's next position; w, h is player size (50x50)
                // enemy.x[i], enemy.y[i] is enemy pos; enemy.w, enemy.h is enemy size (20x20)
                if (px < enemy.x[i] + enemy.w &&
                    px + w > enemy.x[i] &&
                    py < enemy.y[i] + enemy.h &&
                    py + h > enemy.y[i]) {
                    return true;
                }
            }
        }
        return false;
    }

    function handleAttack1() {
        fps = 7;
        limit = 4;
        direction = "attack";
        movement = false;
        moveLeft = moveRight = moveUp = moveDown = false;
    }

    function handleCharge() {
        fps = 4;
        limit = 1;
        direction = "charge";
        movement = false;
        moveLeft = moveRight = moveUp = moveDown = false;
        if (mana < 100) {
            mana += 1;
        }
    }

    function handleAttack2() {
        fps = 5; limit = 9;
        direction = "attack2";
        movement = false; moveLeft = moveRight = moveUp = moveDown = false;
        if (mana <= 10) {
            attack2 = false;
            direction = "";
            limit = 2;
            frame = 1;
        }
    }


    document.addEventListener("keydown", function (event) {
        if (event.key == "Escape" && pausebutton.boolean == false) pausebutton.boolean = true;
        else if (event.key == "Escape" && pausebutton.boolean == true) pausebutton.boolean = false;
        if (pausebutton.boolean == false && gameover == false) {
            if (town.alive == true || pausebutton.boolean) {
                switch (event.key) {
                    case "w": moveUp = true; break;
                    case "s": moveDown = true; break;
                    case "a": if (movement && !moveRight) moveLeft = true; break;
                    case "d": if (movement && !moveLeft) moveRight = true; break;
                    case "j": if (!attack2 && movement) attack = true; break;
                    case "k": if (!attack2 && !attack && movement && mana >= 50) attack2 = true; break;
                    case "l": if (!charge) charge = true; break;

                }


            }
        }
    });

    document.addEventListener("keyup", function (event) {

        if (pausebutton.boolean == false && gameover == false) {
            if (town.alive == true || pausebutton.boolean) {
                if (["j", "k", "l"].includes(event.key)) {
                    direction = "";
                    movement = true;
                    limit = 2;
                    frame = 0;
                }

                if (event.key == "k") attack2 = false;
                if (event.key == "j") attackhitbox.attackhit = false; attack = false;
                if (event.key == "l") charge = false;

                if (event.key == "a") {
                    moveLeft = false;
                    lastDirection = "left";
                }
                if (event.key == "d") {
                    moveRight = false;
                    lastDirection = "right";
                }
                if (event.key == "w") moveUp = false;
                if (event.key == "s") moveDown = false;
            }
        }
    });


    // mao ning sa gamemenu nga game pause ug back to menu
    document.addEventListener("click", function (e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;


        if (
            gameover == false && pausebutton.boolean == false &&
            mouseX >= pausebutton.x &&
            mouseX <= pausebutton.x + pausebutton.width &&
            mouseY >= pausebutton.y &&
            mouseY <= pausebutton.y + pausebutton.height
        ) {
            pausebutton.boolean = true;
        }

        // mao ning pa balik sa mainmenu
        else if (
            gameover == false && pausebutton.boolean == true &&
            mouseX >= backtomenu_ui.x &&
            mouseX <= backtomenu_ui.x + backtomenu_ui.w &&
            mouseY >= backtomenu_ui.y &&
            mouseY <= backtomenu_ui.y + backtomenu_ui.h
        ) {
            back_to_main();
        }


        else if (
            gameover == true &&
            mouseX >= backtomenu_ui.x &&
            mouseX <= backtomenu_ui.x + backtomenu_ui.w &&
            mouseY >= backtomenu_ui.y &&
            mouseY <= backtomenu_ui.y + backtomenu_ui.h
        ) {
            back_to_main();
        }


        else if (
            gameover == true &&
            (
                mouseX < backtomenu_ui.x ||
                mouseX > backtomenu_ui.x + backtomenu_ui.w ||
                mouseY < backtomenu_ui.y ||
                mouseY > backtomenu_ui.y + backtomenu_ui.h
            )
        ) {
            back_to_main();
        }

        else if (
            pausebutton.boolean == true &&
            (
                mouseX < backtomenu_ui.x ||
                mouseX > backtomenu_ui.x + backtomenu_ui.w ||
                mouseY < backtomenu_ui.y ||
                mouseY > backtomenu_ui.y + backtomenu_ui.h
            )
        ) {
            pausebutton.boolean = false;
        }


    });

    // mao ni tong back to mainmenu gi locate ra nako ang index.html 
    function back_to_main() {
        window.location.href = "index.html";
    }

    function update_dummy() {

        for (let i = 0; i < enemies; i++) {

            if (dummyMap[i] == 1) {
                if (!pausebutton.boolean && enemy.health[i] > 0 && enemy.x[i] + enemy.w > town.x && town.x + town.w > enemy.x[i] && enemy.y[i] + enemy.h > town.y && town.y + town.h > enemy.y[i]) {
                    enemy.attack[i] = true;
                    enemy.speed[i] = 0;
                    if (dummyMap[i] == 1 && town.health >= 0 && enemy.attack[i] == true) {
                        town.health -= enemy.damage_value[i];
                        town.hurt = true;
                        town.hurtTimer = 10;
                        shakeIntensity = 10; // Stronger shake for town damage
                        createDebris(town.x + (Math.random() * 150), town.y + (Math.random() * 150));
                    }
                    enemy.move[i] = false;
                }
                if (town.health <= 0) {
                    gameover = true;
                    town.alive = false;
                    frame = 0;
                    enemy_Frame = 0;
                    enemy.move[i] = false;
                    enemy.speed[i] = 0;
                    playerSpeed = 0;
                }
            }
            if (dummyMap[i] == map) {
                if (!pausebutton.boolean && enemy.health[i] > 0 && !attack && !attack2 && x < enemy.x[i] + enemy.w && x + w > enemy.x[i] && y < enemy.y[i] + enemy.h && y + h > enemy.y[i]) {
                    // Only hurt player if skeleton animation reaches the hit frames (2 or 3)
                    if (enemy_Frame >= 2) {
                        playerHealth = Math.max(playerHealth - enemy.damage_value[i], 0);
                        hurt = true;
                        hurtTimer = 10;
                        shakeIntensity = 8; // Trigger Screen Shake
                    }
                    enemy.move[i] = false;
                    enemy.attackingplayer[i] = true;
                } else {
                    enemy.move[i] = true;
                    enemy.attackingplayer[i] = false;

                }


                if (attack2 && frame > 7) {
                    // Logic for laser hit detection - precisely matching the visible beam
                    let beamY = y + 15;
                    let beamH = 40;
                    let beamX = lastDirection == "left" ? x - width : x + 50;
                    let beamW = width;

                    if (beamX < enemy.x[i] + enemy.w && beamX + beamW > enemy.x[i] &&
                        beamY < enemy.y[i] + enemy.h && beamY + beamH > enemy.y[i]) {
                        enemy.health[i] = Math.max(0, enemy.health[i] - 1); // Clamp to 0
                        enemy.hurt[i] = true;
                        enemy.hurtTimer[i] = 10; // Brief freeze for laser
                        if (Math.random() > 0.8) createBlood(enemy.x[i] + enemy.w / 2, enemy.y[i] + enemy.h / 2);
                        if (enemy.health[i] <= 0) {
                            enemy.enemydeath[i] = true;
                            enemy.move[i] = false;
                            enemy.attack[i] = false;
                            enemy.attackingplayer[i] = false;
                            enemy.speed[i] = 0;
                        }
                    }
                }

                if (attackhitbox.attackhit && attackhitbox.x + attackhitbox.w > enemy.x[i] && enemy.x[i] + enemy.w > attackhitbox.x && attackhitbox.y + attackhitbox.h > enemy.y[i] && enemy.y[i] + enemy.h > attackhitbox.y) {
                    enemy.health[i] = Math.max(0, enemy.health[i] - 10); // Melee clamped
                    enemy.hurt[i] = true;
                    enemy.hurtTimer[i] = 25; // Longer freeze on sword hit
                    createBlood(enemy.x[i] + enemy.w / 2, enemy.y[i] + enemy.h / 2);
                    attackhitbox.attackhit = false;
                    if (enemy.health[i] <= 0) {
                        enemy.enemydeath[i] = true;
                        enemy.move[i] = false;
                        enemy.attack[i] = false;
                        enemy.attackingplayer[i] = false;
                        enemy.speed[i] = 0;
                    }
                    if (playerHealth <= 95) {
                        playerHealth += 5;
                    }
                }


            }

            // Reset hurt state if timer completes
            if (enemy.hurt[i]) {
                enemy.hurtTimer[i]--;
                if (enemy.hurtTimer[i] <= 0) enemy.hurt[i] = false;
            }

            // Optimized movement logic - NO movement while hurt
            if (enemy.move[i] && enemy.health[i] > 0 && !enemy.hurt[i]) {
                if (dummyMap[i] == 1) {
                    if (enemy.x[i] + enemy.w < width) enemy.x[i] += enemy.speed[i];
                } else {
                    enemy.x[i] += enemy.speed[i];
                }
            }

            if (enemy.x[i] - enemy.w > width) {
                enemy.x[i] = -20;
                if (dummyMap[i] > 1) dummyMap[i]--;
            }

        }


    }

    function updateMap() {

        if ((map == 2 || map == 1) && x < 40) {
            map += 1;
            x = width - w - 60; // Spawn safely away from the edge
            attackhitbox.x = x - 10;
        }

        if ((map == 2 || map == 3) && x + w > width - 40) {
            map -= 1;
            x = 60; // Spawn safely away from the edge
            attackhitbox.x = x - 10;
        }


        if (map == 1) background.src = "background/Battleground1.png";
        if (map == 2) background.src = "background/game_background_2.png";
        if (map == 3) background.src = "background/game_background_1.png";
    }


    function manabar() {
        // Retro Arcade Mana Bar (Solid)
        const x_pos = 15;
        const y_pos = 65;
        const width_full = 180;
        const height_full = 18;

        // Container
        ctx.fillStyle = "rgba(28, 38, 48, 0.85)";
        ctx.fillRect(x_pos, y_pos, width_full, height_full);

        // Bar Track
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(x_pos + 4, y_pos + 4, width_full - 8, height_full - 8);

        // Solid Fill
        ctx.fillStyle = "#00FFFF"; // Arcade Cyan
        ctx.fillRect(x_pos + 4, y_pos + 4, (mana / maxMana) * (width_full - 8), height_full - 8);
    }

    function healthbar() {
        // Retro Arcade Health Bar
        const x_pos = 1;
        const y_pos = 10;
        const width_full = 260;
        const height_full = 25;

        // Semi-transparent Dark Container
        ctx.fillStyle = "rgba(94, 97, 100, 0.85)";
        ctx.fillRect(x_pos, y_pos, width_full, height_full);

        // Solid Health Fill
        const bar_x = x_pos + 80;
        const bar_h = 16;
        const bar_y = y_pos + (height_full / 2) - (bar_h / 2);
        const bar_w = 160;

        // Bar Track
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(bar_x, bar_y, bar_w, bar_h);

        // Flash red if very low
        ctx.fillStyle = (playerHealth < playermaxHealth * 0.25 && counter % 20 < 10) ? "white" : "#FF0055"; // Arcade Pink/Red

        // Solid Health Fill
        ctx.fillRect(bar_x, bar_y, (playerHealth / playermaxHealth) * bar_w, bar_h);

        ctx.drawImage(profile, 0, 1, 70, 50, 20, 10, 60, 45);
    }

    function current_level_ui() {
        ctx.fillStyle = "rgba(28, 38, 48, 0.6)";
        ctx.fillRect(width / 2 - 60, 10, 120, 35);
        ctx.strokeStyle = colors.gold;
        ctx.lineWidth = 1;
        ctx.strokeRect(width / 2 - 60, 10, 120, 35);

        ctx.fillStyle = colors.white;
        ctx.font = "bold 18px 'Orbitron'";
        ctx.textAlign = "center";
        ctx.fillText("LVL " + current_level, width / 2, 33);
        ctx.textAlign = "start";
    }

    function drawPlayer() {
        let img;
        let sourceX = frame * 128;


        if (attack) {
            if (loadedImages.length > 0) {
                img = loadedImages[currentAttackIndex];
                sourceX = attackFrameIndex * 128;
            }
            animateAttack();
        }
        else if (playerHealth <= 0) img = playerDeath;
        else if (hurt) {
            img = hurtFrame;
            sourceX = 0; // Reset frame for single-frame image
        }
        else if (charge) img = chargeFrame;
        else if (charge && lastDirection == "left") img = chargeFrame;
        else if (attack2) img = attackFrame2;
        else if (!direction && lastDirection == "left") img = idle;
        else if (!direction) {
            img = idle;
            sourceX = frame * 128;
        }
        else if (direction == "right" || direction == "left" || direction == "up" || direction == "down") {
            img = (direction == "left" || (direction != "right" && lastDirection == "left")) ? playerLeft : playerRight;
        }

        // Final fallback to ensure 'img' is always defined
        if (!img) img = idle;


        let flipped = ((attack || charge) && (direction == "" || lastDirection == "left")) || (direction == "" && lastDirection == "left") || img == playerLeft || (attack2 && lastDirection == "left");
        let drawX = flipped ? -x - w - 40 : x - 40;

        function normal_draw() {
            if (img) {
                // Improved Ground Shadow - Precise PI circle/ellipse
                ctx.save();
                ctx.beginPath();
                ctx.translate(x + w / 2, y + h);
                ctx.scale(1.5, 0.4); // Flat ellipse for the shadow
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
                ctx.fill();
                ctx.restore();

                if (img == playerDeath) {
                    ctx.drawImage(img, sourceX, 0, 128, 128, drawX, y - 50, w + 80, h + 80);
                } else {
                    // Character rendering - centered on hitbox
                    ctx.drawImage(img, sourceX, 0, 128, 128, drawX, y - 65, w + 80, h + 80);
                }

                // Debug Hitbox - Uncomment to see alignment
                // ctx.strokeStyle = "red"; ctx.strokeRect(x, y, w, h);

                if (playerHealth <= 0 && sourceX >= 217) {
                    gameover = true;
                }
            }
        }

        if (charge == false) { mana_aura.y = y };

        if (flipped == true) {
            ctx.save();
            ctx.scale(-1, 1);
            normal_draw();
            ctx.restore();
        } else {
            normal_draw();
        }

        // Debug Hitboxes - World Space
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; // Player Hitbox
        ctx.strokeRect(x, y, w, h);

        if (attackhitbox.attackhit) {
            ctx.strokeStyle = colors.red; // Attack Hitbox
            ctx.strokeRect(attackhitbox.x, attackhitbox.y, attackhitbox.w, attackhitbox.h);
        }


        if (attack2 && frame > 7) {
            mana -= 3;

            drawBullet();
        }


    }

    function draw() {
        ctx.save();

        // SCREEN SHAKE LOGIC
        if (shakeIntensity > 0) {
            let sx = (Math.random() - 0.5) * shakeIntensity;
            let sy = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(sx, sy);
            shakeIntensity *= 0.9; // Decay
            if (shakeIntensity < 0.1) shakeIntensity = 0;
        }

        ctx.clearRect(-10, -10, width + 20, height + 20);

        if (map == 1) {
            ctx.drawImage(background, 0, 0, width, height);
            towndisplay();

            // Town Health - Always visible on Map 1
            ctx.fillStyle = colors.dark;
            ctx.fillRect(town.x - 300, town.y - 125, town.w, 15);
            const townGrad = ctx.createLinearGradient(town.x - 300, 0, town.x - 300 + town.w, 0);
            townGrad.addColorStop(0, colors.tan);
            townGrad.addColorStop(1, colors.gold);
            ctx.fillStyle = townGrad;
            ctx.fillRect(town.x - 300, town.y - 125, (town.health / town.maxHealth) * town.w, 15);
            ctx.fillStyle = colors.white;
            ctx.font = "14px 'Silkscreen'";
            ctx.fillText("TOWN DEFENSE", town.x - 295, town.y - 135);
        }

        if (map == 2 || map == 3) {
            ctx.drawImage(background, 0, 0, width, height + 50);
        }

        for (let i = 0; i < enemies; i++) {
            if (dummyMap[i] == map) {
                // Perfectly Centered Ground Shadow
                ctx.save();
                ctx.beginPath();
                ctx.translate(enemy.x[i] + 10, enemy.y[i] + 20); // Anchor to hitbox center-bottom
                ctx.scale(1.8, 0.5);
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fill();
                ctx.restore();

                ctx.save();
                drawDummy();
                ctx.restore();
            }
        }

        ctx.restore(); // Restore shake for UI

        healthbar();
        manabar();
        current_level_ui();

        // Update town hurt state
        if (town.hurt) {
            town.hurtTimer--;
            if (town.hurtTimer <= 0) town.hurt = false;
        }

        ctx.save();
        drawPlayer();
        ctx.restore();
    }

    function towndisplay() {
        // Detailed Town Layout with Hurt Flash effect
        let tx = town.x;
        let ty = town.y;

        // Apply a slight vibration/shiver if town is hurt
        if (town.hurt) {
            tx += (Math.random() - 0.5) * 4;
            ty += (Math.random() - 0.5) * 4;
        }

        ctx.save();
        if (town.hurt) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
        }

        ctx.drawImage(Villagebuilding4, tx - 100, ty - 60, 160, 160);
        ctx.drawImage(Villagebuilding5, tx + 180, ty - 60, 160, 160);
        ctx.drawImage(Villagebuilding1, tx, ty, town.w, town.h);
        ctx.drawImage(Villagebuilding2, tx + 120, ty + 20, 140, 140);
        ctx.drawImage(Villagebuilding3, tx - 60, ty + 40, 120, 120);

        // Flash overlay when hurt
        if (town.hurt) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
            ctx.fillRect(tx - 100, ty - 60, 440, 240);
        }
        ctx.restore();

        // Foreground Main Building (Smithy)
        ctx.drawImage(buildingSmith, 0, 200, 500, 300, tx - 30, ty, town.w + 160, town.h + 40);
    }

    function drawBullet() {
        const beamY = y + 15;
        const beamHeight = 40;
        const beamWidth = width;

        ctx.save();
        if (lastDirection == "left") {
            ctx.scale(-1, 1);
            // Dynamic pulse based on time
            const pulse = Math.sin(Date.now() / 50) * 5;
            drawBeamEffect(-x + 10, beamY - pulse / 2, beamWidth, beamHeight + pulse);
        } else {
            const pulse = Math.sin(Date.now() / 50) * 5;
            drawBeamEffect(x + 50, beamY - pulse / 2, beamWidth, beamHeight + pulse);
        }
        ctx.restore();

        // DRAW PARTICLES
        particles.forEach(p => {
            ctx.fillStyle = colors.red;
            ctx.globalAlpha = p.life / 25;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function drawBeamEffect(bx, by, bw, bh) {
        // Multi-layered glow effect
        const coreGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
        coreGrad.addColorStop(0, "rgba(0, 255, 255, 0)");
        coreGrad.addColorStop(0.2, "rgba(0, 255, 255, 0.8)");
        coreGrad.addColorStop(0.5, "#fff");
        coreGrad.addColorStop(0.8, "rgba(0, 255, 255, 0.8)");
        coreGrad.addColorStop(1, "rgba(0, 255, 255, 0)");

        // Outer bloom
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00ffff";
        ctx.fillStyle = "rgba(0, 217, 255, 0.3)";
        ctx.fillRect(bx, by - 5, bw, bh + 10);

        // Solid core
        ctx.shadowBlur = 0;
        ctx.fillStyle = coreGrad;
        ctx.fillRect(bx, by, bw, bh);

        // Core line
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2;
        ctx.moveTo(bx, by + bh / 2);
        ctx.lineTo(bx + bw, by + bh / 2);
        ctx.stroke();
    }

    function drawDummy() {
        ctx.save();

        for (let i = 0; i < enemies; i++) {
            let visible = true;
            if (enemy.blinking[i]) {
                // After falling, do the blink/flash 3 times before disappearing
                if (enemy.deathFrame[i] >= 3) {
                    visible = Math.floor(enemy.blinkTimer[i] / 10) % 2 == 0;
                }
            }

            if (visible) {
                // Dead state with improved ground alignment
                if (enemy.enemydeath[i] == true && dummyMap[i] == map) {
                    // Dead state centered precisely
                    ctx.drawImage(skeleton_death, enemy.deathFrame[i] * 128, 0, 128, 128, enemy.x[i] - 50, enemy.y[i] - 90, 120, 120);
                }
                else if (enemy.enemydeath[i] == false && dummyMap[i] == map) {
                    // Debug Hitbox (Temporary visibility)
                    ctx.strokeStyle = "#25B4DA";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(enemy.x[i], enemy.y[i], enemy.w, enemy.h);

                    // Perfectly Centered Health Bar
                    const barW = 32;
                    const barH = 5;
                    const barY = enemy.y[i] + 22; // Direct bottom
                    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                    ctx.fillRect(enemy.x[i] + 10 - barW / 2, barY, barW, barH);
                    ctx.fillStyle = "#ff2e2e";
                    ctx.fillRect(enemy.x[i] + 10 - barW / 2, barY, (enemy.health[i] / enemy.maxHealth[i]) * barW, barH);

                    if (enemy.enemydeath[i] == true) {
                        ctx.drawImage(skeleton_death, enemy.deathFrame[i] * 128, 0, 128, 128, enemy.x[i] - 45, enemy.y[i] - 100, 120, 120);
                    } else {
                        // Mirror alive animations to face right
                        let drawImg = skeleton;
                        if (enemy.hurt[i]) drawImg = skeleton_hurt;
                        else if (enemy.attack[i]) drawImg = skeleton_attack;
                        else if (enemy.attackingplayer[i]) drawImg = skeleton_attack1;

                        ctx.drawImage(drawImg, enemy_Frame * 128, 0, 128, 128, enemy.x[i] - 45, enemy.y[i] - 100, 120, 120);
                    }
                }
            }
        }

        ctx.restore();
    }

    let currentAttackIndex = 0;
    let attackFrameIndex = 0;
    let lastAttackTime = 0;
    const attackSpeed = 100;


    function animateAttack() {
        if (attack && loadedImages.length > 0) {
            const currentTime = Date.now();
            if (currentTime - lastAttackTime > attackSpeed) {
                attackFrameIndex =
                    (attackFrameIndex + 1) % attackImages[currentAttackIndex].frameCount;
                lastAttackTime = currentTime;

                if (attackFrameIndex == 0) {
                    currentAttackIndex = (currentAttackIndex + 1) % attackImages.length;

                    // Directional Hitbox Calculation
                    attackhitbox.w = 80;
                    attackhitbox.h = 60;
                    attackhitbox.y = y - 5;
                    if (lastDirection == "right") {
                        attackhitbox.x = x + 30; // Pointing right
                    } else {
                        attackhitbox.x = x - 60; // Pointing left
                    }

                    attackhitbox.attackhit = true;
                }
            }
        }
    }

    function updateFrames() {

        if (gameover == false && pausebutton.boolean == false) {
            counter += 1;
            enemy_Counter += 1;

            if (counter % fps == 0) {
                frame = (frame + 1) % (limit + 1);
            }
            if (enemy_Counter % enemy_Fps == 0) {
                enemy_Frame = (enemy_Frame + 1) % (enemy_limit + 1);
            }

            if (counter > 1000) {
                counter = 0;
            }
            if (enemy_Counter > 1000) {
                enemy_Counter = 0;
            }

            if (hurt) {
                hurtTimer--;
                if (hurtTimer <= 0) {
                    hurt = false;
                }
            }
        }

    }


    let gameRequestId;
    function gameLoop() {
        if (gameRequestId) cancelAnimationFrame(gameRequestId);
        draw();
        update();
        gameRequestId = requestAnimationFrame(gameLoop);
    }
    gameLoop();
}
