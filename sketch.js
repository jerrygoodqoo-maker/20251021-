// =================================================================
//                 全局變數 (Global Variables)
// =================================================================

// 作品切換與選單相關變數
let currentWork = 1; // 1: Circle Packing, 2: Pentacle, 3: Emanations
let menuActive = false; // 關鍵：選單預設關閉
let toggleButtonSize = 80; // 左上角選單開關按鈕大小：80x80
let menuButtonWidth = 200;  // 作品列表按鈕寬度
let menuButtonHeight = 60; // 作品列表按鈕高度

// --- 作品一: Circle Packing 相關變數 ---
let t = 0.0;
let vel = 0.02;
let num;
let paletteSelected;
let paletteSelected1;
let paletteSelected2;

// --- 作品二: Pentacle 相關變數 ---
let pr, ec;
let started = false;
let sparkles_w2 = []; 
let positions = [];
let divider = 40;
let rows, cols;
let osc, env; // 聲音物件

// --- 作品三: Emanations 相關變數 ---
let minSide;
let objs = [];
let colors = ['#ed3441', '#ffd630', '#329fe3', '#08AC7E', '#DED9DF', '#FE4D03'];


// =================================================================
//                   輔助函數/變數 (PLACEHOLDERS)
// =================================================================

// 顏色陣列
const palettes = [
    ["#355070", "#6D597A", "#B56576", "#E56B6F"],
    ["#FFCDB2", "#FFB4A2", "#E5989B", "#B5838D"],
];

// 背景顏色函數
function bgCol() {
    if (currentWork === 1) return color(paletteSelected[0]); 
    return 255; 
}

// 隨機顏色函數
function randomCol() {
    let p = random([paletteSelected, paletteSelected1, paletteSelected2]);
    return random(p);
}

// 漸變函數 (Work One)
function gradient(r) {
    let c1 = color(randomCol());
    let c2 = color(randomCol());
    for (let i = 0; i < r; i++) {
        let inter = map(i, 0, r, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        noFill();
        ellipse(0, 0, r - i);
    }
}


// =================================================================
//                     主要 p5.js 函數
// =================================================================

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(2);
    angleMode(DEGREES);
    num = random(100000);
    
    initWorkOne();
    initWorkTwo();
    initWorkThree(); 
}

function draw() {
    randomSeed(num);
    
    // --- 作品繪製 ---
    if (currentWork === 1) {
        background(bgCol()); 
        stroke("#355070");
        circlePacking();
    } else if (currentWork === 2) {
        workTwo(); 
    } else if (currentWork === 3) {
        workThree(); 
    }
    
    // --- 繪製左上角選單開關按鈕 (始終顯示) ---
    drawMenuToggleButton();

    // --- 繪製作品選擇列表 (僅在 active 時顯示) ---
    if (menuActive) {
        drawSelectMenu();
    }

    t += vel; 
}

// =================================================================
//                   初始化與重置函數
// =================================================================

function initWorkOne() {
    paletteSelected = random(palettes);
    paletteSelected1 = random(palettes);
    paletteSelected2 = random(palettes);
}

function initWorkTwo() {
    ec = createGraphics(width, height);
    pr = min(height, width) / 18;
    rows = floor(height / (2 * pr));
    cols = floor(width / (2 * pr));
    ec.background(0);
    ec.blendMode(ADD);
    makePositions();
    imageMode(CENTER);
    sparkles_w2 = [];
    started = false;
    divider = 40;

    // p5.sound 初始化
    try {
        // 確保 p5.sound 已載入，如果沒有載入，請確認 index.html 檔案
        if (typeof p5.Noise !== 'undefined') {
            osc = new p5.Noise('white');
            osc.start();
            osc.amp(0);
            env = new p5.Envelope(0.001, 0.9, 0.01, 0.2); 
        } else {
             // 假物件，避免報錯
            osc = { start: () => {}, amp: () => {}, pan: () => {} };
            env = { play: () => {} };
        }
    } catch (e) {
        osc = { start: () => {}, amp: () => {}, pan: () => {} };
        env = { play: () => {} };
    }
}

function initWorkThree() {
    minSide = min(width, height);
    rectMode(CENTER);
    objs = [];
}

// =================================================================
//                   滑鼠事件處理 (Mouse Events)
// =================================================================

