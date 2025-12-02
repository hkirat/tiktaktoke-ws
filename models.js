const mongoose = require("mongoose");
mongoose.connect("");
const UserSchema = new mongoose.Schema({

    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

const GamesSchema = new mongoose.Schema({
    title: {type: String, required: true},
    player1: {type: mongoose.Types.ObjectId, ref: "users", required: true},
    player2: {type: mongoose.Types.ObjectId, ref: "users"},
    moves: [{
        x: Number,
        y: Number,
    }],
    size: Number,
    winner: { type: mongoose.Types.ObjectId },
    status: String 
})


const UserModel = mongoose.model("users", UserSchema);
const GamesModel = mongoose.model("games", GamesSchema);

module.exports = {
    UserModel: UserModel,
    GamesModel: GamesModel
}