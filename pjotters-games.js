// Vereist: gebruiker is ingelogd (token/email in localStorage)

// Helper: API-call om coins toe te voegen
async function addCoins(amount, activity) {
  try {
    const res = await fetch('/api/pjotters/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') },
      body: JSON.stringify({ amount, activity })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.saldo !== undefined) {
        showGameStatus(`+${amount} pjotters! Totaal: ${data.saldo}`, 'success');
      } else {
        showGameStatus('Coins toegekend!', 'success');
      }
    } else {
      showGameStatus('Kon coins niet toevoegen (authenticatie vereist?)', 'error');
    }
  } catch (e) {
    showGameStatus('Netwerkfout bij coins toevoegen', 'error');
  }
}

// Toon status in game-modal
function showGameStatus(msg, type) {
  const feedback = document.getElementById('game-feedback');
  if (!feedback) return;
  feedback.innerHTML = `<span style="color:${type==='success' ? '#0f0':'#f00'};">${msg}</span>`;
}

// Blokkeer coins als niet ingelogd
function requireLogin() {
  if (!localStorage.getItem('token')) {
    showGameStatus('Log eerst in om coins te verdienen!', 'error');
    return false;
  }
  return true;
}

// 50 games: NL + EN naam, uitleg als tooltip, coins per game
const games = [
  { key: 'mindmaze', naam: 'MindMaze', name: 'MindMaze', uitleg: 'Los logische puzzels op om te ontsnappen uit doolhoven. / Solve logic puzzles to escape mazes.', coins: 15 },
  { key: 'shiftblocks', naam: 'ShiftBlocks', name: 'ShiftBlocks', uitleg: 'Verschuif blokken om een pad te maken. / Slide blocks to create a path.', coins: 12 },
  { key: 'colorcircuit', naam: 'ColorCircuit', name: 'ColorCircuit', uitleg: 'Verbind kleuren zonder lijnen te kruisen. / Connect colors without crossing lines.', coins: 14 },
  { key: 'codecrackr', naam: 'CodeCrackr', name: 'CodeCrackr', uitleg: 'Los codepuzzels op. / Solve code puzzles.', coins: 13 },
  { key: 'echopattern', naam: 'EchoPattern', name: 'EchoPattern', uitleg: 'Onthoud en herhaal patronen. / Remember and repeat patterns.', coins: 10 },
  { key: 'turborush', naam: 'TurboRush', name: 'TurboRush', uitleg: 'Ontwijk obstakels en verzamel boosts. / Dodge obstacles and collect boosts.', coins: 8 },
  { key: 'skytrack', naam: 'SkyTrack', name: 'SkyTrack', uitleg: 'Race over zwevende circuits. / Race on floating tracks.', coins: 9 },
  { key: 'driftzone', naam: 'DriftZone', name: 'DriftZone', uitleg: 'Word driftkoning. / Become drift king.', coins: 11 },
  { key: 'rocketracers', naam: 'RocketRacers', name: 'RocketRacers', uitleg: 'Schiet raketten tijdens het racen. / Shoot rockets while racing.', coins: 10 },
  { key: 'speedsmash', naam: 'SpeedSmash', name: 'SpeedSmash', uitleg: 'Vernietig alles in je race. / Smash everything in your race.', coins: 8 },
  { key: 'darkshift', naam: 'DarkShift', name: 'DarkShift', uitleg: 'Overleef de nacht. / Survive the night.', coins: 12 },
  { key: 'outlasted', naam: 'Outlasted', name: 'Outlasted', uitleg: 'Overleef 10 seconden. / Survive 10 seconds.', coins: 10 },
  { key: 'deadsignal', naam: 'DeadSignal', name: 'DeadSignal', uitleg: 'Stuur een noodsignaal. / Send a distress signal.', coins: 11 },
  { key: 'thefogwithin', naam: 'TheFogWithin', name: 'TheFogWithin', uitleg: 'Vind het juiste woord. / Find the correct word.', coins: 9 },
  { key: 'decayzone', naam: 'DecayZone', name: 'DecayZone', uitleg: 'Verdedig je basis. / Defend your base.', coins: 13 },
  { key: 'blockrealm', naam: 'BlockRealm', name: 'BlockRealm', uitleg: 'Bouw een blok. / Build a block.', coins: 8 },
  { key: 'dreamcraft', naam: 'DreamCraft', name: 'DreamCraft', uitleg: 'Ontwerp een voertuig. / Design a vehicle.', coins: 12 },
  { key: 'tinyworlds', naam: 'TinyWorlds', name: 'TinyWorlds', uitleg: 'Creëer een mini-wereld. / Create a mini-world.', coins: 10 },
  { key: 'paintplay', naam: 'PaintPlay', name: 'PaintPlay', uitleg: 'Kies een kleur. / Choose a color.', coins: 9 },
  { key: 'pixelforge', naam: 'PixelForge', name: 'PixelForge', uitleg: 'Bouw een pixel-kunstwerk. / Build a pixel art.', coins: 11 },
  { key: 'flappybird', naam: 'FlappyBird', name: 'FlappyBird', uitleg: 'Klik om te vliegen. / Tap to fly.', coins: 15 },
  { key: 'pacman', naam: 'PacMan', name: 'PacMan', uitleg: 'Eet alle stippen. / Eat all dots.', coins: 15 },
  { key: 'snake', naam: 'Snake', name: 'Snake', uitleg: 'Word langer door te eten. / Grow by eating.', coins: 15 },
  { key: 'breakout', naam: 'Breakout', name: 'Breakout', uitleg: 'Breek alle blokjes. / Break all bricks.', coins: 14 },
  { key: 'spaceinvaders', naam: 'Space Invaders', name: 'Space Invaders', uitleg: 'Schiet de aliens. / Shoot the aliens.', coins: 14 },
  { key: 'tetris', naam: 'Tetris', name: 'Tetris', uitleg: 'Vul rijen. / Fill rows.', coins: 14 },
  { key: 'pong', naam: 'Pong', name: 'Pong', uitleg: 'Versla de computer. / Beat the AI.', coins: 13 },
  { key: 'frogger', naam: 'Frogger', name: 'Frogger', uitleg: 'Steek veilig over. / Cross safely.', coins: 13 },
  { key: 'arkanoid', naam: 'Arkanoid', name: 'Arkanoid', uitleg: 'Breek blokjes met powerup. / Break bricks with powerup.', coins: 13 },
  { key: 'memory', naam: 'Memory', name: 'Memory', uitleg: 'Vind alle paren. / Find all pairs.', coins: 13 }
];

