const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt-nodejs");
const knex = require("knex");

// run the knex() function
const db = knex({
  client: "pg", // pg: PostgreSQL
  connection: {
    host: "127.0.0.1",
    user: "wara",
    password: "",
    database: "face-detection"
  }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

// /root --> GET
app.get("/", (req, res) => {
  // res.send(db.users);
});

// /sign in --> POST == success/fail
app.post("/signin", (req, res) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then(data => {
      const isValidPassword = bcrypt.compareSync(
        req.body.password,
        data[0].hash
      );

      if (isValidPassword) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then(user => res.json(user[0]))
          .catch(err => res.status(400).json("unable to get user"));
      } else {
        res.status(400).json("incorrect email or password");
      }
    })
    .catch(err => res.status(400).json("wrong credentials"));
});

// /register --> POST = user
app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);

  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into("login")
      .returning("email")
      .then(loginEmail => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => res.json(user[0]));
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(err => res.status(400).json(err));
});

// /profile/:userId --> GET = user
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then(user => {
      console.log(user[0]);

      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("not found");
      }
    })
    .catch(err => res.status(400).json("error getting user"));
});

// /image --> PUT == user
app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(404).json("unable to get entries"));
});

app.listen(3010, () => {
  console.log("App is running on port 3010");
});
