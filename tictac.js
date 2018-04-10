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

	const isValidMove = function (cx) {
		//Returns true if move at node is valid.
		if (cx.target.firstChild.textContent === "") {
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

	const mark = function(symbol, cx) {
		cx.target.firstChild.nodeValue = symbol;
	}

	return {
		mark,
		init,
		isValidMove,
		gameIsWon,
		gameIsTied,
		getContext,
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
			// let p2 = prompt("Player 2, what is your name?");
			// let p1 = prompt("Player 1, what is your name?");
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

	return {
		addToScore,
		startTimer,
		stopTimer,
		timeIsStarted
	}
})();

gameboard.init();
tictac.newGame();

gameboard.getContext().addEventListener("click", function(e) {
	if (e.target.tagName != 'TD') {
		return false;
	}

	if (!hud.timeIsStarted()) {
		hud.startTimer();
	}

	let symbol = tictac.getCurrentPlayer().symbol;
	let name = tictac.getCurrentPlayer().name;

	if (gameboard.isValidMove(e)) {
		gameboard.mark(symbol, e);

		} if (gameboard.gameIsWon()) {
			hud.stopTimer();
			gameboard.applyMatchedClasses();
		} else if (gameboard.gameIsTied()) {
			gameboard.init();
			gameboard.flash();
			tictac.newGame();
			hud.addToScore(1);
		} else {
			tictac.nextTurn();
		}
});