// Dynamisch knoppen genereren voor de eerste 20 games
const gamesDiv = document.getElementById('games-list');
if (gamesDiv) {
  games.slice(0, 20).forEach(game => {
    if (!document.getElementById('btn-' + game.key)) {
      const btn = document.createElement('button');
      btn.className = 'game-btn';
      btn.id = 'btn-' + game.key;
      btn.textContent = `${game.naam} / ${game.name}`;
      btn.title = game.uitleg;
      btn.onclick = () => launchGame(game);
      gamesDiv.appendChild(btn);
    }
  });
}

// --- GAME IMPLEMENTATIES ---
function mindMazeGame(game) {
  const ui = document.getElementById('game-ui');
  const dir = Math.random() > 0.5 ? 'links' : 'rechts';
  ui.innerHTML = `<p>Kies de juiste kant om te ontsnappen:<br><button id="maze-left">Links</button> <button id="maze-right">Rechts</button></p>`;
  document.getElementById('maze-left').onclick = async () => {
    if (dir === 'links') {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  };
  document.getElementById('maze-right').onclick = async () => {
    if (dir === 'rechts') {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  };
}

function shiftBlocksGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Verschuif het blok naar rechts om het pad te openen. <button onclick="checkShiftBlocks()">Blok verschuiven</button></p>';
  window.checkShiftBlocks = async function() {
    if (!requireLogin()) return;
    await addCoins(game.coins, game.naam);
  }
}

function colorCircuitGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Welke kleuren mag je niet kruisen? <input id="colorcircuit-answer"><button onclick="checkColorCircuit()">Check</button></p>';
  window.checkColorCircuit = async function() {
    const val = document.getElementById('colorcircuit-answer').value.trim().toLowerCase();
    if (val.includes('rood') || val.includes('red')) {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  }
}

function codeCrackrGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Voer de juiste code in (hint: 3142): <input id="codecrackr-answer"><button onclick="checkCodeCrackr()">Check</button></p>';
  window.checkCodeCrackr = async function() {
    const val = document.getElementById('codecrackr-answer').value.trim();
    if (val === '3142') {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  }
}

function echoPatternGame(game) {
  const ui = document.getElementById('game-ui');
  const pattern = ['🔴','🟢','🔵'];
  ui.innerHTML = '<p>Onthoud dit patroon: <b>' + pattern.join(' ') + '</b></p>' +
    '<button onclick="showEchoInput()">Volgende</button>';
  window.showEchoInput = function() {
    ui.innerHTML = '<p>Voer het patroon in (gebruik emoji): <input id="echo-answer"><button onclick="checkEchoPattern()">Check</button></p>';
  }
  window.checkEchoPattern = async function() {
    const val = document.getElementById('echo-answer').value.trim();
    if (val.replace(/\s+/g,'') === pattern.join('')) {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  }
}

function turboRushGame(game) {
  const ui = document.getElementById('game-ui');
  let clicks = 0, tijd = 5;
  ui.innerHTML = '<p>Klik zo vaak mogelijk in 5 seconden!</p><button id="turbo-btn">Klik!</button> <span id="turbo-count">0</span>';
  document.getElementById('turbo-btn').onclick = function() { clicks++; document.getElementById('turbo-count').textContent = clicks; };
  setTimeout(async () => {
    if (clicks >= 15) {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Niet snel genoeg! Probeer opnieuw.', 'error');
    }
  }, tijd*1000);
}

function skyTrackGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Hoeveel bochten heeft een standaard SkyTrack-level? <input id="skytrack-answer"><button onclick="checkSkyTrack()">Check</button></p>';
  window.checkSkyTrack = async function() {
    const val = document.getElementById('skytrack-answer').value.trim();
    if (val === '8') {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  }
}

function driftZoneGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Drift zo lang mogelijk! Sleep de slider naar 100.</p><input type="range" min="0" max="100" id="drift-slider"> <span id="drift-val">0</span><button onclick="checkDriftZone()">Check</button>';
  document.getElementById('drift-slider').oninput = function(e) { document.getElementById('drift-val').textContent = e.target.value; };
  window.checkDriftZone = async function() {
    const val = document.getElementById('drift-slider').value;
    if (parseInt(val,10) === 100) {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Nog niet genoeg drift!', 'error');
    }
  }
}

function rocketRacersGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Hoeveel raketten kun je maximaal afschieten in RocketRacers? <input id="rocket-answer"><button onclick="checkRocketRacers()">Check</button></p>';
  window.checkRocketRacers = async function() {
    const val = document.getElementById('rocket-answer').value.trim();
    if (val === '3') {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  }
}

function speedSmashGame(game) {
  const ui = document.getElementById('game-ui');
  let smashed = 0;
  ui.innerHTML = '<p>Smash de knop 10x zo snel mogelijk! <button id="smash-btn">Smash!</button> <span id="smash-count">0</span></p>';
  document.getElementById('smash-btn').onclick = function() { smashed++; document.getElementById('smash-count').textContent = smashed; if (smashed >= 10) finishSmash(); };
  window.finishSmash = async function() {
    if (!requireLogin()) return;
    await addCoins(game.coins, game.naam);
  }
}

function darkShiftGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Het is nacht. Typ het geheime wachtwoord om te overleven: <input id="darkshift-answer"><button onclick="checkDarkShift()">Check</button></p>';
  window.checkDarkShift = async function() {
    const val = document.getElementById('darkshift-answer').value.trim().toLowerCase();
    if (val === 'nacht' || val === 'night') {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  }
}

function outlastedGame(game) {
  const ui = document.getElementById('game-ui');
  let seconds = 10;
  ui.innerHTML = `<p>Overleef ${seconds} seconden!<br><span id="outlasted-timer">${seconds}</span> seconden over.</p>`;
  let interval = setInterval(() => {
    seconds--;
    document.getElementById('outlasted-timer').textContent = seconds;
    if (seconds === 0) {
      clearInterval(interval);
      if (!requireLogin()) return;
      addCoins(game.coins, game.naam);
    }
  }, 1000);
}

function deadSignalGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Wat is het noodsignaal voor een verlaten schip? <input id="deadsignal-answer"><button onclick="checkDeadSignal()">Check</button></p>';
  window.checkDeadSignal = async function() {
    const val = document.getElementById('deadsignal-answer').value.trim().toLowerCase();
    if (val === 'mayday') {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  }
}

function theFogWithinGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Typ het Engelse woord voor mist: <input id="fogwithin-answer"><button onclick="checkFogWithin()">Check</button></p>';
  window.checkFogWithin = async function() {
    const val = document.getElementById('fogwithin-answer').value.trim().toLowerCase();
    if (val === 'fog') {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Fout! Probeer opnieuw.', 'error');
    }
  }
}

