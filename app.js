if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError.js");

const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/bookings.js");

// Render (and most hosts) run behind a proxy. Needed for secure cookies.
app.set("trust proxy", 1);

// ========================================
// ENVIRONMENT VARIABLES
// ========================================

// trim() removes stray spaces/newlines, replace() removes wrapping quotes
const dbUrl = (process.env.ATLASDB_URL || "")
  .trim()
  .replace(/^["']|["']$/g, "");

const sessionSecret = (process.env.SECRET || "").trim();

// TEMPORARY DEBUG LOG: remove after the deploy works.
// Prints only the length and first 14 characters, never the password.
console.log(
  "DB URL length:",
  dbUrl.length,
  "| starts with:",
  JSON.stringify(dbUrl.slice(0, 14)),
);

if (!dbUrl || !/^mongodb(\+srv)?:\/\//.test(dbUrl)) {
  throw new Error(
    "ATLASDB_URL is missing or invalid. Set a valid MongoDB URI in Render Environment Variables.",
  );
}

if (!sessionSecret) {
  throw new Error(
    "SECRET is missing. Set a session secret in your environment variables.",
  );
}

// ========================================
// VIEW ENGINE
// ========================================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

// ========================================
// SESSION STORE
// ========================================

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: sessionSecret,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("MongoDB session store error:", err.message);
});

const sessionOptions = {
  store: store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ========================================
// PASSPORT AUTHENTICATION
// ========================================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ========================================
// FLASH MESSAGES AND CURRENT USER
// ========================================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ========================================
// ROUTES
// ========================================

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", bookingRouter);

// HOME PAGE
app.get("/", (req, res) => {
  res.render("home");
});

// ========================================
// 404 ERROR HANDLER
// ========================================

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (!err.message) {
    err.message = "Something went wrong!";
  }

  res.status(statusCode).render("error", { err });
});

// ========================================
// CONNECT TO MONGODB AND START SERVER
// ========================================

async function startServer() {
  try {
    await mongoose.connect(dbUrl);

    console.log("Connected to MongoDB Atlas");

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Gold-Leaf-Stays server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start application:", err.message);
    process.exit(1);
  }
}

startServer();
