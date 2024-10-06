document.addEventListener("DOMContentLoaded", function() {
    const boardElement = document.getElementById("shogiBoard");
    const playerCapturedElement = document.getElementById("playerCaptured");
    const enemyCapturedElement = document.getElementById("enemyCaptured");

    let isPlayerTurn = true;
    let playerCaptured = [];
    let enemyCaptured = [];
    let gameEnded = false; // ゲームが終了したかどうかのフラグ

    // 将棋盤の初期化
    const board = [
        ['-香', '-桂', '-銀', '-金', '-王', '-金', '-銀', '-桂', '-香'],
        ['', '-飛', '', '', '', '', '', '-角', ''],
        ['-歩', '-歩', '-歩', '-歩', '-歩', '-歩', '-歩', '-歩', '-歩'],
        ['', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ''],
        ['+歩', '+歩', '+歩', '+歩', '+歩', '+歩', '+歩', '+歩', '+歩'],
        ['', '+角', '', '', '', '', '', '+飛', ''],
        ['+香', '+桂', '+銀', '+金', '+玉', '+金', '+銀', '+桂', '+香']
    ];

    let selectedPiece = null;
    let selectedCell = null;

    // 盤の描画関数
    function renderBoard() {
        boardElement.innerHTML = '';
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.x = x;
                cell.dataset.y = y;
                if (board[y][x] !== '') {
                    const piece = document.createElement("div");
                    piece.classList.add("piece");
                    piece.textContent = board[y][x];

                    if (piece.textContent[0] === '-') {
                        piece.classList.add("enemy");
                    }

                    cell.appendChild(piece);
                }
                boardElement.appendChild(cell);
            }
        }
    }

    // 初期描画
    renderBoard();

    // イベントリスナーの登録
    boardElement.addEventListener("click", onCellClick);
    playerCapturedElement.addEventListener("click", onCapturedPieceClick);
    enemyCapturedElement.addEventListener("click", onCapturedPieceClick);

    function onCellClick(event) {
        if (gameEnded) return; // ゲームが終了している場合、操作を無効にする

        let target = event.target;

        // クリックされた要素が駒の場合、親のセルに変更
        if (target.classList.contains("piece")) {
            target = target.parentElement;
        }

        if (target.classList.contains("cell")) {
            if (selectedPiece) {
                if (!selectedPiece.classList.contains("captured")) {
                    if (canMove(selectedPiece.textContent, selectedCell, target)) {
                        movePiece(selectedPiece, selectedCell, target);
                        clearHighlights();
                        selectedPiece = null;
                        selectedCell = null;
                    } else {
                        clearHighlights();
                        selectedPiece = null;
                        selectedCell = null;
                    }
                } else {
                    if (!target.firstChild) {
                        if (canDrop(selectedPiece.textContent, target)) {
                            placeCapturedPiece(selectedPiece, target);
                            clearHighlights();
                            selectedPiece = null;
                            selectedCell = null;
                            isPlayerTurn = !isPlayerTurn;
                            updateCapturedPieces();
                        }
                    }
                }
            } else {
                // 駒の選択
                if (target.firstChild && target.firstChild.classList.contains("piece")) {
                    const piece = target.firstChild;
                    const pieceOwner = piece.textContent[0];

                    if ((isPlayerTurn && pieceOwner === '+') || (!isPlayerTurn && pieceOwner === '-')) {
                        selectedPiece = piece;
                        selectedCell = target;
                        highlightMoves(selectedPiece, selectedCell);
                    }
                }
            }
        }
    }

    function onCapturedPieceClick(event) {
        if (gameEnded) return; // ゲームが終了している場合、操作を無効にする

        const target = event.target;

        if (target.classList.contains("piece") && target.classList.contains("captured")) {
            const pieceOwner = target.textContent[0];

            if ((isPlayerTurn && pieceOwner === '+') || (!isPlayerTurn && pieceOwner === '-')) {
                if (selectedPiece) {
                    clearHighlights();
                    selectedPiece = null;
                }
                selectedPiece = target;
                highlightDrops(selectedPiece.textContent);
            }
        }
    }

    // 駒の移動
    function movePiece(piece, fromCell, toCell) {
        const pieceOwner = piece.textContent[0];
        if (toCell.firstChild) {
            const capturedPiece = toCell.firstChild.textContent;
            // 王（玉）を取ったかどうかをチェック
            if (capturedPiece.includes('玉') || capturedPiece.includes('王')) {
                gameEnded = true;
                if (pieceOwner === '+') {
                    alert("あなたの勝ちです！");
                } else {
                    alert("相手の勝ちです！");
                }
                return; // ゲームを終了
            }

            if (pieceOwner === '+') {
                playerCaptured.push(capturedPiece.replace('-', '+'));
            } else {
                enemyCaptured.push(capturedPiece.replace('+', '-'));
            }
        }
        toCell.innerHTML = '';
        toCell.appendChild(piece);
        fromCell.innerHTML = '';

        // 盤のデータ更新
        const fromX = parseInt(fromCell.dataset.x);
        const fromY = parseInt(fromCell.dataset.y);
        const toX = parseInt(toCell.dataset.x);
        const toY = parseInt(toCell.dataset.y);
        board[toY][toX] = board[fromY][fromX];
        board[fromY][fromX] = '';

        isPlayerTurn = !isPlayerTurn;
        updateCapturedPieces();
    }

    // 取った駒の配置
    function placeCapturedPiece(piece, toCell) {
        const pieceOwner = isPlayerTurn ? '+' : '-';
        piece.textContent = piece.textContent.replace(/[+-]/, pieceOwner);
        piece.classList.remove("captured");
        if (pieceOwner === '-') {
            piece.classList.add("enemy");
        } else {
            piece.classList.remove("enemy");
        }

        toCell.appendChild(piece);

        // 盤のデータ更新
        const toX = parseInt(toCell.dataset.x);
        const toY = parseInt(toCell.dataset.y);
        board[toY][toX] = piece.textContent;

        // 取った駒から削除
        if (isPlayerTurn) {
            const index = playerCaptured.indexOf(piece.textContent);
            if (index > -1) {
                playerCaptured.splice(index, 1);
            }
        } else {
            const index = enemyCaptured.indexOf(piece.textContent);
            if (index > -1) {
                enemyCaptured.splice(index, 1);
            }
        }
    }

    // 取った駒の表示更新
    function updateCapturedPieces() {
        // プレイヤーの取った駒を表示
        playerCapturedElement.innerHTML = '自分の取った駒: ';
        playerCaptured.forEach(p => {
            const span = document.createElement('span');
            span.textContent = p;
            span.classList.add('piece', 'captured');
            playerCapturedElement.appendChild(span);
        });

        // 敵の取った駒を表示
        enemyCapturedElement.innerHTML = '相手の取った駒: ';
        enemyCaptured.forEach(p => {
            const span = document.createElement('span');
            span.textContent = p;
            span.classList.add('piece', 'captured', 'enemy');
            enemyCapturedElement.appendChild(span);
        });
    }

    // 駒の移動可能なマスをハイライト
    function highlightMoves(piece, fromCell) {
        if (gameEnded) return; // ゲームが終了している場合、操作を無効にする

        clearHighlights();
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (canMove(piece.textContent, fromCell, cell)) {
                cell.classList.add('highlight');
            }
        });
    }

    // 駒を打てる場所をハイライト
    function highlightDrops(piece) {
        if (gameEnded) return; // ゲームが終了している場合、操作を無効にする

        clearHighlights();
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (!cell.firstChild && canDrop(piece, cell)) {
                cell.classList.add('highlight');
            }
        });
    }

    // ハイライトのクリア
    function clearHighlights() {
        const highlightedCells = document.querySelectorAll('.cell.highlight');
        highlightedCells.forEach(cell => {
            cell.classList.remove('highlight');
        });
    }

    // 駒の移動可能か判定
    function canMove(piece, fromCell, toCell) {
        const fromX = parseInt(fromCell.dataset.x);
        const fromY = parseInt(fromCell.dataset.y);
        const toX = parseInt(toCell.dataset.x);
        const toY = parseInt(toCell.dataset.y);
        const dx = toX - fromX;
        const dy = toY - fromY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const pieceOwner = piece[0];
        const isForward = pieceOwner === '+' ? -1 : 1;

        // 移動先に自分の駒がある場合は移動不可
        if (toCell.firstChild && toCell.firstChild.textContent[0] === pieceOwner) {
            return false;
        }

        switch (piece[1]) {
            case '歩':
                return dx === 0 && dy === isForward;
            case '香':
                if (dx !== 0) return false;
                if (Math.sign(dy) !== isForward) return false;
                // 間の駒がないか確認
                for (let i = 1; i < Math.abs(dy); i++) {
                    const y = fromY + i * isForward;
                    if (board[y][fromX] !== '') return false;
                }
                return true;
            case '桂':
                return absDx === 1 && dy === 2 * isForward;
            case '銀':
                if (absDx === 1 && dy === isForward) return true;
                if (dx === 0 && dy === isForward) return true;
                if (absDx === 1 && dy === -isForward) return true;
                return false;
            case '金':
                if (absDx === 0 && dy === isForward) return true;
                if (absDx === 1 && dy === 0) return true;
                if (absDx === 1 && dy === isForward) return true;
                if (dx === 0 && dy === -isForward) return true;
                return false;
            case '角':
                if (absDx !== absDy) return false;
                // 間の駒がないか確認
                for (let i = 1; i < absDx; i++) {
                    const x = fromX + i * Math.sign(dx);
                    const y = fromY + i * Math.sign(dy);
                    if (board[y][x] !== '') return false;
                }
                return true;
            case '飛':
                if (dx !== 0 && dy !== 0) return false;
                // 間の駒がないか確認
                if (dx === 0) {
                    for (let i = 1; i < absDy; i++) {
                        const y = fromY + i * Math.sign(dy);
                        if (board[y][fromX] !== '') return false;
                    }
                } else {
                    for (let i = 1; i < absDx; i++) {
                        const x = fromX + i * Math.sign(dx);
                        if (board[fromY][x] !== '') return false;
                    }
                }
                return true;
            case '玉':
            case '王':
                return absDx <= 1 && absDy <= 1 && (absDx !== 0 || absDy !== 0);
            default:
                return false;
        }
    }

    // 駒を打てるか判定
    function canDrop(piece, toCell) {
        const toX = parseInt(toCell.dataset.x);
        const pieceOwner = piece[0];

        if (piece[1] === '歩') {
            // 二歩のチェック
            for (let y = 0; y < 9; y++) {
                const cellPiece = board[y][toX];
                if (cellPiece === pieceOwner + '歩') {
                    return false;
                }
            }
        }
        return true;
    }
});
