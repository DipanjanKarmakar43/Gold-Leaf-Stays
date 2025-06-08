const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const app = express();
const users = require("./routes/user");
const posts = require("./routes/post");

const sessionOptions = {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

app.use(express.json());

app.use("/users", users);
app.use("/posts", posts);

app.get("/register", (req, res) => {
  let { name = "Anonymous" } = req.query;
  req.session.name = name;
  req.flash("success", "user registered successfully");
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  res.render("page.ejs", { name: req.session.name , msg: req.flash("success") });
});

app.get("/test", (req, res) => {
  res.send("test successful!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
