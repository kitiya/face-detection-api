const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt-nodejs");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
  users: [
    {
      id: "101",
      name: "John",
      email: "john@gmail.com",
      password: "cookies",
      entries: 3,
      joined: new Date()
    },
    {
      id: "102",
      name: "Salley",
      email: "sally@gmail.com",
      password: "banana",
      entries: 5,
      joined: new Date()
    }
  ]
};

// /root --> GET
app.get("/", (req, res) => {
  res.send(database.users);
});

// /sign in --> POST == success/fail
app.post("/signin", (req, res) => {
  /*
  // Load hash from your password DB.
  bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
  });
  bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
  });
  */
  console.log(req.body);

  if (
    req.body.email === database.users[0].email &&
    req.body.password === database.users[0].password
  ) {
    res.json(database.users[0]);
    // res.json("success");
    // console.log("success");
  } else {
    res.json("error logging in");
    // console.log("failed");
  }
});

// /register --> POST = user
app.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  bcrypt.hash(password, null, null, function(err, hash) {
    console.log(hash);
  });

  database.users.push({
    id: Number(database.users[database.users.length - 1].id) + 1,
    name: name,
    email: email,
    password: password,
    entries: 0,
    joined: new Date()
  });
  res.json(database.users[database.users.length - 1]);
});

// /profile/:userId --> GET = user
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  database.users.map(user => {
    if (user.id === id) {
      return res.json(user);
    }
  });
  res.status(404).json("no such user");
});

// /image --> PUT == user
app.put("/image", (req, res) => {
  console.log("request", req.body);
  let found = false;
  const { id } = req.body;
  database.users.map(user => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(404).json("no such user");
  }
});

app.listen(3001, () => {
  console.log("App is running on port 3001");
});
