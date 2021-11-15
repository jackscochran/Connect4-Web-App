from board import Board 
from minimax import MinimaxAI

import flask

import json



# ------------------- APP CONFIG -------------------#

app = flask.Flask(__name__)

app.config["TEMPLATES_AUTO_RELOAD"] = True


# ------------------- PAGE ROUTES ---------------- #

@app.route('/')
def index():
    return flask.render_template('board.html')


# ------------------- API ROUTES ---------------- #

@app.route('/minimax', methods=['POST'])
def minimax():
    if flask.request.method == 'POST':
        
        moveData = json.loads(flask.request.data)

        ai = MinimaxAI(moveData["player"], moveData["difficulty"])
        current_board = Board(moveData["board"])
        move = ai.pickMove(current_board)
        return flask.jsonify({
            "move": move[0],
            "boardScore": move[1],
            "message": ai.message(move[1])})

    return flask.jsonify({'error': True})

# ------------------- RUNNER FUNCTION ---------------- #

if __name__ == "__main__":
    app.run()