function mousePressed() {
    let btnX = 10;
    let btnY = 10;
    let btnS = toggleButtonSize;

    // 1. 檢查是否點擊了左上角選單開關按鈕 (10, 10)
    if (mouseX > btnX && mouseX < btnX + btnS && mouseY > btnY && mouseY < btnY + btnS) {
        menuActive = !menuActive; // 切換選單狀態 (開啟/關閉)
        return; 
    }
    
    // 2. 處理作品二的聲音啟動 (當選單關閉時)
    if (currentWork === 2 && !started) {
        // 確保音訊環境已啟動
        userStartAudio(); 
        started = true;
        frameCount = 0;
        return; 
    }
    
    // 3. 處理作品選擇列表的點擊邏輯
    if (menuActive) {
        // 作品選單起始位置：開關按鈕右側 10 像素
        let startX = btnX + btnS + 10; 
        let startY = btnY;
        let w = menuButtonWidth;  // 200
        let h = menuButtonHeight; // 60

        let workChanged = false;

        // 檢查作品一按鈕
        if (mouseX > startX && mouseX < startX + w && mouseY > startY && mouseY < startY + h) {
            currentWork = 1;
            initWorkOne();
            workChanged = true;
        } 
        // 檢查作品二按鈕 (垂直間隔 0)
        else if (mouseX > startX && mouseX < startX + w && mouseY > startY + h && mouseY < startY + 2 * h) {
            currentWork = 2;
            initWorkTwo();
            workChanged = true;
        } 
        // 檢查作品三按鈕
        else if (mouseX > startX && mouseX < startX + w && mouseY > startY + 2 * h && mouseY < startY + 3 * h) {
            currentWork = 3;
            initWorkThree();
            workChanged = true;
        } 
        
        // 如果點擊了任一作品按鈕，則關閉選單
        if (workChanged) {
             menuActive = false;
        }
        // 如果點擊了選單的背景區域內，也關閉選單
        else if (mouseX > startX && mouseX < startX + w && mouseY > startY && mouseY < startY + 3 * h) {
             menuActive = false;
        }
    }
}


// =================================================================
//                   作品一: Circle Packing
// =================================================================

function circlePacking() {
    push();
    translate(width / 2, height / 2)
    let points = [];
    let count = 2000;
    for (let i = 0; i < count; i++) {
        let a = random(360);
        let d = random(width * 0.35);
        let s = random(200);
        let x = cos(a) * (d - s / 2);
        let y = sin(a) * (d - s / 2);
        let add = true;
        for (let j = 0; j < points.length; j++) {
            let p = points[j];
            if (dist(x, y, p.x, p.y) < (s + p.z) * 0.6) {
                add = false;
                break;
            }
        }
        if (add) points.push(createVector(x, y, s));
    }
    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        let rot = random(360);
        push();
        translate(p.x, p.y);
        rotate(rot);
        blendMode(OVERLAY)
        let r = p.z - 5;
        gradient(r)
        shape(0, 0, r)
        pop();
    }
    pop();
}

function shape(x, y, r) {
    push();
    noStroke();
    translate(x, y);
    let radius = r; //半徑
    let nums = 8
    for (let i = 0; i < 360; i += 360 / nums) {
        let ex = radius * sin(i);
        let ey = radius * cos(i);
        push();
        translate(ex, ey)
        rotate(atan2(ey, ex))
        distortedCircle(0, 0, r);

        pop();
        stroke(randomCol())
        strokeWeight(0.5)
        line(0, 0, ex, ey)
        ellipse(ex, ey, 2)
    }
    pop();
}

