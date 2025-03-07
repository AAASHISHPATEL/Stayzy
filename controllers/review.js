const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const BASE_URL = process.env.BASE_URL;

module.exports.addReview = async (req, res, next) => {
  let { id } = req.params; //Here, no :id will come because in app.js, we wrote listing/:id/reviews. The :id stays in app.js, so to pass that :id, we use mergeParams. This merges the parameters from the parent route with the child route.
  let listing = await Listing.findById(id);
  let { rating, comment } = await req.body;
  let newReview = new Review({ rating, comment });
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Review added!");
  res.redirect(`/listing/${id}`);
};

module.exports.deletReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //pull means deleting from array
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review was deleted!");
  res.redirect(`/listing/${id}`);
};
