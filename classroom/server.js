const express = require("express");
const app = express();
const users = require("./routes/user");
const posts = require("./routes/post");
const cookieParser = require("cookie-parser");

app.get("/get-cookies", (req, res) => {
  res.cookie("greet", "Hello, World!");
  res.send("Cookie has been set!");
});

app.get("/", (req, res) => {
  console.dir(req.cookies);
  res.send("Welcome to the Classroom Server!");
});

app.use("/users", users);
app.use("/posts", posts);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
