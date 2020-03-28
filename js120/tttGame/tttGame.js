let readline = require("readline-sync");

class Square {
  static UNUSED_SQUARE = " ";
  static HUMAN_MARKER = "X";
  static COMPUTER_MARKER = "O";

  constructor(marker = Square.UNUSED_SQUARE) {
    this.marker = marker;
  }

  toString() {
    return this.marker;
  }

  setMarker(marker) {
    this.marker = marker;
  }

  isUnused() {
    return this.marker === Square.UNUSED_SQUARE;
  }

  getMarker() {
    return this.marker;
  }
}

class Board {
  constructor() {
    this.squares = {};
    for (let counter = 1; counter <= 9; ++counter) {
      this.squares[String(counter)] = new Square();
    }
  }

  display() {
    console.log("");
    console.log("     |     |");
    console.log(`  ${this.squares["1"]}  |  ${this.squares["2"]}  |  ${this.squares["3"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["4"]}  |  ${this.squares["5"]}  |  ${this.squares["6"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["7"]}  |  ${this.squares["8"]}  |  ${this.squares["9"]}`);
    console.log("     |     |");
    console.log("");
  }

  markSquareAt(key, marker) {
    this.squares[key].setMarker(marker);
  }

  isFull() {
    return this.unusedSquares().length === 0;
  }

  unusedSquares() {
    let keys = Object.keys(this.squares);
    return keys.filter(key => this.squares[key].isUnused());
  }

  countMarkersFor(player, keys) {
    let markers = keys.filter(key => {
      return this.squares[key].getMarker() === player.marker;
    });

    return markers.length;
  }

  displayWithClear() {
    console.clear();
    console.log("");
    console.log("");
    this.display();
  }
}

class Player {
  constructor(marker) {
    this.marker = marker;
  }

  getMarker() {
    return this.marker;
  }
}

class Human extends Player {
  constructor() {
    super(Square.HUMAN_MARKER);
  }
}

class Computer extends Player {
  constructor() {
    super(Square.COMPUTER_MARKER);
  }
}

class TTTGame {
  static POSSIBLE_WINNING_ROWS = [
    [ "1", "2", "3" ],            // top row of board
    [ "4", "5", "6" ],            // center row of board
    [ "7", "8", "9" ],            // bottom row of board
    [ "1", "4", "7" ],            // left column of board
    [ "2", "5", "8" ],            // middle column of board
    [ "3", "6", "9" ],            // right column of board
    [ "1", "5", "9" ],            // diagonal: top-left to bottom-right
    [ "3", "5", "7" ],            // diagonal: bottom-left to top-right
  ];

  static joinOr = function(arr, delimiter1 = ', ', delimiter2 = 'or') {
    if (arr.length === 1) return arr[0];

    let lastElement = arr[arr.length - 1];
    let restElements = arr.slice(0, -1).join(delimiter1);

    if (arr.length === 1) {
      return arr[0];
    } else if (arr.length === 2) {
      return `${arr[0]} ${delimiter2} ${lastElement}`;
    } else {
      return `${restElements}${delimiter1}${delimiter2} ${lastElement}`;
    }
  };

  constructor() {
    this.board = new Board();
    this.human = new Human();
    this.computer = new Computer();
    this.replay = false;
    this.score = {human: 0, computer: 0};
    this.firstPlayer = this.human;
    this.currentPlayer = this.human;
  }

  play() {
    this.displayWelcomeMessage();

    this.board.display();

    this.setCurrentPlayer();
    while (true) {
      this.currentPlayerMoves();
      if (this.endOfRound()) break;
      this.toggleCurrentPlayer();

      this.board.displayWithClear();
    }

    this.board.displayWithClear();
    this.updateScore();
    this.displayResults();

    if (!this.roundsRemaining() && this.playAgain()) {
      this.updateGameSettings();
      this.play();
    } else {
      this.displayGoodbyeMessage();
    }
  }

  updateGameSettings() {
    this.board = new Board();
    this.replay = true;
    this.toggleFirstPlayer();
  }