function distortedCircle(x, y, r) {
    push();
    translate(x, y)
    //points
    let p1 = createVector(0, -r / 2);
    let p2 = createVector(r / 2, 0);
    let p3 = createVector(0, r / 2);
    let p4 = createVector(-r / 2, 0)
    //anker
    let val = 0.3;
    let random_a8_1 = random(-r * val, r * val)
    let random_a2_3 = random(-r * val, r * val)
    let random_a4_5 = random(-r * val, r * val)
    let random_a6_7 = random(-r * val, r * val)
    let ran_anker_lenA = r * random(0.2, 0.5)
    let ran_anker_lenB = r * random(0.2, 0.5)
    let a1 = createVector(ran_anker_lenA, -r / 2 + random_a8_1);
    let a2 = createVector(r / 2 + random_a2_3, -ran_anker_lenB);
    let a3 = createVector(r / 2 - random_a2_3, ran_anker_lenA);
    let a4 = createVector(ran_anker_lenB, r / 2 + random_a4_5);
    let a5 = createVector(-ran_anker_lenA, r / 2 - random_a4_5);
    let a6 = createVector(-r / 2 + random_a6_7, ran_anker_lenB);
    let a7 = createVector(-r / 2 - random_a6_7, -ran_anker_lenA);
    let a8 = createVector(-ran_anker_lenB, -r / 2 - random_a8_1);
    beginShape();
    vertex(p1.x, p1.y);
    bezierVertex(a1.x, a1.y, a2.x, a2.y, p2.x, p2.y)
    bezierVertex(a3.x, a3.y, a4.x, a4.y, p3.x, p3.y)
    bezierVertex(a5.x, a5.y, a6.x, a6.y, p4.x, p4.y)
    bezierVertex(a7.x, a7.y, a8.x, a8.y, p1.x, p1.y)
    endShape();
    pop();
}

// =================================================================
//                   作品二: Pentacle
// =================================================================

function workTwo() {
    if (!started) {
        background(0);
        textAlign(CENTER, CENTER);
        fill(color(random(200, 255), random(0, 100), random(0, 100), 100 * noise(frameCount / 10))); 
        noStroke();
        textSize(pr);
        text('CLICK TO START SOUND!', width / 2, height / 2);
        return;
    }
    
    background(0); 

    sparkles_w2 = sparkles_w2.filter(s => s.alive);
    push();
    translate(width / 2, height / 2);
    image(ec, 0, 0);
    for (let s of sparkles_w2) {
        s.move();
        s.show();
    }
    pop();
    
    if (positions.length > 0 && frameCount % divider == 0) {
        let i = floor(random(positions.length));
        drawPentacle(positions[i], pr, 30);
        
        // 聲音控制
        if (typeof osc !== 'undefined' && typeof env !== 'undefined') {
            if (getAudioContext().state !== 'running') userStartAudio();
            
            osc.pan(map(positions[i].x, -width * 0.45, width * 0.45, -1, 1))
            env.play(osc);
        }
        
        positions.splice(i, 1);
        if (divider > 3) {
            divider -= 1;
        }
    }
    if (frameCount % 30 == 0 && positions.length > 0) ec.filter(BLUR, 1);
}

function makePositions() {
    positions = []; 
    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            let y = map(row, 0, rows - 1, -0.4 * height, 0.4 * height);
            let x = map(col, 0, cols - 1, -0.4 * width, 0.4 * width);
            positions.push(createVector(x, y));
        }
    }
}

function drawPentacle(pos, r, num) {
	let str = color(random(200, 255), random(55, 100), random(55, 100), 200);
	ec.strokeWeight(random(r / 20, r / 5));
	ec.stroke(str);
	ec.fill(255, random(10, 40))
	ec.push();
	ec.translate(width / 2, height / 2);
	ec.translate(pos);
	let ang = atan2(pos.y, pos.x);
	ec.rotate(ang);
	ec.fill(255, random(10, 40))
	let crosses = [];
	let pdiv = floor(num / 5);
	ec.beginShape();
	for (let i = 0; i < num; i++) {
		let a = i * TAU / (num - 1);
		let cx = r * cos(a);
		let cy = r * sin(a);
		let nx = cx + (r / 4) * noise(width + pos.x + cx);
		let ny = cy + (r / 4) * noise(height + pos.y + cy);
		ec.curveVertex(nx, ny);
		if (i % pdiv == 0) crosses.push({
			x: nx,
			y: ny
		})
	}
	ec.endShape(CLOSE);
	for (let i = 0; i < crosses.length; i++) {
		let x1 = crosses[i].x;
		let y1 = crosses[i].y;
		let x2 = crosses[(i + 2) % crosses.length].x;
		let y2 = crosses[(i + 2) % crosses.length].y;
		ec.curve(x1 + r, y1 - r, x1, y1, x2, y2, x2 - r, y2 + r);
		for (let j = 0; j < 3; j++) {
			let r_s = random(3, 8) * height / 628;
			let vel_s = p5.Vector.random2D().mult((height / 628) * pr / r_s);
			sparkles_w2.push(new Sparkle_W2(createVector(pos.x + x1, pos.y + y1), vel_s, r_s, color(255, 200, 200, random(180, 255))));
		}
	}
	ec.pop();
}

