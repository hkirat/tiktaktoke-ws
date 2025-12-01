const jwt = require("jsonwebtoken");
const { GamesModel, UserModel } = require("./models");
const { SignupSchema, SigninSchema } = require("./types");
const express = require("express");
const { AUTH_SECRET } = require("./authMiddleware");



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

    const user = UserModel.findOne({
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

app.post("/room", (req, res) => {

})

app.post("/join", (req, res) => {
    
})

app.listen(3000);