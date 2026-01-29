const canvas = document.getElementById('dashCanvas');
const ctx = canvas.getContext('2d');
const progressBar = document.getElementById('progress-bar');

canvas.width = 600;
canvas.height = 300;

// GAME SETTINGS
const GRAVITY = 0.28;
const JUMP_FORCE = -5.5;
const SPEED = 3.5;
const GROUND_Y = 250;

let player = {
    x: 100, y: GROUND_Y - 30, w: 30, h: 30,
    vY: 0, rotation: 0, isGrounded: false
};

let isPressing = false;
let levelWidth = 3000; // Length of the level
let cameraX = 0;

// LEVEL DATA (x, type) - type 0: spike, type 1: block, type 2: orb
const level = [
    {x: 400, type: 0}, {x: 600, type: 1}, {x: 630, type: 1}, 
    {x: 850, type: 0}, {x: 880, type: 0}, // Double Spike
    {x: 1100, type: 2}, // Yellow Orb
    {x: 1300, type: 1, y: 180}, {x: 1330, type: 1, y: 180},
    {x: 1550, type: 0}, {x: 1700, type: 2}, {x: 1900, type: 0}, {x: 1930, type: 0}, {x: 1960, type: 0}, // Triple Spike!
    {x: 2200, type: 1, y: 150}, {x: 2500, type: 0}
];

function reset() {
    player.y = GROUND_Y - 30; player.vY = 0; player.rotation = 0;
    cameraX = 0;
}

function update() {
    // Movement & Gravity
    player.vY += GRAVITY;
    player.y += player.vY;
    cameraX += SPEED;

    // Ground Collision
    if (player.y + player.h >= GROUND_Y) {
        player.y = GROUND_Y - player.h;
        player.vY = 0;
        player.isGrounded = true;
        // Snap rotation to nearest 90deg
        player.rotation = Math.round(player.rotation / 90) * 90;
    } else {
        player.isGrounded = false;
        player.rotation += 4; // Spin in air
    }

    // Input Jump
    if (isPressing && player.isGrounded) {
        player.vY = JUMP_FORCE;
    }

    // Object Collisions
    level.forEach(obj => {
        let objX = obj.x - cameraX + player.x;
        let objY = obj.y || GROUND_Y;

        // Collision Check
        if (player.x < objX + 25 && player.x + player.w > objX + 5) {
            if (obj.type === 0 && player.y + player.h > GROUND_Y - 20) reset(); // Spike
            if (obj.type === 1 && player.y + player.h > (obj.y || GROUND_Y)) reset(); // Block
            
            // Orb Logic (Yellow Orb)
            if (obj.type === 2 && isPressing && Math.abs(player.y - (objY - 60)) < 40) {
                player.vY = JUMP_FORCE * 1.2;
                isPressing = false; // Prevent infinite orb flying
            }
        }
    });

    // Progress
    let progress = (cameraX / levelWidth) * 100;
    progressBar.style.width = Math.min(progress, 100) + "%";
    if (cameraX > levelWidth) reset(); 
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Ground
    ctx.fillStyle = "#0055ff";
    ctx.fillRect(0, GROUND_Y, canvas.width, 2);

    // Draw Objects
    level.forEach(obj => {
        let drawX = obj.x - cameraX + player.x;
        if (drawX < -50 || drawX > canvas.width + 50) return;

        if (obj.type === 0) { // Spike
            ctx.fillStyle = "#ff0000";
            ctx.beginPath();
            ctx.moveTo(drawX, GROUND_Y);
            ctx.lineTo(drawX + 15, GROUND_Y - 25);
            ctx.lineTo(drawX + 30, GROUND_Y);
            ctx.fill();
        } else if (obj.type === 1) { // Block
            ctx.fillStyle = "#fff";
            ctx.fillRect(drawX, obj.y || GROUND_Y - 30, 30, 30);
        } else if (obj.type === 2) { // Yellow Orb
            ctx.strokeStyle = "#ffff00";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(drawX + 15, GROUND_Y - 60, 12, 0, Math.PI*2);
            ctx.stroke();
        }
    });

    // Draw Player
    ctx.save();
    ctx.translate(player.x + player.w/2, player.y + player.h/2);
    ctx.rotate(player.rotation * Math.PI / 180);
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(-player.w/2, -player.h/2, player.w, player.h);
    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Input Handlers
window.addEventListener('mousedown', () => isPressing = true);
window.addEventListener('mouseup', () => isPressing = false);
window.addEventListener('touchstart', (e) => { e.preventDefault(); isPressing = true; });
window.addEventListener('touchend', () => isPressing = false);

loop();
