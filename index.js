const jwt = require("jsonwebtoken");
const { GamesModel, UserModel } = require("./models");
const { SignupSchema, SigninSchema } = require("./types");
const express = require("express");
const { AUTH_SECRET, middleware } = require("./authMiddleware");

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    const {success, data} = SignupSchema.safeParse(req.body);

    if (!success) {
        res.status(411).json({
            message: "Incorrect inputs"
        })
        return
    }

    const user = await UserModel.create({
        username: data.username,
        password: data.password
    })

    res.json({
        id: user._id
    })

});

app.post("/signin", async(req, res) => {
    const {success, data} = SigninSchema.safeParse(req.body);

    if (!success) {
        return re.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await UserModel.findOne({
        username: data.username,
        password: data.password
    });

    const token = jwt.sign({
        userId: user._id
    }, AUTH_SECRET);

    res.json({
        token
    })

})

app.post("/room", middleware, async (req, res) => {
    console.log(req.userId);
    const room = await GamesModel.create({
        title: req.body.title,
        player1: req.userId,
        moves: []
    })
    res.json({
        id: room._id
    })
})

app.post("/join", middleware, async (req, res) => {
    const room = await GamesModel.findOne({
        _id: req.body.id
    });

    if (room.player2 || room.player1 === req.userId) {
        return res.status(403).json({
            message: "Player 2 already joined this room"
        });
    }
    room.player2 = req.userId;
    await room.save();
    res.json({
        message: "You have joined room " + req.body.id
    })
})

app.listen(3000);