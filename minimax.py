#board rating system
#center column: +3
#lines of two: +5
#lines of three: +15
#4 in a row: +1000
#opp line of two: -3
#opp winnable line of three: -700
import copy
import random
import math

#board scoring
four_line = 100
three_line = 10
two_line = 5
opp_three_line = -80
opp_two_line = 0

class MinimaxAI:

    def __init__(self, playerNumber, diff):
        self.piece = playerNumber
        self.opponent = 1 if playerNumber == 2 else 2
        self.difficulty = diff

    def scoreWindow(self, window):
        score = 0
        if window.count(self.piece) == 4:
            score += four_line
        if window.count(self.piece) == 3 and window.count(0) == 1:
            score += three_line
        if window.count(self.piece) == 2 and window.count(0) == 2:
            score += two_line
        if window.count(self.opponent) == 3 and window.count(0) == 1:
            score -= opp_three_line
        if window.count(self.opponent) == 2 and window.count(0) == 2:
            score -= opp_two_line

        return score

    def boardScore(self, board):
        score = 0
        #horizontal check
        for row in range(len(board[0])):
            for col in range(len(board)-3):
                window = [board[col][row], board[col+1][row], board[col+2][row], board[col+3][row]]
                score += self.scoreWindow(window)

        #vertical check
        for col in board:
            for row in range(len(board[0]) - 3):
                window = [col[row], col[row + 1], col[row + 2], col[row + 3]]
                score += self.scoreWindow(window)

        #diagonal check
        for col in range(len(board)-3):
            for row in range(len(board[0])-3):
                window = [board[col][row], board[col+1][row+1], board[col+2][row+2], board[col+2][row+2]]
                score += self.scoreWindow(window)
                window = [board[col][row+3], board[col+1][row+2]], board[col+2][row+1], board[col+3][row]
                score += self.scoreWindow(window)

        #middle check
        for row in board[3]:
            if row == self.piece:
                score += 5
        return score


    def isTerminalNode(self, boardObject):
        return boardObject.checkWinner(self.piece) or boardObject.checkWinner(self.opponent) or boardObject.isFull()

    def minimax(self, boardObject, depth, maximizingPlayer):
        validLocations = boardObject.validLocations()
        bestMove = random.choice(validLocations)

        if depth == 0 or self.isTerminalNode(boardObject):
            if boardObject.checkWinner(self.piece):
                return None, 100000000
            elif boardObject.checkWinner(self.opponent):
                return None, -100000000
            elif boardObject.isFull(): # tie game
                return None, 0
            else:
                return None, self.boardScore(boardObject.board)

        if maximizingPlayer:
            currentScore = -math.inf
            for location in validLocations:
                tempBoard = copy.deepcopy(boardObject)
                tempBoard.placeChip(location, self.piece)
                newScore = self.minimax(tempBoard, depth - 1, False)[1]
                if newScore > currentScore:
                    currentScore = newScore
                    bestMove = location

            return bestMove, currentScore

        else:
            currentScore = math.inf
            for location in validLocations:
                tempBoard = copy.deepcopy(boardObject)
                tempBoard.placeChip(location, self.opponent)
                newScore = self.minimax(tempBoard, depth - 1, True)[1]
                if newScore < currentScore:
                    currentScore = newScore
                    bestMove = location

            return bestMove, currentScore

    def pickMove(self, boardObject):
        return self.minimax(boardObject, self.difficulty, True)

    def message(self, board_score):
        if board_score < opp_three_line:
            return "Finally, a worthy opponent"

        if board_score < opp_two_line:
            return "Not bad kid"

        if board_score < three_line * 2:
            return "God I love this game"

        if board_score < four_line / 2:
            return "I like where this is going"

        if board_score < four_line:
            return "I'm playing you like a fiddle"

        if board_score < four_line * 2:
            return "Sun's getting real low big guy"

        return "You might as well give up now"

        