function decayZoneGame(game) {
  const ui = document.getElementById('game-ui');
  let waves = 0;
  ui.innerHTML = '<p>Verdedig je basis! Klik 5x om zombies te verslaan.<br><button id="decay-btn">Versla zombie</button> <span id="decay-count">0</span></p>';
  document.getElementById('decay-btn').onclick = function() {
    waves++;
    document.getElementById('decay-count').textContent = waves;
    if (waves >= 5) {
      if (!requireLogin()) return;
      addCoins(game.coins, game.naam);
    }
  }
}

function blockRealmGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Bouw een blok! Klik op de knop om een blok te plaatsen.<br><button id="block-btn">Plaats blok</button> <span id="block-count">0</span></p>';
  let blocks = 0;
  document.getElementById('block-btn').onclick = function() {
    blocks++;
    document.getElementById('block-count').textContent = blocks;
    if (blocks >= 3) {
      if (!requireLogin()) return;
      addCoins(game.coins, game.naam);
    }
  }
}

function dreamCraftGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Ontwerp een voertuig: typ een vervoermiddel (auto, fiets, boot): <input id="dreamcraft-answer"><button onclick="checkDreamCraft()">Check</button></p>';
  window.checkDreamCraft = async function() {
    const val = document.getElementById('dreamcraft-answer').value.trim().toLowerCase();
    if (["auto","fiets","boot","car","bike","boat"].includes(val)) {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Dat is geen voertuig...', 'error');
    }
  }
}

function tinyWorldsGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Creëer een mini-wereld: typ een thema (jungle, woestijn, stad): <input id="tinyworlds-answer"><button onclick="checkTinyWorlds()">Check</button></p>';
  window.checkTinyWorlds = async function() {
    const val = document.getElementById('tinyworlds-answer').value.trim().toLowerCase();
    if (["jungle","woestijn","stad","desert","city"].includes(val)) {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Geen geldig thema.', 'error');
    }
  }
}

function paintPlayGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Kies een kleur (rood, groen, blauw): <input id="paintplay-answer"><button onclick="checkPaintPlay()">Check</button></p>';
  window.checkPaintPlay = async function() {
    const val = document.getElementById('paintplay-answer').value.trim().toLowerCase();
    if (["rood","groen","blauw","red","green","blue"].includes(val)) {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Geen geldige kleur.', 'error');
    }
  }
}

function pixelForgeGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = '<p>Bouw een pixel-kunstwerk: typ een vorm (hart, ster, smiley): <input id="pixelforge-answer"><button onclick="checkPixelForge()">Check</button></p>';
  window.checkPixelForge = async function() {
    const val = document.getElementById('pixelforge-answer').value.trim().toLowerCase();
    if (["hart","ster","smiley","heart","star","smiley"].includes(val)) {
      if (!requireLogin()) return;
      await addCoins(game.coins, game.naam);
    } else {
      showGameStatus('Geen geldige vorm.', 'error');
    }
  }
}

