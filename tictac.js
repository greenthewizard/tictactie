const dom = (() => {
	const $board = document.getElementById('board');

	return {
		$board
	}
})();

const gameboard = (() => {
	let cx = null;

	const _render = function() {
		//cx is DOM element context for render output.
		//clear context
		while(cx.firstChild) {
			cx.removeChild(cx.firstChild);
		}

		//generate table
		let $tbl = document.createElement('table');
		for(let x = 0; x < 3; x++) {
			let $tr = $tbl.insertRow();
			for(let y = 0; y < 3; y++) {
				let $td = $tr.insertCell();
				$td.appendChild(document.createTextNode(""));
			};
		};

		cx.appendChild($tbl);
	}

	const _getCellList = function() {
		let cells = [];
		cx.querySelectorAll("td").forEach(cell => {
			cells.push(cell.textContent);
		});
		return cells;
	}

	const _match3 = function(x, y, z) {
		cells = _getCellList();
		return (cells[x] != "" 
			&& cells[x] === cells[y] 
			&& cells[x] === cells[z]
		);
	}

	const _isFull = function() {
		return _getCellList().includes("");
	}

	const init = function (newCx) {
		cx = newCx;
		_render();
	}

	const isValidMove = function (cx) {
		//Returns true if move at node is valid.
		if (cx.target.firstChild.textContent === "") {
			return true;
		} else {
			return false;
		}
	}

	gameIsWon = function () {
		return _match3(0, 1, 2) //Horizontal
			|| _match3(3, 4, 5)
			|| _match3(6, 7, 8)
			|| _match3(0, 3, 6) //Vertical
			|| _match3(1, 4, 7)
			|| _match3(2, 5, 8)
			|| _match3(0, 4, 8) //Diagonal
			|| _match3(2, 4, 6)
			|| false
	}

	const mark = function(symbol, cx) {
		cx.target.firstChild.nodeValue = symbol;
	}

	return {
		mark,
		init,
		isValidMove,
		gameIsWon
	}
})();

const tictac = (() => {
	//Private
	let currentPlayer = 0;
	let players = [];

	const _Player = function (name, symbol) {
		return { name, symbol }
	}

	const _addPlayer = function(name, symbol) {
		players.push(_Player(name, symbol));
	}

	//Public
	const newGame = function () {
		if (players.length < 1) {
			let p1;
			let p2;
			// let p2 = prompt("Player 2, what is your name?");
			// let p1 = prompt("Player 1, what is your name?");
			p1 = p1 === "" ? "Unnamed" : p1;
			p2 = p2 === "" ? "Unnamed" : p2;
			_addPlayer(p1, "x");
			_addPlayer(p2, "o");
		}
	}

	const nextTurn = function () {
		currentPlayer = currentPlayer ? 0 : 1;
	}

	const getCurrentPlayer = function () {
		return players[currentPlayer];
	}

	return {
		newGame,
		nextTurn,
		getCurrentPlayer
	}
})();

gameboard.init(dom.$board);
tictac.newGame();

dom.$board.addEventListener("click", function(e) {
	let symbol = tictac.getCurrentPlayer().symbol;
	let name = tictac.getCurrentPlayer().name;
	if (gameboard.isValidMove(e)) {
		gameboard.mark(symbol, e);

		if(gameboard.gameIsWon()) {
			alert(`Game over! ${name} wins!`)
		} else {
			tictac.nextTurn();
		}
	}
});