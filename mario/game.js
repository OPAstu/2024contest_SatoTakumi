const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲームの設定
const bubbleRadius = 20;
const bubbleColors = ['red', 'green', 'blue', 'yellow', 'purple'];
const bubbles = [];
const rows = 8;
const cols = 10;
const shooterBubble = {
    x: canvas.width / 2,
    y: canvas.height - bubbleRadius - 10,
    radius: bubbleRadius,
    color: getRandomColor(),
    dx: 0,
    dy: 0
};

// バブルの初期配置
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const x = col * bubbleRadius * 2 + bubbleRadius;
        const y = row * bubbleRadius * 2 + bubbleRadius;
        bubbles.push(createBubble(x, y, getRandomColor()));
    }
}

// バブルを作成する関数
function createBubble(x, y, color) {
    return { x, y, radius: bubbleRadius, color };
}

// ランダムな色を取得する関数
function getRandomColor() {
    return bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
}

// バブルを描画する関数
function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = bubble.color;
    ctx.fill();
    ctx.closePath();
}

// ゲームの描画
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // バブルの描画
    bubbles.forEach(drawBubble);

    // シューターバブルの描画
    drawBubble(shooterBubble);
    
    requestAnimationFrame(draw);
}

// バブルを発射する関数
function shootBubble() {
    if (shooterBubble.dx === 0 && shooterBubble.dy === 0) {
        const angle = Math.atan2(-1, 0); // 上方向に発射
        shooterBubble.dx = Math.cos(angle) * 5;
        shooterBubble.dy = Math.sin(angle) * 5;
    }
}

// バブルの位置を更新する関数
function update() {
    if (shooterBubble.dx !== 0 || shooterBubble.dy !== 0) {
        shooterBubble.x += shooterBubble.dx;
        shooterBubble.y += shooterBubble.dy;

        // バブルが壁に当たったら反射する
        if (shooterBubble.x - shooterBubble.radius < 0 || shooterBubble.x + shooterBubble.radius > canvas.width) {
            shooterBubble.dx *= -1;
        }

        // バブルが天井に当たったら止める
        if (shooterBubble.y - shooterBubble.radius < 0) {
            shooterBubble.dy = 0;
            shooterBubble.dx = 0;
            shooterBubble.y = shooterBubble.radius;
            bubbles.push(createBubble(shooterBubble.x, shooterBubble.y, shooterBubble.color));
            shooterBubble.x = canvas.width / 2;
            shooterBubble.y = canvas.height - bubbleRadius - 10;
            shooterBubble.color = getRandomColor();
        }

        // バブルと他のバブルの衝突判定
        bubbles.forEach(bubble => {
            const dist = Math.hypot(bubble.x - shooterBubble.x, bubble.y - shooterBubble.y);
            if (dist < bubbleRadius * 2) {
                shooterBubble.dy = 0;
                shooterBubble.dx = 0;
                shooterBubble.y = bubble.y - bubbleRadius * 2;
                bubbles.push(createBubble(shooterBubble.x, shooterBubble.y, shooterBubble.color));
                shooterBubble.x = canvas.width / 2;
                shooterBubble.y = canvas.height - bubbleRadius - 10;
                shooterBubble.color = getRandomColor();
            }
        });
    }

    requestAnimationFrame(update);
}

// キーボード入力の処理
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        shootBubble();
    }
});

draw();
update();
