const {WebSocketServer} = require("ws");
const jwt = require("jsonwebtoken");
const { AUTH_SECRET } = require("./authMiddleware");
const { GamesModel } = require("./models");

const wss = new WebSocketServer({
    port: 3001
});

let users = [];
let rooms = {
};

let ctr = 1;
wss.on("connection", (ws) => {
    const id = ctr;
    ctr = ctr + 1;
    users.push({
        id: id,
        ws: ws,
    });
    
    ws.on("message", async (data) => {
        const parsedData = JSON.parse(data);

        if (parsedData.type === "authenticate") {
            const token = parsedData.payload.token;
            try {
                const { userId } = jwt.verify(token, AUTH_SECRET)
                const user = users.find(user => user.id === id);
                user.dbUserId = userId;
            } catch(e) {
                console.log(e);
                ws.close();
            }
        }

        if (parsedData.type === "make_move") {
            console.log(JSON.stringify(users));
            const coordinates = parsedData.payload.coordinates;
            const roomId = parsedData.payload.roomId;
            const x = coordinates.x;
            const y = coordinates.y;

            if (!rooms[roomId]) {
                const gameDb = await GamesModel.findOne({
                    _id: roomId
                });
                if (!gameDb) {
                    return;
                }
                rooms[roomId] = {
                    player1: gameDb.player1.toString(),
                    player2: gameDb.player2.toString(),
                    gameBoard: [
                        [0, 0, 0], 
                        [0, 0, 0], 
                        [0, 0, 0]
                    ],
                    moveCount: 0
                }
                
            }

            const user = users.find(user => user.id === id);

            if (x > 2 || y > 2 || x < 0 || y < 0) {
                return;
            }


            if (rooms[roomId].gameBoard[x][y] !== 0) {
                return;
            }


            if (rooms[roomId].moveCount % 2 == 0 && user.dbUserId === rooms[roomId].player2) {
                return;
            }

            if (rooms[roomId].moveCount % 2 == 1 && user.dbUserId === rooms[roomId].player1) {
                return;
            }


            const currentGame = await GamesModel.findOne({
                _id: roomId
            });
            currentGame.moves.push({
                x, y
            })
            await currentGame.save();

            console.log(user.dbUserId);
            console.log(rooms[roomId].player1);
            if (user.dbUserId === rooms[roomId].player1) {
                rooms[roomId].gameBoard[x][y] = "o"
                rooms[roomId].moveCount++;
                const otherPlayer = rooms[roomId].player2;
                const otherUser = users.find(user => user.dbUserId === otherPlayer);
                otherUser.ws.send(JSON.stringify(parsedData))

            } else {
                rooms[roomId].gameBoard[x][y] = "x"
                const otherPlayer = rooms[roomId].player1;
                rooms[roomId].moveCount++;
                const otherUser = users.find(user => user.dbUserId === otherPlayer);
                otherUser.ws.send(JSON.stringify(parsedData))
            }
            console.log(JSON.stringify(rooms));
            
            // win/lose logic
            let playerWon = null;

            // logic
            const board = rooms[roomId].gameBoard;
            if (board[0][0] === "x" && board[0][1] === "x" && board[0][2] === "x") {
                playerWon = rooms[roomId].player2
            }
            if (board[0][0] === "o" && board[0][1] === "o" && board[0][2] === "o") {
                playerWon = rooms[roomId].player1
            }

            if (playerWon) {
                const player1 = rooms[roomId].player1;
                const player2 = rooms[roomId].player2;
                let user1 = users.find(u => u.dbUserId === player1)
                let user2 = users.find(u => u.dbUserId === player2)
                
                user1.ws.send("Game has ended, winner is " + playerWon)
                user2.ws.send("Game has ended, winner is " + playerWon)
            }
        }
    })
});


