const express = require("express");
const {
     create,
    getAll,
    getProductById,
    getProductBySlug,
    updateProduct,
    deleteproduct,
    getBestSellerProducts,
    getNewlyLaunchedProducts,
    getMegaOfferProducts,
    getProductsByCategory,
    getRelatedProducts,
    searchProducts,
} = require("../controller/controller");

const router = express.Router();

router.get("/bestsellers", getBestSellerProducts);
router.get("/newlylaunched", getNewlyLaunchedProducts);
router.get("/megaoffers", getMegaOfferProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id/related", getRelatedProducts);


router.post("/", create);
router.get("/", getAll);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteproduct);

module.exports = router;