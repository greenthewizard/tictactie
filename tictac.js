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
		getCurrentPlayer
	}
})();

const hud = (() => {
	let score = 0;
	let $score = document.querySelector("#score");
	let $timer = document.querySelector("#timer");
	let $nextSymbol = document.querySelector("#next-symbol");

	let timer = null;
	let startTime = 0;
	let endTime = 0;
	let timerInterval = null;
	let started = false;

	const _updateTimer = function () {
		let currentTime = new Date(Date.now() - startTime);
		let timeString = currentTime.toISOString().slice(15,21);
		let $currentTime = document.createTextNode(timeString);
		
		$timer.removeChild($timer.firstChild);
		$timer.appendChild($currentTime);
	}

	const startTimer = function () {
		startTime = Date.now();
		timerInterval = setInterval(_updateTimer);
		started = true;
	}

	const stopTimer = function () {
		clearInterval(timerInterval);
		endTime = Date.now();
		started = false;
	}

	const timeIsStarted = function () {
		return started;
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
		timeIsStarted,
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

function makeMove(node) {
	if (node.tagName != 'TD') {
		return false;
	}

	if (!hud.timeIsStarted()) {
		hud.startTimer();
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
		const randomCell = Math.floor(Math.random() * 8);
		gameboard.init();
		gameboard.flash();
		//Place random symbol on board.
		gameboard.mark(symbol, gameboard.getCellByNumber(randomCell))
		tictac.newGame();
		hud.addToScore(1);
	}
};