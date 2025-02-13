require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
// const listingSchema = require("./schema_joi.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", engine);

const dbUrl = process.env.ATLASDB_URL;
// const dbUrl2 = "mongodb://localhost:27017/wanderlust";

main().catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to DB");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

const store = MongoStore.create({
  //method to creat ney mongo store
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 36000 * 24,
});

store.on("error", (err) => {
  console.log("Error is :->", err);
});

const sess = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpsOnly: true,
  },
};

app.use(session(sess));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //I must write 5 lines of code and use 3 packages for authentication

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); //success in an array
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; //I can't use req.user directly in the EJS template, so I saved it in locals, and for access, I just need to use currentUser.
  next();
});


app.get("/", (req, res) => {
  res.render("listing/landing-page.ejs");
});

app.use("/listing", listings);
app.use("/listing/:id/reviews", reviews);
app.use("/", user);

app.get("/listing/filter/:category", async (req, res) => {
  let { category } = req.params;
  let alllisting = await Listing.find({ category: category });
  res.render("listing/home.ejs", { alllisting: alllisting });
});

app.post("/listing/search/", async (req, res) => {
  let { title } = req.body.listingss;
  console.log(req.body.listingss);
  let alllisting = await Listing.find({ $or: [{ title: { $regex: title, $options: "i" } }] });
  res.render("listing/home.ejs", { alllisting: alllisting });
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "ERROR, PAGE NOT FOUND")); //This is mandatory; this error-handling code must be written in every server.
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error/error.ejs", { message, status });
});

let port = process.env.PORT || 3000;  


app.listen(port, () => {
  console.log(`listening at ${port}`);
});