  winningThreat(player, opponent) {
    let threatRow;
    let board = this.board;

    TTTGame.POSSIBLE_WINNING_ROWS.forEach( function(row) {
      let playerCount = board.countMarkersFor(player, row);
      let opponentCount = board.countMarkersFor(opponent, row);

      if (opponentCount === 2 && playerCount === 0) {
        threatRow = row;
      }
    });
    return threatRow;
  }

  playAgain() {
    let question = 'Would you like to play again?';
    let choice = this.prompt(question, ['y', 'n', 'Y', 'N']);

    return choice.toLowerCase() === 'y';
  }

  roundsRemaining() {
    return Object.values(this.score).some(roundsWon => roundsWon >= 3);
  }

  prompt(message, validChoices) {
    while (true) {
      let answer = readline.question(message + ' ');

      if (validChoices.includes(answer)) return answer;

      console.log("Sorry, that's not a valid answer.");
      console.log("");
    }
  }

  displayWelcomeMessage() {
    console.clear();
    if (!this.replay) {
      console.log("Welcome to Tic Tac Toe!");
    }
    console.log("");
    console.log("");
  }

  displayGoodbyeMessage() {
    if (this.isGameWinner(this.human)) {
      console.log("Congratulations, you have won the game!!!!");
    } else if (this.isGameWinner(this.computer)) {
      console.log("The computer has won the game.");
    }
    console.log("Thanks for playing Tic Tac Toe! Goodbye!");
  }

  displayResults() {
    if (this.isRoundWinner(this.human)) {
      console.log("You won this round! Congratulations!");
    } else if (this.isRoundWinner(this.computer)) {
      console.log("I won! I won! Take that, human!");
    } else {
      console.log("A tie game. How boring.");
    }
    console.log('Computer Rounds wins: ' +  this.score.computer);
    console.log('Your Rounds wins: ' + this.score.human);
  }

  updateScore() {
    if (this.isRoundWinner(this.human)) {
      this.score.human += 1;
    } else if (this.isRoundWinner(this.computer)) {
      this.score.computer += 1;
    }
  }

  currentPlayerMoves() {
    if (this.currentPlayer === this.human)  {
      this.humanMoves();
    } else {
      this.computerMoves();
    }
  }

  toggleCurrentPlayer() {
    if (this.currentPlayer === this.human) {
      this.currentPlayer = this.computer;
    } else {
      this.currentPlayer = this.human;
    }
  }

  toggleFirstPlayer() {
    if (this.firstPlayer === this.human) {
      this.firstPlayer = this.computer;
    } else {
      this.firstPlayer = this.human;
    }
  }

  setCurrentPlayer() {
    this.currentPlayer = this.firstPlayer;
  }

  humanMoves() {
    let validChoices = this.board.unusedSquares();
    const chooseMessage = `Choose a square (${TTTGame.joinOr(validChoices)}):`;
    let choice = this.prompt(chooseMessage, validChoices);

    this.board.markSquareAt(choice, this.human.getMarker());
  }

  computerMoves() {
    let validChoices = this.board.unusedSquares();
    let choice;
    let opportunityRow = this.winningThreat(this.human, this.computer);
    let threatRow = this.winningThreat(this.computer, this.human);

    if (opportunityRow) {
      choice = this.strategicSquare(opportunityRow);
    } else if (threatRow) {
      choice = this.strategicSquare(threatRow);
    } else if (validChoices.includes('5')) {
      choice = '5';
    } else {
      do {
        choice = Math.floor((9 * Math.random()) + 1).toString();
      } while (!validChoices.includes(choice));
    }

    this.board.markSquareAt(choice, this.computer.getMarker());
  }

  strategicSquare(row) {
    let validChoices = this.board.unusedSquares();
    for (let index = 0; index < row.length; index++) {
      if (validChoices.includes(row[index])) return row[index];
    }

    return undefined;
  }

  endOfRound() {
    return this.board.isFull() || this.someoneWon();
  }

  someoneWon() {
    return this.isRoundWinner(this.human) || this.isRoundWinner(this.computer);
  }

  isRoundWinner(player) {
    return TTTGame.POSSIBLE_WINNING_ROWS.some(row => {
      return this.board.countMarkersFor(player, row) === 3;
    });
  }

  isGameWinner(player) {
    player = player.constructor.name.toLowerCase();
    return this.score[player] >= 3;
  }
}

let game = new TTTGame();
game.play();