const gameboard = (() => {
	let cx = document.querySelector('#board-wrapper');
	const possibleMatches = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	]

	const _render = function() {
		//cx is DOM element context for render output.
		//clear context
		while(cx.firstChild) {
			cx.removeChild(cx.firstChild);
		}

		//generate table
		let $tbl = document.createElement('table');
		$tbl.setAttribute('id', 'board');
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
			cells.push(cell);
		});
		return cells;
	}

	const _match3 = function(x, y, z) {
		let cells = _getCellList();
		let cellsText = cells.map(cell => cell.textContent);
		let match = cellsText[x] != "" 
			&& cellsText[x] === cellsText[y] 
			&& cellsText[x] === cellsText[z];

		return match;
	}

	const _addMatchedClass = function(cellsArray) {
		let cells = _getCellList();
		cellsArray.forEach(i => cells[i].classList.add('match'));
	}

	const _isFull = function() {
		let cellsText = _getCellList().map(cell => cell.textContent);
		return !cellsText.includes("");
	}

	const init = function () {
		_render();
	}

	const isValidMove = function (node) {
		//Returns true if move at node is valid.
		if (node.firstChild.textContent === "") {
			return true;
		} else {
			return false;
		}
	}

	const getContext = function () {
		return cx;
	}

	const gameIsWon = function () {
		return possibleMatches.find(match => _match3(...match));
	}

	const applyMatchedClasses = function () {
		possibleMatches.map(match => {
			if (_match3(...match)) {
				_addMatchedClass(match);
			}
		});
	}

	const gameIsTied = function () {
		return _isFull();
	}

	const flash = function () {
		cx.firstChild.classList.add('tied');
		setTimeout(() => {
			cx.firstChild.classList.remove('tied');
			cx.firstChild.classList.add('fading');
		})
		setTimeout(() => {
			cx.firstChild.classList.remove('fading');
		}, 1000)
	}

	const mark = function(symbol, node) {
		node.firstChild.nodeValue = symbol;
	}

	getCellByNumber = function(n) {
		return _getCellList()[n];
	}

	return {
		mark,
		init,
		isValidMove,
		gameIsWon,
		gameIsTied,
		getContext,
		getCellByNumber,
		flash,
		applyMatchedClasses
	}
})();

const tictac = (() => {
	//Private
	let currentPlayer = 0;
	let players = [];
	let currentScore = 0;

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
			p1 = p1 === "" ? "Unnamed" : p1;
			p2 = p2 === "" ? "Unnamed" : p2;
			_addPlayer(p1, "X");
			_addPlayer(p2, "O");
		}
	}

	const nextTurn = function () {
		currentPlayer = currentPlayer ? 0 : 1;
	}

	const getCurrentPlayer = function () {
		return players[currentPlayer];
	}

	const getPlayers = function() {
		return players;
	}

	return {
		newGame,
		nextTurn,
		getCurrentPlayer,
		getPlayers
	}
})();

const hud = (() => {
	let score = 0;
	let $score = document.querySelector("#score");
	let $timer = document.querySelector("#timer");
	let $nextSymbol = document.querySelector("#next-symbol");

	let startTime = 0;
	const maxTime = 30000;
	let timerInterval = null;
	let running = false;

	const _updateTimer = function(fn) {
		if (timeIsOver()) {
			stopTimer();
			fn();
		}
		
		let currentTime = new Date(maxTime - (Date.now() - startTime));
		let timeString = currentTime.toISOString().slice(15,21);
		let $currentTime = document.createTextNode(timeString);
		
		$timer.removeChild($timer.firstChild);
		$timer.appendChild($currentTime);
	}

	const startTimer = function(fn) {
		startTime = Date.now();
		running = true;
		timerInterval = setInterval(() => _updateTimer(fn));
	}

	const stopTimer = function () {
		clearInterval(timerInterval);
		startTime = Date.now();
		running = false;
	}

	const timeIsRunning = function () {
		return running;
	}

	const timeIsOver = function() {
		return new Date(maxTime - (Date.now() - startTime)) < 0;
	}

	//Public
	const addToScore = function (num) {
		score += num;
		$score.removeChild($score.firstChild);

		let $newScore = document.createTextNode(score.toString());
		$score.appendChild($newScore);
	}
	
	const updateNextSymbol = function(symbol) {
		$nextSymbol.removeChild($nextSymbol.firstChild);
	
		let $newSymbol = document.createTextNode(symbol);
		$nextSymbol.appendChild($newSymbol);
	}

	return {
		addToScore,
		startTimer,
		stopTimer,
		timeIsRunning,
		timeIsOver,
		updateNextSymbol
	}
})();

const keys = {
	"Numpad7": 0,
	"Numpad8": 1,
	"Numpad9": 2,
	"Numpad4": 3,
	"Numpad5": 4,
	"Numpad6": 5,
	"Numpad1": 6,
	"Numpad2": 7,
	"Numpad3": 8
}

let round = 0;

gameboard.init();
tictac.newGame();

gameboard.getContext().addEventListener("click", (e) => makeMove(e.target));
document.addEventListener("keydown", (e) => {
	const cellNumber = keys[e.code];
	if (cellNumber === undefined) {
		return false;
	}
	makeMove(gameboard.getCellByNumber(cellNumber));
});

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function coinFlip() {
	return Math.random() < 0.5;
}

function gameOver() {
	console.log('game over');
}

function makeMove(node) {
	if (node.tagName != 'TD') {
		return false;
	}

	if (!hud.timeIsRunning()) {
		hud.startTimer(gameOver);
	}

	const symbol = tictac.getCurrentPlayer().symbol;
	
	if (gameboard.isValidMove(node)) {
		gameboard.mark(symbol, node);
		tictac.nextTurn();
		hud.updateNextSymbol(tictac.getCurrentPlayer().symbol);
	}
	
	if (gameboard.gameIsWon()) {
		hud.stopTimer();
		gameboard.applyMatchedClasses();
	} else if (gameboard.gameIsTied()) {
		gameboard.init();
		gameboard.flash();
		tictac.newGame();
		hud.addToScore(1);
		round++;

		//Place random symbol on board.
		const randomCell = getRandomInt(8);
		const coin = coinFlip();
		let randomSymbol = tictac.getPlayers()[coin ? 0 : 1].symbol;
		gameboard.mark(randomSymbol, gameboard.getCellByNumber(randomCell))
		
		if (round > 2) {
			//Place additional random symbol on board.
			let randomSymbol = tictac.getPlayers()[!coin ? 0 : 1].symbol;
			let randomCell2 = getRandomInt(8);
			//if same as first random cell, add random number up to 7.
			if (randomCell == randomCell2) {
				randomCell2 = randomCell2 + Math.floor(Math.random() * 7) % 8;
			}
			gameboard.mark(randomSymbol, gameboard.getCellByNumber(randomCell2))
		}
	}
};