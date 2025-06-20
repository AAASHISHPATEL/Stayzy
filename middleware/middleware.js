const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.isLogin = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Passport's default method returns true if login/sign-up is successful; otherwise, it returns false.
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "At first loggedin");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = async (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.saveurl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!res.locals.currentUser._id.equals(listing.owner._id)) {
    req.flash("error", "You don't have permission to edit");
    return res.redirect(`/listing/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!res.locals.currentUser._id.equals(review.author._id)) {
    req.flash("error", "You are not the author of this post");
    return res.redirect(`/listing/${id}`);
  }
  next();
};
