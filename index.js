const express = require("express");
const app = express();
const mongoose = require("mongoose")
const cors = require('cors')
var objectId = require('mongoose').Types.ObjectId;

app.use(cors());
app.use(express.json());

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://mongoose:test@cluster0.ir5gjii.mongodb.net/todo?retryWrites=true&w=majority")
.then(() => console.log("Database connection successful")).catch(() => console.log("error"))

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
  });

const User = mongoose.model("User", userSchema);

const todoSchema = {
    userId: String,
    todos: [
        {
            checked: Boolean,
            text: String,
        }
    ]
};


const Todos = mongoose.model("Todos", todoSchema);

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).exec();
    
    if (username == 0 || password == 0) {
        res.status(500)
        res.json({
            message: 'please fill the form'
        })
        return;
    }

    if (user) {
        res.status(500)
        res.json({
            message: 'invalid username, already exists...'
        })
        return;
    }

    await User.create({ username, password });
    res.json({
      message: "success",
    });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ username }).exec();
    
    if (username == 0 || password == 0) {
        res.status(500)
        res.json({
            message: 'please fill the form'
        })
        return;
    }

    if (!user || user.password !== password ) {
        res.status(401)
        res.json({
            message: 'please register'
        })
        return;
    }

    res.json({
      message: "success",
    });
});

app.post("/todos", async (req, res) => {
    const { authorization } = req.headers;
    const [, token] = authorization.split(" ");
    const [username, password] = token.split(":");
    const todosItems = req.body;
    const user = await User.findOne({ username }).exec();
    if (!user || user.password !== password) {
      res.status(403);
      res.json({
        message: "invalid access",
      });
      return;
    }
    const todos = await Todos.findOne({ userId: new objectId(user._id) }).exec();
    if (!todos) {
      await Todos.create({
        userId: user._id,
        todos: todosItems,
      });
    } else {
      todos.todos = todosItems;
      await todos.save();
    }
    res.json(todosItems);
  });

app.listen(3000, function() {
    console.log("listening on 3K...");
})