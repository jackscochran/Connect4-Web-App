import math

class Board:
    def __init__(self, board):
        self.board = board
        self.numOfCol = len(board)
        self.numOfRows = len(board[0])

    def validLocations(self):
        validLocations = []
        for col in range(self.numOfCol):
            if self.board[col][0] == 0:
                validLocations.append(col)

        return validLocations

    def isValid(self, column, row):
        if column >= 0 and column < self.numOfCol and row >= 0 and row < self.numOfRows:
            return True

        return False

    def isFull(self):
        full = True
        for c in self.board:
            if c[0] == 0:
                full = False

        return full

    def placeChip(self, column, player):

        if self.board[column][0] != 0:
            print("this column is full")
            return False

        else:
            counter = 0
            for cell in self.board[column]:
                if cell == 0:
                    counter+= 1
                    continue
            self.board[column][counter-1] = player
            return True

    def checkWinner(self, player):

        width = self.board.numOfCol
        height = self.board.numOfRows
        for c in range(width):
            for r in range(height):
                
                if player == 0 or self.board[c][r] != player: continue

                # look right
                if c + 3 < width and player == self.board[c+1][r] and player == self.board[c+2][r] and player == self.board[c+3][r]:
                    return True

                if r + 3 < height:
                    # look down
                    if player == self.board[c][r+1] and player == self.board[c][r+2] and player == self.board[c][r+3]:
                        return True

                    # look down and right
                    if player == self.board[c+1][r+1] and player == self.board[c+2][r+2] and player == self.board[c+3][r+3]:
                        return True
                    
                    # look down and left
                    if c - 3 >= 0 and player == self.board[c-1][r+1] and player == self.board[c-2][r+2] and player == self.board[c-3][r+3]:
                        return True

        return False

    def printBoard(self):
        for i in range(6):
            for j in range(7):
                print(round(self.board[j][i]), end = "  ")
            print()

    def centerColumn(self):
        return math.ceil(self.numOfCol/2) - 1