// --- KLASSIEKE SPEELBARE GAMES 21 t/m 30 ---
// 21. FlappyBird
function flappyBirdGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = `<canvas id="flappy-canvas" width="240" height="320" style="background:#222;border-radius:12px;display:block;margin:0 auto;"></canvas><br><button id="flappy-restart">Restart</button>`;
  let canvas = document.getElementById('flappy-canvas');
  let ctx = canvas.getContext('2d');
  let bird = { x: 50, y: 160, vy: 0 };
  let pipes = [{ x: 240, gapY: 100 }];
  let score = 0, playing = true;
  function draw() {
    ctx.clearRect(0,0,240,320);
    ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(bird.x, bird.y, 10, 0, 2*Math.PI); ctx.fill();
    ctx.fillStyle = '#0f0';
    pipes.forEach(p => {
      ctx.fillRect(p.x, 0, 30, p.gapY-40);
      ctx.fillRect(p.x, p.gapY+40, 30, 320-p.gapY-40);
    });
    ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'; ctx.fillText('Score: '+score, 10, 20);
  }
  function update() {
    if (!playing) return;
    bird.vy += 0.7; bird.y += bird.vy;
    pipes.forEach(p => p.x -= 2);
    if (pipes[0].x < 100 && pipes.length<2) pipes.push({ x: 240, gapY: 60+Math.random()*180 });
    if (pipes[0].x < -30) { pipes.shift(); score++; }
    // Collision
    if (bird.y<0 || bird.y>320) endGame();
    pipes.forEach(p => {
      if (bird.x+10>p.x && bird.x-10<p.x+30 && (bird.y<p.gapY-40 || bird.y>p.gapY+40)) endGame();
    });
    draw();
    if (playing) requestAnimationFrame(update);
  }
  function endGame() {
    playing = false;
    showGameStatus('Game Over! Score: '+score, 'error');
    if (score>=3 && requireLogin()) addCoins(game.coins, game.naam);
  }
  canvas.onclick = () => { if (playing) bird.vy = -7; };
  document.getElementById('flappy-restart').onclick = () => { bird={x:50,y:160,vy:0};pipes=[{x:240,gapY:100}];score=0;playing=true;draw();update(); };
  draw();
  update();
}
// 22. PacMan (mini)
function pacmanGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = `<canvas id="pacman-canvas" width="240" height="240" style="background:#111;border-radius:12px;display:block;margin:0 auto;"></canvas><br><button id="pacman-restart">Restart</button>`;
  let canvas = document.getElementById('pacman-canvas');
  let ctx = canvas.getContext('2d');
  let pac = { x: 20, y: 20, dir: 'right' };
  let dots = Array.from({length:5}, (_,i)=>({ x:40+40*i, y:120 }));
  let score = 0, playing = true;
  function draw() {
    ctx.clearRect(0,0,240,240);
    ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(pac.x,pac.y,14,0,2*Math.PI); ctx.fill();
    ctx.fillStyle='#fff'; dots.forEach(d=>ctx.beginPath(),ctx.arc(d.x,d.y,4,0,2*Math.PI),ctx.fill());
    ctx.font='16px sans-serif'; ctx.fillText('Score: '+score,10,20);
  }
  function update() {
    if (!playing) return;
    if (pac.dir==='right') pac.x+=4;
    if (pac.dir==='left') pac.x-=4;
    if (pac.dir==='up') pac.y-=4;
    if (pac.dir==='down') pac.y+=4;
    // Walls
    if (pac.x<14) pac.x=14;
    if (pac.x>226) pac.x=226;
    if (pac.y<14) pac.y=14;
    if (pac.y>226) pac.y=226;
    // Dots
    dots.forEach((d,i)=>{if(Math.abs(pac.x-d.x)<12&&Math.abs(pac.y-d.y)<12){dots.splice(i,1);score++;}});
    draw();
    if (dots.length===0) { playing=false; showGameStatus('Victory!','success'); if(requireLogin())addCoins(game.coins, game.naam); return; }
    requestAnimationFrame(update);
  }
  window.onkeydown = e => { if(!playing)return; if(['ArrowUp','w'].includes(e.key))pac.dir='up'; if(['ArrowDown','s'].includes(e.key))pac.dir='down'; if(['ArrowLeft','a'].includes(e.key))pac.dir='left'; if(['ArrowRight','d'].includes(e.key))pac.dir='right'; };
  document.getElementById('pacman-restart').onclick = () => { pac={x:20,y:20,dir:'right'};dots=Array.from({length:5},(_,i)=>({x:40+40*i,y:120}));score=0;playing=true;draw();update(); };
  draw(); update();
}
// 23. Snake (klassiek)
function snakeGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = `<canvas id="snake-canvas" width="240" height="240" style="background:#222;border-radius:12px;display:block;margin:0 auto;"></canvas><br><button id="snake-restart">Restart</button>`;
  let canvas = document.getElementById('snake-canvas');
  let ctx = canvas.getContext('2d');
  let snake = [{x:120,y:120}], dir='right', food={x:80,y:80}, playing=true;
  function draw() {
    ctx.clearRect(0,0,240,240);
    ctx.fillStyle='#0f0'; snake.forEach(s=>ctx.fillRect(s.x,s.y,16,16));
    ctx.fillStyle='#f00'; ctx.fillRect(food.x,food.y,16,16);
  }
  function update() {
    if (!playing) return;
    let head = { ...snake[0] };
    if (dir==='right') head.x+=16; if (dir==='left') head.x-=16; if (dir==='up') head.y-=16; if (dir==='down') head.y+=16;
    if (head.x<0||head.x>224||head.y<0||head.y>224||snake.some(s=>s.x===head.x&&s.y===head.y)) { playing=false; showGameStatus('Game Over!','error'); return; }
    snake.unshift(head);
    if (head.x===food.x&&head.y===food.y) { food={x:16*Math.floor(Math.random()*15),y:16*Math.floor(Math.random()*15)}; } else { snake.pop(); }
    draw();
    if (snake.length>=8) { playing=false; showGameStatus('Victory!','success'); if(requireLogin())addCoins(game.coins, game.naam); return; }
    setTimeout(update,120);
  }
  window.onkeydown = e => { if(!playing)return; if(e.key==='ArrowUp'||e.key==='w')dir='up'; if(e.key==='ArrowDown'||e.key==='s')dir='down'; if(e.key==='ArrowLeft'||e.key==='a')dir='left'; if(e.key==='ArrowRight'||e.key==='d')dir='right'; };
  document.getElementById('snake-restart').onclick = () => { snake=[{x:120,y:120}];dir='right';food={x:80,y:80};playing=true;draw();update(); };
  draw(); update();
}
// 24. Breakout (blokjes)
function breakoutGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = `<canvas id="breakout-canvas" width="240" height="180" style="background:#111;border-radius:12px;display:block;margin:0 auto;"></canvas><br><button id="breakout-restart">Restart</button>`;
  let canvas = document.getElementById('breakout-canvas');
  let ctx = canvas.getContext('2d');
  let paddle = { x: 90 }, ball = { x: 120, y: 100, dx: 2, dy: -2 }, bricks = Array.from({length:5},(_,i)=>({x:10+45*i,y:20,w:40,h:15})), playing=true;
  function draw() {
    ctx.clearRect(0,0,240,180);
    ctx.fillStyle='#0ff';ctx.fillRect(paddle.x,160,60,10);
    ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(ball.x,ball.y,8,0,2*Math.PI);ctx.fill();
    ctx.fillStyle='#fff';bricks.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));
  }
  function update() {
    if (!playing) return;
    ball.x+=ball.dx; ball.y+=ball.dy;
    if (ball.x<8||ball.x>232) ball.dx*=-1;
    if (ball.y<8) ball.dy*=-1;
    if (ball.y>172) { playing=false; showGameStatus('Game Over!','error'); return; }
    if (ball.x>paddle.x&&ball.x<paddle.x+60&&ball.y>150) ball.dy*=-1;
    bricks.forEach((b,i)=>{if(ball.x>b.x&&ball.x<b.x+b.w&&ball.y>b.y&&ball.y<b.y+b.h){bricks.splice(i,1);ball.dy*=-1;}});
    draw();
    if (bricks.length===0) { playing=false; showGameStatus('Victory!','success'); if(requireLogin())addCoins(game.coins, game.naam); return; }
    requestAnimationFrame(update);
  }
  window.onmousemove = e => { if(!playing)return; const rect=canvas.getBoundingClientRect(); paddle.x=Math.min(180,Math.max(0,e.clientX-rect.left-30)); };
  document.getElementById('breakout-restart').onclick = () => { paddle.x=90;ball={x:120,y:100,dx:2,dy:-2};bricks=Array.from({length:5},(_,i)=>({x:10+45*i,y:20,w:40,h:15}));playing=true;draw();update(); };
  draw(); update();
}
// 25. Space Invaders (mini)
function spaceInvadersGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = `<canvas id="invader-canvas" width="240" height="180" style="background:#111;border-radius:12px;display:block;margin:0 auto;"></canvas><br><button id="invader-restart">Restart</button>`;
  let canvas = document.getElementById('invader-canvas');
  let ctx = canvas.getContext('2d');
  let ship = { x: 100 }, bullets=[], invaders=Array.from({length:5},(_,i)=>({x:30+40*i,y:30})), playing=true;
  function draw() {
    ctx.clearRect(0,0,240,180);
    ctx.fillStyle='#0ff';ctx.fillRect(ship.x,160,40,10);
    ctx.fillStyle='#FFD700';invaders.forEach(i=>ctx.fillRect(i.x,i.y,20,10));
    ctx.fillStyle='#fff';bullets.forEach(b=>ctx.fillRect(b.x,b.y,4,10));
  }
  function update() {
    if (!playing) return;
    invaders.forEach(i=>i.y+=0.2);
    bullets.forEach(b=>b.y-=4);
    bullets.forEach((b,bi)=>{invaders.forEach((i,ii)=>{if(b.x>i.x&&b.x<i.x+20&&b.y>i.y&&b.y<i.y+10){invaders.splice(ii,1);bullets.splice(bi,1);}});});
    draw();
    if (invaders.length===0) { playing=false; showGameStatus('Victory!','success'); if(requireLogin())addCoins(game.coins, game.naam); return; }
    if (invaders.some(i=>i.y>160)) { playing=false; showGameStatus('Game Over!','error'); return; }
    requestAnimationFrame(update);
  }
  window.onkeydown = e => { if(!playing)return; if(e.key==='ArrowLeft'||e.key==='a')ship.x=Math.max(0,ship.x-10); if(e.key==='ArrowRight'||e.key==='d')ship.x=Math.min(200,ship.x+10); if(e.key===' '||e.key==='ArrowUp')bullets.push({x:ship.x+18,y:150}); };
  document.getElementById('invader-restart').onclick = () => { ship.x=100;bullets=[];invaders=Array.from({length:5},(_,i)=>({x:30+40*i,y:30}));playing=true;draw();update(); };
  draw(); update();
}
// 26. Tetris (mini)
function tetrisGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = `<canvas id="tetris-canvas" width="120" height="200" style="background:#222;border-radius:12px;display:block;margin:0 auto;"></canvas><br><button id="tetris-restart">Restart</button>`;
  // Mini-tetris (één blokje per keer, win bij 5 rijen)
  // ... (Voor demo, echte tetris is complex, dus hier een mini-versie)
  let canvas = document.getElementById('tetris-canvas');
  let ctx = canvas.getContext('2d');
  let grid = Array.from({length:20},()=>Array(6).fill(0)), piece={x:2,y:0}, playing=true, rows=0;
  function draw() {
    ctx.clearRect(0,0,120,200);
    for(let y=0;y<20;y++)for(let x=0;x<6;x++)if(grid[y][x]){ctx.fillStyle='#FFD700';ctx.fillRect(x*20,y*10,20,10);}
    ctx.fillStyle='#0ff';ctx.fillRect(piece.x*20,piece.y*10,20,10);
  }
  function drop() {
    if (!playing) return;
    piece.y++;
    if (piece.y>18||grid[piece.y+1][piece.x]) { grid[piece.y][piece.x]=1; piece={x:Math.floor(Math.random()*6),y:0}; rows=grid.filter(r=>r.every(c=>c)).length; grid=grid.filter(r=>!r.every(c=>c)); while(grid.length<20)grid.unshift(Array(6).fill(0)); }
    draw();
    if (rows>=5) { playing=false; showGameStatus('Victory!','success'); if(requireLogin())addCoins(game.coins, game.naam); return; }
    setTimeout(drop, 200);
  }
  window.onkeydown = e => { if(!playing)return; if(e.key==='ArrowLeft'||e.key==='a')piece.x=Math.max(0,piece.x-1); if(e.key==='ArrowRight'||e.key==='d')piece.x=Math.min(5,piece.x+1); };
  document.getElementById('tetris-restart').onclick = () => { grid=Array.from({length:20},()=>Array(6).fill(0));piece={x:2,y:0};playing=true;rows=0;draw();drop(); };
  draw(); drop();
}
// 27. Pong (mini)
function pongGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = `<canvas id="pong-canvas" width="240" height="160" style="background:#222;border-radius:12px;display:block;margin:0 auto;"></canvas><br><button id="pong-restart">Restart</button>`;
  let canvas = document.getElementById('pong-canvas');
  let ctx = canvas.getContext('2d');
  let ball={x:120,y:80,dx:2,dy:2}, paddle=70, ai=70, playing=true, score=0;
  function draw() {
    ctx.clearRect(0,0,240,160);
    ctx.fillStyle='#FFD700';ctx.fillRect(10,paddle,10,40);ctx.fillRect(220,ai,10,40);
    ctx.beginPath();ctx.arc(ball.x,ball.y,8,0,2*Math.PI);ctx.fill();
    ctx.font='16px sans-serif';ctx.fillText('Score: '+score,100,20);
  }
  function update() {
    if (!playing) return;
    ball.x+=ball.dx; ball.y+=ball.dy;
    if (ball.y<8||ball.y>152) ball.dy*=-1;
    if (ball.x<20&&ball.y>paddle&&ball.y<paddle+40) {ball.dx*=-1;score++;}
    if (ball.x>220&&ball.y>ai&&ball.y<ai+40) ball.dx*=-1;
    if (ball.x<0||ball.x>240) { playing=false; showGameStatus('Game Over!','error'); return; }
    ai+=(ball.y-ai-20)*0.1;
    draw();
    if (score>=5) { playing=false; showGameStatus('Victory!','success'); if(requireLogin())addCoins(game.coins, game.naam); return; }
    requestAnimationFrame(update);
  }
  window.onkeydown = e => { if(!playing)return; if(e.key==='ArrowUp'||e.key==='w')paddle=Math.max(0,paddle-10); if(e.key==='ArrowDown'||e.key==='s')paddle=Math.min(120,paddle+10); };
  document.getElementById('pong-restart').onclick = () => { ball={x:120,y:80,dx:2,dy:2};paddle=70;ai=70;playing=true;score=0;draw();update(); };
  draw(); update();
}
// 28. Frogger (mini)
function froggerGame(game) {
  const ui = document.getElementById('game-ui');
  ui.innerHTML = `<canvas id="frog-canvas" width="240" height="160" style="background:#222;border-radius:12px;display:block;margin:0 auto;"></canvas><br><button id="frog-restart">Restart</button>`;
  let canvas = document.getElementById('frog-canvas');
  let ctx = canvas.getContext('2d');
  let frog={x:120,y:140}, cars=Array.from({length:3},(_,i)=>({x:80*i,y:60+40*i,speed:2+i})), playing=true;
  function draw() {
    ctx.clearRect(0,0,240,160);
    ctx.fillStyle='#0f0';ctx.fillRect(frog.x,frog.y,16,16);
    ctx.fillStyle='#FFD700';cars.forEach(c=>ctx.fillRect(c.x,c.y,32,16));
  }
  function update() {
    if (!playing) return;
    cars.forEach(c=>{c.x+=c.speed;if(c.x>240)c.x=-32;});
    cars.forEach(c=>{if(frog.x+16>c.x&&frog.x<c.x+32&&frog.y+16>c.y&&frog.y<c.y+16){playing=false;showGameStatus('Game Over!','error');}});
    draw();
    if (frog.y<=0) { playing=false; showGameStatus('Victory!','success'); if(requireLogin())addCoins(game.coins, game.naam); return; }
    requestAnimationFrame(update);
  }
  window.onkeydown = e => { if(!playing)return; if(e.key==='ArrowLeft'||e.key==='a')frog.x=Math.max(0,frog.x-16); if(e.key==='ArrowRight'||e.key==='d')frog.x=Math.min(224,frog.x+16); if(e.key==='ArrowUp'||e.key==='w')frog.y=Math.max(0,frog.y-16); if(e.key==='ArrowDown'||e.key==='s')frog.y=Math.min(144,frog.y+16); };
  document.getElementById('frog-restart').onclick = () => { frog={x:120,y:140};cars=Array.from({length:3},(_,i)=>({x:80*i,y:60+40*i,speed:2+i}));playing=true;draw();update(); };
  draw(); update();
}
// 29. Arkanoid (mini)
function arkanoidGame(game) {
  // Simpelere breakout-variant met powerup
  const ui = document.getElementById('game-ui');
  ui.innerHTML = `<canvas id="arkanoid-canvas" width="240" height="180" style="background:#111;border-radius:12px;display:block;margin:0 auto;"></canvas><br><button id="arkanoid-restart">Restart</button>`;
  let canvas = document.getElementById('arkanoid-canvas');
  let ctx = canvas.getContext('2d');
  let paddle = { x: 90 }, ball = { x: 120, y: 100, dx: 2, dy: -2 }, bricks = Array.from({length:7},(_,i)=>({x:10+32*i,y:20,w:28,h:15})), playing=true, powerup=false;
  function draw() {
    ctx.clearRect(0,0,240,180);
    ctx.fillStyle=powerup?'#0ff':'#fff';ctx.fillRect(paddle.x,160,60,10);
    ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(ball.x,ball.y,8,0,2*Math.PI);ctx.fill();
    ctx.fillStyle='#fff';bricks.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));
  }
  function update() {
    if (!playing) return;
    ball.x+=ball.dx; ball.y+=ball.dy;
    if (ball.x<8||ball.x>232) ball.dx*=-1;
    if (ball.y<8) ball.dy*=-1;
    if (ball.y>172) { playing=false; showGameStatus('Game Over!','error'); return; }
    if (ball.x>paddle.x&&ball.x<paddle.x+60&&ball.y>150) {ball.dy*=-1;if(powerup)ball.dx*=1.2;}
    bricks.forEach((b,i)=>{if(ball.x>b.x&&ball.x<b.x+b.w&&ball.y>b.y&&ball.y<b.y+b.h){bricks.splice(i,1);ball.dy*=-1;if(!powerup&&Math.random()<0.2)powerup=true;}});
    draw();
    if (bricks.length===0) { playing=false; showGameStatus('Victory!','success'); if(requireLogin())addCoins(game.coins, game.naam); return; }
    requestAnimationFrame(update);
  }
  window.onmousemove = e => { if(!playing)return; const rect=canvas.getBoundingClientRect(); paddle.x=Math.min(180,Math.max(0,e.clientX-rect.left-30)); };
  document.getElementById('arkanoid-restart').onclick = () => { paddle.x=90;ball={x:120,y:100,dx:2,dy:-2};bricks=Array.from({length:7},(_,i)=>({x:10+32*i,y:20,w:28,h:15}));playing=true;powerup=false;draw();update(); };
  draw(); update();
}
// 30. Memory (mini)
function memoryGame(game) {
  const ui = document.getElementById('game-ui');
  let cards = Array.from({length:6},(_,i)=>i).concat(Array.from({length:6},(_,i)=>i));
  cards = cards.sort(()=>Math.random()-0.5);
  let flipped=[], matched=[], tries=0;
  ui.innerHTML = `<div id="memory-board" style="display:grid;grid-template-columns:repeat(4,40px);gap:8px;justify-content:center;"></div><div id="memory-tries"></div>`;
  const board = document.getElementById('memory-board');
  cards.forEach((n,i)=>{
    let btn=document.createElement('button');btn.textContent='?';btn.style.width='40px';btn.style.height='40px';btn.onclick=()=>flip(i,n,btn);board.appendChild(btn);
  });
  function flip(i,n,btn) {
    if(flipped.length===2||matched.includes(i))return;
    btn.textContent=n;flipped.push({i,n,btn});
    if(flipped.length===2) {
      tries++;
      if(flipped[0].n===flipped[1].n&&flipped[0].i!==flipped[1].i) {
        matched.push(flipped[0].i,flipped[1].i);
        if(matched.length===12) { showGameStatus('Victory!','success'); if(requireLogin())addCoins(game.coins, game.naam); }
      } else {
        setTimeout(()=>{flipped[0].btn.textContent='?';flipped[1].btn.textContent='?';},600);
      }
      flipped=[];
    }
    document.getElementById('memory-tries').textContent = 'Beurten: '+tries;
  }
}

