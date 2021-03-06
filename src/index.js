import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  const classes = props.highlight ? 'square highlighted' : 'square';
  return (
    <button
      className={ classes }
      onClick={ props.onClick }
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        highlight={this.props.highlighted.includes(i)}
        onClick={ () => this.props.onClick(i) }
      />
    );
  }

  render() {
    let rows = [];
    let i = 0;
    for (let r = 0; r < 3; r++) {
      let cols = [];
      for (let c = 0; c < 3; c++) {
        cols.push(this.renderSquare(i));
        i++;
      }
      rows.push(
        <div className="board-row" key={r}>
          {cols}
        </div>);
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      sortIsAscending: true,
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if ( calculateWinner(squares) || squares[i] ) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    const col = Math.floor(i / 3) + 1;
    const row = (i % 3) + 1;
    this.setState({
      history: history.concat([{
        squares: squares,
        coordinates: {
          col: col,
          row: row,
        },
        symbol: squares[i],
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleSorting() {
    this.setState({ sortIsAscending: !this.state.sortIsAscending });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerMove = calculateWinner(current.squares);

    let moves = history.map( (step, move) => {
      let desc = 'Go to game start';
      if (move) {
        const col = step.coordinates.col;
        const row = step.coordinates.row;
        const symbol = step.symbol;
        desc = 'Go to move #' + move +
          ' ' + symbol + ' in (' + col + ' , ' + row  + ')';
      }
      return (
        <li key={move}>
          <button onClick={ () => this.jumpTo(move) }>
            {move === this.state.stepNumber ? <b>{desc}</b> : desc}
          </button>
        </li>
      );
    });

    let sortedMoves = <ol>{moves}</ol>;
    if (!this.state.sortIsAscending) {
      moves = moves.reverse();
      sortedMoves = <ol reversed>{moves}</ol>;
    }

    let status;
    let winnerLine = [];
    if (winnerMove) {
      if (winnerMove.draw) {
        status = 'Draw, no one wins';
      } else {
        status = 'Winner: ' + winnerMove.winner;
        winnerLine = winnerMove.line;
      }
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            highlighted={winnerLine}
            onClick={ (i) => this.handleClick(i) }
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div> History: </div>
          <button onClick={ () => this.toggleSorting() }>
            Toggle Sorting
          </button>
          {sortedMoves}
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  let draw = true;
  for (let i = 0; i < 9; i++) {
    if (squares[i] === null) {
      draw = false;
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: lines[i],
        draw: false,
      };
    }
  }
  if (draw) {
    return {
      draw: true,
      winner: null,
      line: null,
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
