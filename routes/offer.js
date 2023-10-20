const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

router.post(
  "/offers/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log(req.body); // pour vérifier qu'on reçoit bien nos body
      // console.log(req.files); // same
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const pictureToUpload = req.files.picture;
      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload)
      );
      // console.log(result);

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        product_image: result,
        owner: req.user._id,
      });
      // console.log(newOffer);

      await newOffer.save();
      res.status(400).json({ newOffer });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query; // OU const { title = "", priceMin = 0, priceMax = 500, sort = "", page = 1 } = req.query; POUR EVITER DE DECLARER DES INDEXTITLE ETC..
    // console.log(req.query);

    let indexTitle = "";
    let indexPriceMin = 0;
    let indexPriceMax = 500;
    let indexSort = "";
    let indexPage = 1;
    let indexLimit = 5;

    if (title) {
      indexTitle = title;
    }
    if (priceMin) {
      indexPriceMin = priceMin;
    }
    if (priceMax) {
      indexPriceMax = priceMax;
    }
    if (sort === "price-desc") {
      indexSort = "desc";
    } else if (sort === "price-asc") {
      indexSort = "asc";
    }
    if (page) {
      indexPage = page;
    }
    const skip = (indexPage - 1) * indexLimit;
    console.log(skip);

    const offers = await Offer.find({
      product_name: new RegExp(indexTitle, "i"),
      product_price: { $gte: indexPriceMin, $lte: indexPriceMax },
    })
      .sort({ product_price: indexSort })
      .skip(skip)
      .limit(indexLimit)
      .select("product_name product_price product_details");
    // console.log(offers);

    res.json(offers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers/id:", async (req, res) => {
  try {
    const offersById = await Offer.findById(req.query.id);
    console.log(offersById);

    res.json(offersById);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "User don't exist" });
  }
});

module.exports = router;
