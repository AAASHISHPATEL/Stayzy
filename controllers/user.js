const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const BASE_URL = process.env.BASE_URL;

module.exports.signUpForm = (req, res) => {
  res.render("authentication/signup.ejs");
};

module.exports.signUp = async (req, res) => {
  //ekhane demo user creat holo //ekhanesame username ar r akta user save jate na hoy tar o code lekhai ache bydefault
  try {
    let { username, email, password } = req.body; //User.save() ra bodole User.regir mathod passporte ar use holo password dea save korar jonno user k
    let newUser = new User({ email, username });
    let registorUser = await User.register(newUser, password); //equvalent to newUser.save()
    // console.log(registorUser);     ar output asbe DB te save hoya user ar object with username , email, salt, hash etc key value pair
    req.login(registorUser, () => {
      req.flash("success", "Login successful!");
      res.redirect(`/listing`);
    });
  } catch (error) {
    req.flash("error", "Username alredy exist");
    res.redirect(`/signup`);
  }
};

module.exports.logInForm = (req, res) => {
  res.render("authentication/login.ejs");
};

module.exports.logIn = async (req, res) => {
  // This middleware uses Passport to check whether the provided username is already saved in the database.
  req.flash("success", "Successfully login");
  let reDirectVer = res.locals.saveurl || `/listing`;
  res.redirect(reDirectVer);
};

module.exports.logOut = (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out!");
    res.redirect(`/listing`);
  });
};
