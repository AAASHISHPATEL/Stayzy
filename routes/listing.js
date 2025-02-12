const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLogin, isOwner } = require("../middleware/middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }); //This line determines where the files coming from the frontend will be saved.

//home route
router.get("/", wrapAsync(listingController.index));

//A new EJS file will be displayed for creating a new post.
router.get("/new", isLogin, listingController.newPostForm);

//The #show route is used to display an individual ID.
router.get("/:id", wrapAsync(listingController.showSingleListing));

//The #create route handles the POST request for saving a new listing.
router.post("/", upload.single("listing[image]"), wrapAsync(listingController.newListingSave));

//To display the edit form.
router.get("/:id/edit", isLogin, isOwner, wrapAsync(listingController.editForm));

//To update the listing.
router.put("/:id", isLogin, isOwner, upload.single("listing[image]"), wrapAsync(listingController.listingUpdate));

//To delete the listing.
router.delete("/:id", isLogin, isOwner, wrapAsync(listingController.distroyListinf));

module.exports = router;
