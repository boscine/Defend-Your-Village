// start_menu() is called by loader.js after assets finish loading
function start_menu() {
  const canvas = document.getElementById("lala");
  const ctx = canvas.getContext("2d");

  const width = 1000;
  const height = 400;
  canvas.width = width;
  canvas.height = height; 

  const backgroundmain = new Image();
  backgroundmain.src = "background/Battleground1.png";

  const playerbg = new Image();
  playerbg.src = "Enchantress/Idle.png";

  const playButton = { x: 350, y: 190, width: 300, height: 50, hover: false };
  const Controlsbutton = { x: 350, y: 260, width: 300, height: 50, hover: false };
  const exitbutton = { x: 400, y: 350, width: 200, height: 40, hover: false };
  let displaycontrols = false;
  let start_game = false;
  
  let menuFrame = 0;
  let lastMenuFrameTime = 0;
  const menuFrameSpeed = 150; // ms per frame

  function drawMenu() {
    // Draw background
    if (backgroundmain.complete) {
        ctx.drawImage(backgroundmain, 0, 0, canvas.width, canvas.height);
        // Add a dark overlay to make text pop
        ctx.fillStyle = "rgba(15, 15, 27, 0.4)";
        ctx.fillRect(0, 0, width, height);
    }
    
    // Animated Idle Character
    if (playerbg.complete) {
        const currentTime = Date.now();
        if (currentTime - lastMenuFrameTime > menuFrameSpeed) {
            menuFrame = (menuFrame + 1) % 5; // Enchantress Idle typically has 5 frames
            lastMenuFrameTime = currentTime;
        }
        ctx.drawImage(playerbg, menuFrame * 128, 0, 128, 128, 50, 280, 120, 120);
    }
 
    // Dynamic Typography Title
    const titleY = 100 + Math.sin(Date.now() / 600) * 8; // Slow hover effect
    
    // Minimalist White Title
    ctx.font = "bold 70px 'Orbitron'";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("DEFEND YOUR VILLAGE", width/2, titleY);
    
    // Reset shadow & alignment
    ctx.shadowBlur = 0;
    ctx.textAlign = "start";

    drawStyledButton("Play", playButton);
    drawStyledButton("Controls", Controlsbutton);
  }

  function drawStyledButton(text, btn) {
    // Subtle White Hover Effect
    const grad = ctx.createLinearGradient(btn.x, btn.y, btn.x + btn.width, btn.y);
    if (btn.hover) {
        grad.addColorStop(0, "rgba(255, 255, 255, 0.2)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.15)");
    } else {
        grad.addColorStop(0, "rgba(255, 255, 255, 0.1)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.05)");
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 8);
    ctx.fill();
    ctx.strokeStyle = btn.hover ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Button text
    ctx.fillStyle = "white";
    ctx.font = "bold 22px 'Orbitron'";
    ctx.textAlign = "center";
    ctx.fillText(text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 8);
    ctx.textAlign = "start";
  }

  canvas.addEventListener("mousemove", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    playButton.hover = checkInBounds(mouseX, mouseY, playButton);
    Controlsbutton.hover = checkInBounds(mouseX, mouseY, Controlsbutton);
    exitbutton.hover = checkInBounds(mouseX, mouseY, exitbutton);
  });

  function checkInBounds(x, y, btn) {
    return x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height;
  }

  function loadGameScript() {
    if (typeof startGame === 'function') {
        startGame();
        return;
    }
    const script = document.createElement('script');
    script.src = 'index.js';
    script.onload = () => startGame();
    document.body.appendChild(script);
  }



  function controls_guideui() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 45px 'Orbitron'";
    ctx.textAlign = "center";
    ctx.shadowBlur = 20;
    ctx.lineWidth = 2;
    ctx.shadowColor = "#25B4DA";
    ctx.fillText("BATTLE COMMANDS", width/2, 100);
    ctx.shadowBlur = 0;

    const controls = [
        { key: "W A S D", action: "Move enchantress" },
        { key: "J", action: "Melee strike" },
        { key: "K", action: "Magic Beam" },
        { key: "L", action: "Charge Mana" },
        { key: "ESC", action: "Tactical Pause" }
    ];

    ctx.font = "20px 'Silkscreen'";
    controls.forEach((c, i) => {
        const y = 160 + i * 38;
        ctx.fillStyle = "#25B4DA"; 
        ctx.textAlign = "right";
        ctx.fillText(c.key, width/2 - 40, y);
        
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(" - " + c.action, width/2 - 20, y);
    });
    ctx.textAlign = "center";
    drawStyledButton("Go back", exitbutton);
  }
  canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
      mouseX >= playButton.x &&
      mouseX <= playButton.x + playButton.width &&
      mouseY >= playButton.y &&
      mouseY <= playButton.y + playButton.height
    ) {
      start_game = true;
    }

    else if (displaycontrols == false &&
      mouseX >= Controlsbutton.x &&
      mouseX <= Controlsbutton.x + Controlsbutton.width &&
      mouseY >= Controlsbutton.y &&
      mouseY <= Controlsbutton.y + Controlsbutton.height
    ) {
      displaycontrols = true;
    }

    else if (displaycontrols == true &&
      mouseX >= exitbutton.x &&
      mouseX <= exitbutton.x + exitbutton.width &&
      mouseY >= exitbutton.y &&
      mouseY <= exitbutton.y + exitbutton.height
    ) {
      displaycontrols = false;
    }
  });

  function gameLoop() {

    drawMenu();
     

    if (displaycontrols) {
      controls_guideui();
    }

    if (start_game) {
      loadGameScript();
      return;
    }
    requestAnimationFrame(gameLoop);
  }


  backgroundmain.onload = () => {
    gameLoop();
  };

}