class Sparkle_W2 {
	constructor(pos, vel, r, f) {
		this.pos = pos;
		this.vel = vel;
		this.r = r;
		this.f = f;
		this.f.setRed(red(f) * 2)
		this.alive = true;
		this.counter = 0;
		this.lifespan = random(40, 80)
	}
	move() {
		this.pos.add(this.vel);
		this.vel.mult(0.98);
		this.counter += 1;
		if (this.counter > this.lifespan) {
			this.alive = false;
		}
	}
	show() {
		push();
		translate(this.pos);
		fill(this.f);
		noStroke();
		ellipse(0, 0, this.r);
		pop();
	}
}


// =================================================================
//                   作品三: Emanations
// =================================================================

function workThree() {
	background(0);
	for (let i of objs) {
		i.run();
	}

	for (let i = 0; i < objs.length; i++) {
		if (objs[i].isDead) {
			objs.splice(i, 1);
		}
	}

	if (frameCount % (random([10, 60, 120])) == 0) {
		addObjs();
	}
}

function addObjs() {
	let x = random(-0.1, 1.1) * width;
	let y = random(-0.1, 1.1) * height;
	
	for (let i = 0; i < 20; i++) {
		objs.push(new Orb(x, y));
	}

	for (let i = 0; i < 50; i++) {
		objs.push(new Sparkle_W3(x, y));
	}
	
	for (let i = 0; i < 2; i++) {
		objs.push(new Ripple(x, y));
	}

	for (let i = 0; i < 10; i++) {
		objs.push(new Shapes(x, y));
	}
}

function easeOutCirc(x) {
	return Math.sqrt(1 - Math.pow(x - 1, 2));
}

class Orb {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.radius = 0;
		this.maxRadius = minSide * 0.03;
		this.rStep = random(1);
		this.maxCircleD = minSide * 0.005;
		this.circleD = minSide * 0.005;
		this.isDead = false;
		this.ang = random(10);
		this.angStep = random([-1, 1]) * random(0.3, 0.1);
		this.xStep = random([-1, 1]) * minSide * random(0.01) * random(random());
		this.yStep = random([-1, 1]) * minSide * random(0.01) * random(random());
		this.life = 0;
		this.lifeSpan = int(random(50, 180));
		this.col = random(colors);
		this.pos = [];
		this.pos.push(createVector(this.x, this.y));
		this.followers = 10;
	}

	show() {
		this.xx = this.x + this.radius * cos(this.ang);
		this.yy = this.y + this.radius * sin(this.ang);
		push();
		noStroke();
		noFill();
		stroke(this.col);
		strokeWeight(this.circleD);
		beginShape();
		for (let i = 0; i < this.pos.length; i++) {
			vertex(this.pos[i].x, this.pos[i].y);
		}
		endShape();
		pop();
	}

	move() {
		this.ang += this.angStep;
		this.x += this.xStep;
		this.y += this.yStep;
		this.radius += this.rStep;
		this.radius = constrain(this.radius, 0, this.maxRadius);
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		this.circleD = map(this.life, 0, this.lifeSpan, this.maxCircleD, 1);
		this.pos.push(createVector(this.xx, this.yy));
		if (this.pos.length > this.followers) {
			this.pos.splice(0, 1);
		}
	}
	run() {
		this.show();
		this.move();
	}
}

class Sparkle_W3 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.r = minSide * random(0.4);
		this.a = random(10);
		this.x0 = x;
		this.y0 = y;
		this.targetX = x + this.r * cos(this.a);
		this.targetY = y + this.r * sin(this.a);
		this.life = 0;
		this.lifeSpan = int(random(50, 280));
		this.col = random(colors);
		this.sw = minSide * random(0.01)
	}

	show() {
		noFill();
		strokeWeight(this.sw);
		stroke(this.col);
		if (random() < 0.5) {
			point(this.x, this.y);
		}
	}

	move() {
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.x = lerp(this.x0, this.targetX, easeOutCirc(nrm));
		this.y = lerp(this.y0, this.targetY, easeOutCirc(nrm));
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
	}

	run() {
		this.show();
		this.move();
	}
}


