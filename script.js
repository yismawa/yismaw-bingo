// ማሳሰቢያ፡ ይህንን ኮድ script.js በሚል ፋይል አስቀምጠው
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('bingo-board');
    const statusText = document.getElementById('status');
    const SIZE = 5;
    let grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(false));

    // የቢንጎ ህጋዊ ቁጥሮችን ማመንጫ (B:1-15, I:16-30, N:31-45, G:46-60, O:61-75)
    function generateBingoNumbers() {
        const ranges = [
            { min: 1, max: 15 },   // B
            { min: 16, max: 30 },  // I
            { min: 31, max: 45 },  // N
            { min: 46, max: 60 },  // G
            { min: 61, max: 75 }   // O
        ];

        let numbers = Array(SIZE).fill(null).map(() => []);

        for (let col = 0; col < SIZE; col++) {
            const pool = [];
            for (let i = ranges[col].min; i <= ranges[col].max; i++) {
                pool.push(i);
            }
            // ቁጥሮቹን መቀላቀል (Shuffle)
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            numbers[col] = pool.slice(0, SIZE);
        }
        return numbers;
    }

    const bingoNumbers = generateBingoNumbers();

    // ቦርዱን መሥራት
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // መሃል ላይ ፍሪ ቦታ ለመስጠት (FREE SPACE)
            if (row === 2 && col === 2) {
                cell.textContent = "FREE";
                cell.classList.add('free-space', 'marked');
                grid[row][col] = true;
            } else {
                // የቢንጎ ቁጥሮችን በየአምዱ መደርደር
                cell.textContent = bingoNumbers[col][row];
                
                cell.addEventListener('click', () => {
                    if (!cell.classList.contains('marked')) {
                        cell.classList.add('marked');
                        grid[row][col] = true;
                        checkWin();
                    } else {
                        cell.classList.remove('marked');
                        grid[row][col] = false;
                        statusText.textContent = "";
                        statusText.classList.remove('won-message');
                    }
                });
            }
            board.appendChild(cell);
        }
    }

    // ማሸነፉን ማረጋገጫ ቀመር
    function checkWin() {
        // 1. አግድም ማረጋገጥ (Rows)
        for (let r = 0; r < SIZE; r++) {
            if (grid[r].every(val => val)) { return showWin(); }
        }

        // 2. በቁም ማረጋገጥ (Columns)
        for (let c = 0; c < SIZE; c++) {
            let colWin = true;
            for (let r = 0; r < SIZE; r++) {
                if (!grid[r][c]) { colWin = false; break; }
            }
            if (colWin) { return showWin(); }
        }

        // 3. በሰያፍ ማረጋገጥ (Diagonals)
        let diag1 = true, diag2 = true;
        for (let i = 0; i < SIZE; i++) {
            if (!grid[i][i]) diag1 = false;
            if (!grid[i][SIZE - 1 - i]) diag2 = false;
        }
        if (diag1 || diag2) { return showWin(); }
    }

    function showWin() {
        statusText.textContent = "🎉 ቢንጎ! አሸንፈሃል! 🏆";
        statusText.classList.add('won-message');
    }
});
