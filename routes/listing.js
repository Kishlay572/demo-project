const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validatelisting } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//index & create route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(listingController.createListing)
  );

//NEW route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//filter by category
router.get(
  "/category/:category",
  wrapAsync(async (req, res) => {
    const { category } = req.params;
    const listings = await Listing.find({ category });
    res.render("listings/index.ejs", { allListings: listings });
  })
);

//search route
router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.redirect("/listings"); //if empty it will show all lisiting
    }

    //search in both location and country
    const listings = await Listing.find({
      $or: [
        { location: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
      ],
    });

    res.render("listings/index.ejs", { allListings: listings });
  })
);

//Show,Update & Delete route
router
  .route("/:id")
  .get(wrapAsync(listingController.showLisiting))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteLisitng));

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

module.exports = router;