class Ripple {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.life = 0;
		this.lifeSpan = int(random(50, 150));
		this.col = random(colors);
		this.maxSw = minSide * 0.005;
		this.sw = minSide * 0.005;
		this.d = 0;
		this.maxD = minSide * random(0.1, 0.5);
	}

	show() {
		noFill();
		stroke(this.col);
		strokeWeight(this.sw);
		circle(this.x, this.y, this.d);
	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.sw = lerp(this.maxSw, 0.1, easeOutCirc(nrm));
		this.d = lerp(0, this.maxD, easeOutCirc(nrm));
	}

	run() {
		this.show();
		this.move();
	}
}

class Shapes {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.life = 0;
		this.lifeSpan = int(random(50, 222));
		this.col = random(colors);
		this.sw = minSide * 0.005;
		this.maxSw = minSide * 0.005;
		this.w = minSide * random(0.05);
		this.ang = random(10);
		this.angStep = random([-1, 1]) * random(0.05);
		this.shapeType = int(random(3));
		this.r = minSide * random(0.4);
		this.a = random(10);
		this.x0 = x;
		this.y0 = y;
		this.targetX = x + this.r * cos(this.a);
		this.targetY = y + this.r * sin(this.a);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.ang);
		noFill();
		strokeWeight(this.sw);
		stroke(this.col);
		if (this.shapeType == 0) {
			square(0, 0, this.w);
		} else if (this.shapeType == 1) {
			circle(0, 0, this.w);
		} else if (this.shapeType == 2) {
			line(0, this.w / 2, 0, -this.w / 2);
			line(this.w / 2, 0, -this.w / 2, 0);
		}
		pop();

	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.x = lerp(this.x0, this.targetX, easeOutCirc(nrm));
		this.y = lerp(this.y0, this.targetY, easeOutCirc(nrm));
		this.sw = lerp(this.maxSw, 0.1, easeOutCirc(nrm));
		this.ang += this.angStep;
	}

	run() {
		this.show();
		this.move();
	}
}


// =================================================================
//                   選單繪製函數 (Menu Functions)
// =================================================================

// 繪製左上角選單開關按鈕
function drawMenuToggleButton() {
    let x = 10;
    let y = 10;
    let s = toggleButtonSize;
    let label = menuActive ? "關閉" : "選單"; // 根據狀態顯示不同文字

    push();
    rectMode(CORNER);
    
    // 按鈕背景
    if (menuActive) {
        fill(200, 50, 50, 220); // 選單開啟時，紅色（提示關閉）
    } else {
        fill(50, 200); // 預設顏色
    }
    noStroke();
    rect(x, y, s, s, 5); 

    // 文字
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(s * 0.25);
    text(label, x + s / 2, y + s / 2);
    
    pop();
}

// 繪製作品選擇列表 (Select Menu)
function drawSelectMenu() {
    let btnX = 10;
    let btnS = toggleButtonSize;
    let x = btnX + btnS + 10; // 位於開關按鈕右側 10 像素處
    let y = 10;
    let w = menuButtonWidth;  // 200
    let h = menuButtonHeight; // 60

    // 設定選單文字大小
    textSize(20); 

    // 繪製按鈕 (垂直堆疊，無間隔)
    drawMenuButtonSelect(x, y, w, h, "Circle Packing", 1);
    drawMenuButtonSelect(x, y + h, w, h, "Pentacle", 2);
    drawMenuButtonSelect(x, y + 2 * h, w, h, "Emanations", 3);
}

// 輔助函數：繪製單個作品選擇按鈕 (含懸停效果)
function drawMenuButtonSelect(x, y, w, h, label, workId) {
    push();
    // 偵測滑鼠懸停區域 (僅在選單開啟時有效)
    let hover = menuActive && mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

    noStroke();
    
    // 背景顏色
    if (workId === currentWork) {
        fill(50, 150, 200, 220); // 當前選中，深藍色
    } else if (hover) {
        fill(150, 150, 150, 150); // 懸停時亮起，淺灰色
    } else {
        fill(50, 100); // 預設背景色
    }

    // 繪製背景矩形（高亮色塊）
    rect(x, y, w, h, 5); 

    // 文字顏色
    if (workId === currentWork || hover) {
        fill(255); // 高亮時文字為白色
    } else {
        fill(200); // 預設文字為淺灰色
    }
    
    // 繪製文字 (垂直居中, 水平靠左對齊, 15px 邊距)
    textAlign(LEFT, CENTER);
    text(label, x + 15, y + h / 2); 
    
    pop();
}