// Game launcher: opent een modal met de echte game
function launchGame(game) {
  openGameModal(game);
  switch(game.key) {
    case 'mindmaze': mindMazeGame(game); break;
    case 'shiftblocks': shiftBlocksGame(game); break;
    case 'colorcircuit': colorCircuitGame(game); break;
    case 'codecrackr': codeCrackrGame(game); break;
    case 'echopattern': echoPatternGame(game); break;
    case 'turborush': turboRushGame(game); break;
    case 'skytrack': skyTrackGame(game); break;
    case 'driftzone': driftZoneGame(game); break;
    case 'rocketracers': rocketRacersGame(game); break;
    case 'speedsmash': speedSmashGame(game); break;
    case 'darkshift': darkShiftGame(game); break;
    case 'outlasted': outlastedGame(game); break;
    case 'deadsignal': deadSignalGame(game); break;
    case 'thefogwithin': theFogWithinGame(game); break;
    case 'decayzone': decayZoneGame(game); break;
    case 'blockrealm': blockRealmGame(game); break;
    case 'dreamcraft': dreamCraftGame(game); break;
    case 'tinyworlds': tinyWorldsGame(game); break;
    case 'paintplay': paintPlayGame(game); break;
    case 'pixelforge': pixelForgeGame(game); break;
    case 'flappybird': flappyBirdGame(game); break;
    case 'pacman': pacmanGame(game); break;
    case 'snake': snakeGame(game); break;
    case 'breakout': breakoutGame(game); break;
    case 'spaceinvaders': spaceInvadersGame(game); break;
    case 'tetris': tetrisGame(game); break;
    case 'pong': pongGame(game); break;
    case 'frogger': froggerGame(game); break;
    case 'arkanoid': arkanoidGame(game); break;
    case 'memory': memoryGame(game); break;
    default: document.getElementById('game-ui').innerHTML = '<em>Game coming soon!</em>';
  }
}

