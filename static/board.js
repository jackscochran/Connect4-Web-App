class App extends React.Component {

    render() {
        return (
            <div>
                <h1>CONNECT 4</h1>
                <Board />
            </div>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPlayer: 2,
            canMakeMove: true,
            difficulty: 4,
            frozen: false,
            gameMode: 1,
            message: "Let's play!",
            topRow: [0, 0, 0, 0, 0, 0, 0] //for animation
            ,
            board: [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ],

        }
    }

    //------------GAME LOGIC -----------//
    takeTurn = (col) => {
        if (this.state.frozen) {
            return
        }

        if (!this.state.canMakeMove) {
            return
        }

        if (col.length == 2) {
            col = String(col).split("")[0];
        }

        var player = this.state.currentPlayer;
        var board = this.state.board;

        if (this.makeMove(col, player, board)) {//player won
            return;
        };

        var newPlayer = player == 1 ? 2 : 1;


        switch (this.state.gameMode) {
            case 1: //minimax
                this.minimax(newPlayer, board);
                newPlayer = player;
                break;

            case 2: //database
                break;

            default: //2-v-2
                break;
        }

        this.setState({
            board: board,
            currentPlayer: newPlayer
        })

        this.displayTopChip(col, newPlayer);
    }

    makeMove(col, player, board) {


        if (board[col][0] != 0) {
            return false //row full
        }

        for (var r = 1; r < 6; r++) {
            if (board[col][r] != 0) {
                board[col][r - 1] = player;
                break
            } else if (r == 5) {
                board[col][5] = player;
            }
        }

        //check for winner
        var winner = this.winner();

        if (winner != 0) {
            var winner = player == 1 ? 'red' : 'yellow';
            this.setState({ message: `Congrats ${winner} player!` })

            setTimeout(() => { //reset after 2 seconds
                this.resetBoard(winner);
            }, 500)

            return true;
        }

        return false;
    }

    minimax = (player, board) => {
        this.setState({
            message: "Let me think...",
            canMakeMove: false
        })

        fetch('/minimax', {
            method: "POST",
            body: JSON.stringify({
                player: player,
                board: board,
                difficulty: this.state.difficulty
            })
        }).then(response => response.json())
            .then(moveData => {

                if (this.makeMove(moveData["move"], player, board)) {
                    this.setState({
                        message: "Better Luck next Time!",
                    })
                } else {
                    this.setState({
                        message: moveData['message'],
                        canMakeMove: true
                    })
                }

            })

    }

    switchStarter = () => {
        var currentPlayer = this.state.currentPlayer == 1 ? 2 : 1
        var board = this.state.board;
        if(this.gameMode == 0){
            this.setState({currentPlayer: currentPlayer });
        }else{

            this.minimax(currentPlayer, board);
            this.setState({
                board: board
            })
        }
    }

    resetBoard = (winner) => {
        this.clearTopRow()
        this.setState({ frozen: true })
        var loser = winner == "red" ? "rgb(255, 211, 0)" : "rgb(226, 37, 43)";
        var winner = winner == "red" ? "rgb(226, 37, 43)" : "rgb(255, 211, 0)";

        $(`.chip[style*='background-color: ${loser}'`).addClass("drop-chips");

        //clear board halfway through animation
        setTimeout(() => {
            $(`.chip[style*='background-color: ${winner}'`).addClass("drop-chips");

        }, 2000);

        //allow interaction after full animation
        setTimeout(() => {

            $(".chip").removeClass("drop-chips");
            $(`.chip[style*='background-color: ${loser}'`).addClass("raise-chips");
            $(`.chip[style*='background-color: ${winner}'`).addClass("raise-chips");
            this.setState({ message: "Let's Play!", canMakeMove: true })
            this.setState(
                {
                    board: [
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0]
                    ]
                }
            )
            this.setState({ frozen: false })
        }, 4000);

        setTimeout(() => {
            $(".chip").removeClass("raise-chips");

        }, 6000);
    }

    winner = () => {
        var board = this.state.board,
            width = board.length,
            height = board[0].length;

        for (var c = 0; c < width; c++) {
            for (var r = 0; r < height; r++) {
                const player = board[c][r];

                if (player == 0) { continue; }// don't check empty slots

                //look right
                if (c + 3 < width &&
                    player == board[c + 1][r] &&
                    player == board[c + 2][r] &&
                    player == board[c + 3][r]) {
                    return player
                }

                if (r + 3 < height) {
                    if ( //look down
                        player == board[c][r + 1] &&
                        player == board[c][r + 2] &&
                        player == board[c][r + 3]) {
                        return player;
                    }
                    if ( //look down and right
                        player == board[c + 1][r + 1] &&
                        player == board[c + 2][r + 2] &&
                        player == board[c + 3][r + 3]) {
                        return player;
                    }
                    if (c - 3 >= 0 && //look down and left
                        player == board[c - 1][r + 1] &&
                        player == board[c - 2][r + 2] &&
                        player == board[c - 3][r + 3]) {
                        return player;
                    }
                }
            }
        }

        return 0 //no winner yet 
    }

    increaseDifficulty = () => {
        const max_diff = 7

        var difficulty = this.state.difficulty;
        
        $(".arrow")[0].style.color = "black"
        if(difficulty < max_diff){
            
            this.setState({
                difficulty: difficulty + 1
            })
        }

        if (difficulty == max_diff - 1){
            $(".arrow")[1].style.color = "white"
        }
    }

    decreaseDiffculty = () => {

        const max_diff = 7

        var difficulty = this.state.difficulty;
        
        $(".arrow")[1].style.color = "black"
        if(difficulty > 1){
            
            this.setState({
                difficulty: difficulty -1
            })
        }

        if (difficulty == 2){
            $(".arrow")[0].style.color = "white"
        }
    }
    
    changeGamemode = () => {
        var gamemode = this.state.gameMode == 0 ? 1 : 0;
        if(gamemode == 0){
            $(".difficulty-display").hide();
        }else{
            $(".difficulty-display").show();
        }

        this.setState({
            gameMode: gamemode
        })
    }


    //-----------GRAPHICS--------------//

    emphasizeColumn = (id) => {
        if (this.state.frozen) {
            return;
        }

        if (id.length == 2) {
            id = String(id).split("")[0];
        }

        this.displayTopChip([id], this.state.currentPlayer)
    }

    displayTopChip = ([...columns], player) => {
        var row = [0, 0, 0, 0, 0, 0, 0];
        columns.forEach(function (val) {
            row[val] = player;
        })

        this.setState({
            topRow: row
        })
    }

    clearTopRow = () => {
        if (this.state.frozen) {
            return;
        }
        this.displayTopChip([0], 0);
    }

    renderBoard() {
        let pieces = [];

        for (var r = 0; r < 6; r++) {
            for (var c = 0; c < 7; c++) {
                pieces.push(<ChipSpot emphasizeColumn={this.emphasizeColumn} classes="board-item disable-select" id={String(c) + String(r)} key={String(c) + String(r)} player={this.state.board[c][r]} takeTurn={this.takeTurn} />)
            }
        }

        for (var i = 1; i <= 7; i++) {
            pieces.push(<div className="board-item bottom disable-select"></div>)
        }

        return pieces;
    }

    renderTopRow() {
        let pieces = []

        for (var i = 0; i <= 6; i++) {
            pieces.push(<ChipSpot emphasizeColumn={this.emphasizeColumn} id={i} classes="board-item top" key={i} player={this.state.topRow[i]} takeTurn={this.takeTurn} />)
        }

        return pieces;
    }

    render() {
        return (
            <div className="grid-x">
                <div className="cell large-7 small-12" onMouseLeave={this.clearTopRow}>
                    <div className="board-container">
                        <div className="grid top-row">
                            {this.renderTopRow()}
                        </div>
                        <div className="grid board">
                            {this.renderBoard()}
                        </div>
                    </div>
                </div>
                <div className="cell large-4 small-12 message-board">
                    <div className="message green-background">{this.state.message}</div>

                    <button className="button large secondary game-option" onClick={this.changeGamemode}>Change Gamemode</button>
                    <button className="button large secondary game-option" onClick={this.switchStarter}>Let other player start</button>

                    <div className="difficulty-display">
                        <div className="difficulty">
                            <span className="arrow" onClick={this.decreaseDiffculty}>&#9664;&#xFE0E;</span>  {this.state.difficulty}  <span className="arrow" onClick={this.increaseDifficulty}>&#9654;&#xFE0E;</span>
                            <h2>DIFFICULTY</h2>
                            <h4><small>How many moves ahead the algorithm thinks</small></h4>
                        </div>

                    </div>
                </div>

            </div>
        )
    }
}

class ChipSpot extends React.Component {

    constructor(props) {
        super(props);

    }

    renderChip = () => {
        var color;
        var shadow = ""
        if (this.props.player == 2) {
            color = "rgb(255, 211, 0)"; //rgb(255, 211, 0);
            shadow = '3px -2px 1px rgba(0,0,0,0.6)';
        } else if (this.props.player == 1) {
            color = "rgb(226, 37, 43)"; //rgb(226, 37, 43);
            shadow = '3px -2px 1px rgba(0,0,0,0.6)';
        } else {
            color = "white"
        }

        if (this.props.classes.split(" ").length != 3) {//includes top class
            shadow = "";
        }

        return {
            backgroundColor: color,
            boxShadow: shadow
        }
    }

    render() {
        return (
            <div className={this.props.classes} id={this.props.id}>
                <div className="chip" style={this.renderChip()} onMouseEnter={this.props.emphasizeColumn.bind(this, this.props.id)} onClick={this.props.takeTurn.bind(this, this.props.id)}></div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.querySelector("#app"));
