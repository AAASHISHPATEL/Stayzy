const Listing = require("../models/listing.js");
const listingSchema = require("../schema_joi.js");
const BASE_URL = process.env.BASE_URL; //This line is used to store the base URL in a variable.

module.exports.index = async (req, res, next) => {
  let alllisting = await Listing.find({}); //I retrieved all the data, which is an array, and stored it in allListing.
  res.render("listing/home.ejs", { alllisting: alllisting }); //I converted the allListing array into an object with values and passed it.
};

module.exports.newPostForm = (req, res) => {
  res.render("listing/new.ejs");
};

module.exports.showSingleListing = async (req, res, next) => {
  let { id } = req.params;
  const fulllisting = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!fulllisting) {
    req.flash("error", "Listing does not exist");
    
    res.redirect("/listing");
  }
  res.render("listing/show.ejs", { fulllisting });
};

module.exports.newListingSave = async (req, res, next) => {
  // let result = listingSchema.validate(req.body);
  // if (result.error) {
  //   throw new ExpressError(400, result.error);
  // }

  let url = req.file.path; //Just like req.body contains URL-encoded data, req.file parses files when using Multer.
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing); //The question now is how the listing object is created because req.body is expected to be in the format {title: ..., description: ..., ...}. But we need to create an object where the keys are title, description, etc., and the object name is listing. So, when we print req.body, it will appear as {listing: {title: ..., ...}}. To do this, we need to change the name of the input field in the form to listing[title], listing[description], etc. This way, when the form is submitted, the data will be in the format {listing: {title: ..., ...}}.
  //console.log(newListing);     gives a new object {title: ..., description: ..., ....}
  newListing.owner = req.user._id; //To add a value to the owner key.
  newListing.image = { url, filename };
  newListing.category = Object.values(req.body.category);
  await newListing.save(); //When printing newListing, an object will appear, and it is logged on line 70 with console.log(req.body.listing).
  req.flash("success", "New listing created!"); //This line creates a flash message for success.
  res.redirect(`/listing`); //This line redirects to the home page.
};

module.exports.editForm = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist");
    res.redirect(`/listing`); //This line redirects to the home page.
  }
  res.render("listing/edit.ejs", { listing });
};

module.exports.listingUpdate = async (req, res, next) => {
  let { id } = req.params;
  const newListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  }); //Here, ... is used for destructuring because, in this case, we would otherwise have to pass key-value pairs inside an object as the second argument. But we already have an object, so we use the spread operator to pass the object as key-value pairs.
  // console.log(req.body.listing);    And the result will be an object like {title: ..., description: ..., ...}.
  // console.log(req.body);       And the result will be an object like {listing: {title: ..., description: ..., ...}}.
  if (req.body.category) {
    newListing.category = Object.values(req.body.category);
    newListing.save();
  }
  if (req.file) {
    let url = req.file.path; //Just like req.body contains URL-encoded data, req.file parses files when using Multer.
    let filename = req.file.filename;
    newListing.image = { url, filename };
    newListing.save();git 
  }
  req.flash("success", "Listing updated!");
  res.redirect(`/listing/${id}`);
};

module.exports.distroyListinf = async (req, res, next) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "listing deleted!");
  res.redirect(`/listing`);
};