// --- ECHTE GAME UI/LOGICA VOOR EERSTE 10 GAMES ---
function openGameModal(game) {
  // Modal overlay
  let modal = document.createElement('div');
  modal.className = 'game-modal';
  modal.innerHTML = `
    <div class="game-modal-content glass">
      <button class="close-btn" style="float:right;" onclick="this.parentNode.parentNode.remove()">&times;</button>
      <h2>${game.naam} <span style="font-size:0.7em;">/ ${game.name}</span></h2>
      <div id="game-ui"></div>
      <div id="game-feedback"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

// --- GOKSPELEN EN MONEY CLICKER ---
function startSlots() {
  if (!requireLogin()) return;
  const container = document.getElementById('game-container');
  container.innerHTML = `<div class='slots-ui'>
    <h3>Slots</h3>
    <div id='slots-reels' style='font-size:2em;margin:10px 0;'>🍒🍋🍀</div>
    <button id='slots-spin'>Spin (5 pjotters)</button>
    <div id='slots-result'></div>
    <div id='game-feedback'></div>
  </div>`;
  document.getElementById('slots-spin').onclick = async () => {
    if (!requireLogin()) return;
    let saldo = await getSaldo();
    if (saldo < 5) return showGameStatus('Te weinig pjotters!', 'error');
    await addCoins(-5, 'Slots inzet');
    const symbols = ['🍒','🍋','🍀','🔔','💎'];
    let r = [0,0,0].map(()=>symbols[Math.floor(Math.random()*symbols.length)]);
    document.getElementById('slots-reels').textContent = r.join('');
    let win = 0;
    if (r[0]===r[1] && r[1]===r[2]) win = 50;
    else if (r[0]===r[1]||r[1]===r[2]||r[0]===r[2]) win = 10;
    if (win>0) {
      await addCoins(win, 'Slots winst');
      document.getElementById('slots-result').innerHTML = `<span style='color:#0f0;'>Je wint ${win} pjotters!</span>`;
    } else {
      document.getElementById('slots-result').innerHTML = `<span style='color:#f44;'>Helaas, geen winst.</span>`;
    }
  };
}

function startRoulette() {
  if (!requireLogin()) return;
  const container = document.getElementById('game-container');
  container.innerHTML = `<div class='roulette-ui'>
    <h3>Roulette</h3>
    <label>Inzet (min 5): <input id='roulette-bet' type='number' min='5' value='5' style='width:60px;'></label>
    <select id='roulette-choice'><option value='red'>Rood</option><option value='black'>Zwart</option><option value='green'>Groen (x14)</option></select>
    <button id='roulette-spin'>Draai</button>
    <div id='roulette-result'></div>
    <div id='game-feedback'></div>
  </div>`;
  document.getElementById('roulette-spin').onclick = async () => {
    if (!requireLogin()) return;
    const bet = parseInt(document.getElementById('roulette-bet').value,10);
    if (bet<5) return showGameStatus('Minimale inzet is 5 pjotters.','error');
    let saldo = await getSaldo();
    if (saldo < bet) return showGameStatus('Te weinig pjotters voor inzet!','error');
    await addCoins(-bet, 'Roulette inzet');
    const choice = document.getElementById('roulette-choice').value;
    const roll = Math.random();
    let color = roll<0.475 ? 'red' : (roll<0.95 ? 'black' : 'green');
    let win = 0;
    if (choice===color) win = color==='green' ? bet*14 : bet*2;
    if (win>0) {
      await addCoins(win, 'Roulette winst');
      document.getElementById('roulette-result').innerHTML = `<span style='color:#0f0;'>Je wint ${win} pjotters! (${color})</span>`;
    } else {
      document.getElementById('roulette-result').innerHTML = `<span style='color:#f44;'>Helaas, ${color}. Geen winst.</span>`;
    }
  };
}

function startBlackjack() {
  if (!requireLogin()) return;
  const container = document.getElementById('game-container');
  container.innerHTML = `<div class='blackjack-ui'>
    <h3>Blackjack</h3>
    <label>Inzet (min 10): <input id='bj-bet' type='number' min='10' value='10' style='width:60px;'></label>
    <button id='bj-start'>Start</button>
    <div id='bj-table'></div>
    <div id='game-feedback'></div>
  </div>`;
  document.getElementById('bj-start').onclick = () => blackjackPlay();
}

let bjState = null;
function blackjackPlay() {
  const bet = parseInt(document.getElementById('bj-bet').value,10);
  if (bet<10) return showGameStatus('Minimale inzet is 10.','error');
  getSaldo().then(saldo => {
    if (saldo < bet) return showGameStatus('Te weinig pjotters!','error');
    bjState = { bet, deck: shuffleDeck(), player: [], dealer: [], done: false };
    bjState.player.push(drawCard(bjState));
    bjState.player.push(drawCard(bjState));
    bjState.dealer.push(drawCard(bjState));
    bjState.dealer.push(drawCard(bjState));
    renderBlackjack();
  });
}
function shuffleDeck() {
  const suits = ['♠','♥','♦','♣'];
  const vals = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
  let d = [];
  suits.forEach(s=>vals.forEach(v=>d.push({s,v})));
  for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
  return d;
}
function drawCard(state) { return state.deck.pop(); }
function handValue(hand) {
  let val = 0, aces = 0;
  hand.forEach(c=>{
    if (typeof c.v==='number') val+=c.v;
    else if (c.v==='A') { val+=11; aces++; }
    else val+=10;
  });
  while(val>21&&aces){val-=10;aces--;}
  return val;
}
function renderBlackjack() {
  const s = bjState;
  let html = `<div>Jij: ${handHtml(s.player)} (${handValue(s.player)})<br>Dealer: ${handHtml([s.dealer[0]])} [?]</div>`;
  if (!s.done) {
    html += `<button id='bj-hit'>Hit</button> <button id='bj-stand'>Stand</button>`;
  } else {
    html = `<div>Jij: ${handHtml(s.player)} (${handValue(s.player)})<br>Dealer: ${handHtml(s.dealer)} (${handValue(s.dealer)})</div>`;
  }
  document.getElementById('bj-table').innerHTML = html;
  if (!s.done) {
    document.getElementById('bj-hit').onclick = () => {
      s.player.push(drawCard(s));
      if (handValue(s.player)>=21) bjFinish(); else renderBlackjack();
    };
    document.getElementById('bj-stand').onclick = () => bjFinish();
  }
}
function handHtml(hand) { return hand.map(c=>c.v+c.s).join(' '); }
function bjFinish() {
  const s = bjState;
  s.done = true;
  while(handValue(s.dealer)<17) s.dealer.push(drawCard(s));
  renderBlackjack();
  const player = handValue(s.player), dealer = handValue(s.dealer);
  let msg = '';
  if (player>21) msg = 'Je bent bust!';
  else if (dealer>21||player>dealer) msg = 'Je wint!';
  else if (player===dealer) msg = 'Gelijkspel!';
  else msg = 'Dealer wint!';
  document.getElementById('game-feedback').innerHTML = msg;
  if (player>21) addCoins(-s.bet, 'Blackjack verlies');
  else if (dealer>21||player>dealer) addCoins(s.bet*2, 'Blackjack winst');
  else if (player===dealer) addCoins(0, 'Blackjack gelijkspel');
  else addCoins(-s.bet, 'Blackjack verlies');
}

// --- MONEY CLICKER ---
let clickerState = { coins: 1, upgrade: 1 };
function startMoneyClicker() {
  if (!requireLogin()) return;
  const container = document.getElementById('game-container');
  container.innerHTML = `<div class='clicker-ui'>
    <h3>Money Clicker</h3>
    <div>Klik op de munt om coins te verdienen!</div>
    <div id='clicker-coins'>Coins per klik: <b>${clickerState.upgrade}</b></div>
    <button id='clicker-btn' style='font-size:2em;'>🪙</button>
    <button id='clicker-upgrade'>Upgrade (10 pjotters)</button>
    <div id='game-feedback'></div>
  </div>`;
  document.getElementById('clicker-btn').onclick = async () => {
    await addCoins(clickerState.upgrade, 'Clicker klik');
    showGameStatus(`+${clickerState.upgrade} pjotters!`, 'success');
  };
  document.getElementById('clicker-upgrade').onclick = async () => {
    let saldo = await getSaldo();
    if (saldo<10) return showGameStatus('Te weinig pjotters voor upgrade!','error');
    await addCoins(-10, 'Clicker upgrade');
    clickerState.upgrade++;
    document.getElementById('clicker-coins').innerHTML = `Coins per klik: <b>${clickerState.upgrade}</b>`;
    showGameStatus('Upgrade gekocht!','success');
  };
}

// Helper: saldo ophalen
async function getSaldo() {
  const res = await fetch('/api/pjotters/saldo', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') } });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.saldo || 0;
}
// --- EINDE GOKSPELEN EN MONEY CLICKER ---
