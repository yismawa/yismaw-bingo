// ══════════════════════════════
//  FIREBASE CONFIG
// ══════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyA1...",
  authDomain: "yismaw-bingo.firebaseapp.com",
  databaseURL: "https://yismaw-bingo-default-rtdb.firebaseio.com",
  projectId: "yismaw-bingo",
  storageBucket: "yismaw-bingo.appspot.com",
  messagingSenderId: "12345678",
  appId: "1:123456:web:abcdef"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const CFG = { ADMIN_PASSWORD: "admin123" };
const ST = { 
  role: null, 
  player: null, 
  players: [], 
  gameActive: false,
  SIZE: 5,
  grid: Array(5).fill(null).map(() => Array(5).fill(false))
};

const $ = id => document.getElementById(id);

// ⚡ ══════════════════════════════
//  1. ገጹ ሲከፈት መለያውን እና የካርቴላ ቦርዱን ያዘጋጃል
// ══════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role');

  if (role === 'player') {
    // ተጫዋች ከሆነ የአድሚን ገጹን ደብቆ የስም ማስገቢያውን ያሳያል
    if($('admin-login-screen')) $('admin-login-screen').style.display = 'none';
    if($('player-wait-screen')) $('player-wait-screen').style.display = 'flex';
    if($('pw-name-form')) $('pw-name-form').style.display = 'block';
    if($('pw-waiting')) $('pw-waiting').style.display = 'none';
  }
  
  // የቢንጎ ቁጥሮችን በማመንጨት ቦርዱን ያዘጋጃል
  setupBingoBoard();
});

// 🎲 ══════════════════════════════
//  2. የቢንጎ ካርቴላ ማመንጫ እና የክሊክ ሎጂክ
// ══════════════════════════════
function generateBingoNumbers() {
  const ranges = [
    { min: 1, max: 15 },   // B
    { min: 16, max: 30 },  // I
    { min: 31, max: 45 },  // N
    { min: 46, max: 60 },  // G
    { min: 61, max: 75 }   // O
  ];

  let numbers = Array(ST.SIZE).fill(null).map(() => []);

  for (let col = 0; col < ST.SIZE; col++) {
    const pool = [];
    for (let i = ranges[col].min; i <= ranges[col].max; i++) {
      pool.push(i);
    }
    // Shuffle (ቁጥሮቹን መቀላቀል)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    numbers[col] = pool.slice(0, ST.SIZE);
  }
  return numbers;
}

function setupBingoBoard() {
  // በኤችቲኤምኤል ላይ mycards-container የሚለውን ክፍል ፈልጎ ቦርድ ይሰራበታል
  const container = $('mycards-container');
  if (!container) return;
  
  container.innerHTML = ''; // የነበረውን የቴክስት መልዕክት ያጠፋል
  
  const board = document.createElement('div');
  board.id = 'bingo-board';
  board.classList.add('grid5'); // በ CSS የመረጥከውን የ 5x5 Grid Layout ይጠቀማል
  
  const bingoNumbers = generateBingoNumbers();

  for (let row = 0; row < ST.SIZE; row++) {
    for (let col = 0; col < ST.SIZE; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      
      // መሃል ላይ FREE ቦታ ለመስጠት
      if (row === 2 && col === 2) {
        cell.textContent = "FREE";
        cell.classList.add('free', 'marked');
        ST.grid[row][col] = true;
      } else {
        cell.textContent = bingoNumbers[col][row];
        
        cell.addEventListener('click', () => {
          if (!cell.classList.contains('marked')) {
            cell.classList.add('marked');
            ST.grid[row][col] = true;
            checkWin();
          } else {
            cell.classList.remove('marked');
            ST.grid[row][col] = false;
          }
        });
      }
      board.appendChild(cell);
    }
  }
  container.appendChild(board);
}

// 🏆 ══════════════════════════════
//  3. ማሸነፍን ማረጋገጫ ሎጂክ
// ══════════════════════════════
function checkWin() {
  // 1. አግድም (Rows)
  for (let r = 0; r < ST.SIZE; r++) {
    if (ST.grid[r].every(val => val)) { return showWin(); }
  }

  // 2. በቁም (Columns)
  for (let c = 0; c < ST.SIZE; c++) {
    let colWin = true;
    for (let r = 0; r < ST.SIZE; r++) {
      if (!ST.grid[r][c]) { colWin = false; break; }
    }
    if (colWin) { return showWin(); }
  }

  // 3. በሰያፍ (Diagonals)
  let diag1 = true, diag2 = true;
  for (let i = 0; i < ST.SIZE; i++) {
    if (!ST.grid[i][i]) diag1 = false;
    if (!ST.grid[i][ST.SIZE - 1 - i]) diag2 = false;
  }
  if (diag1 || diag2) { return showWin(); }
}

function showWin() {
  // በኤችቲኤምኤል ላይ የሰራኸውን የሽልማት ገጽ (Winner Screen) ያሳያል
  if ($('winner-screen')) {
    $('winner-name-txt').textContent = ST.player ? ST.player.name : "ተጫዋች";
    $('winner-prize-txt').textContent = "500 ብር"; // ይህንን እንደ አስፈላጊነቱ ማስተካከል።
    $('winner-screen').style.display = 'flex';
  }
  // የድምፅ ማጀቢያ ካለህ እዚህ ጋር መጥራት ትችላለህ
}

function closeWinnerScreen() {
  if ($('winner-screen')) $('winner-screen').style.display = 'none';
}

// 🛡️ ══════════════════════════════
//  4. ADMIN & PLAYER FIREBASE AUTH
// ══════════════════════════════
function adminLogin() {
  const pass = $('adm-pass').value;
  if(pass !== CFG.ADMIN_PASSWORD) { alert('❌ ስህተት ፓስወርድ!'); return; }
  ST.role = 'admin';
  $('admin-login-screen').style.display = 'none';
  $('main-nav').style.display = 'flex';
  $('nv-admin').style.display = 'flex';
  $('user-chip').textContent = '🛡 Admin';
  listenFirebase();
  showPage('admin', $('nv-admin'));
}

function showPlayerEntry() {
  $('admin-login-screen').style.display = 'none';
  $('player-wait-screen').style.display = 'flex';
}

function playerEnterName() {
  const name = $('pw-name-inp').value.trim();
  if(!name) { alert('እባክዎ ስምዎን ያስገቡ'); return; }

  const pid = 'p_' + Date.now();
  ST.player = { id: pid, name, status: 'waiting', role: 'player' };
  ST.role = 'player';

  // መረጃው ወዲያውኑ ወደ Firebase ይላካል!
  db.ref('players/' + pid).set(ST.player);

  $('pw-name-form').style.display = 'none';
  $('pw-waiting').style.display = 'block';
  $('pw-name-shown').textContent = 'ስም: ' + name;

  listenFirebase();
}

function listenFirebase() {
  db.ref('players').on('value', snap => {
    const data = snap.val();
    const listDiv = $('admin-active-list');
    if(!listDiv) return;
    listDiv.innerHTML = '';
    
    let count = 0;
    if(data) {
      Object.keys(data).forEach(key => {
        count++;
        const p = data[key];
        listDiv.innerHTML += `<div class="p-row"><span>👤 ${p.name}</span> <span class="user-chip">${p.status}</span></div>`;
      });
    }
    if($('s-players')) $('s-players').textContent = count;
  });
}

function showPage(pgId, btn) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tb').forEach(b => b.classList.remove('active'));
  $('pg-' + pgId).classList.add('active');
  if(btn) btn.classList.add('active');
}
