const express = require("express");
const {
       createProduct,
    getAllProducts,
    getProductById,
    getProductBySlug,
    updateProduct,
    deleteProduct,
    getBestSellerProducts,
    getNewlyLaunchedProducts,
    getMegaOfferProducts,
    getProductsByCategory,
    getRelatedProducts,
    searchProducts,
    approveProduct,
} = require("../controller/controller");

const { authMiddleware, authorize } = require("../../middleware/auth");

const router = express.Router();

router.get("/bestsellers", getBestSellerProducts);
router.get("/newlylaunched", getNewlyLaunchedProducts);
router.get("/megaoffers", getMegaOfferProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id/related", getRelatedProducts);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected Admin Routes
router.use(authMiddleware);
router.use(authorize("admin"));

router.post("/", createProduct);
router.patch("/:id/approve", approveProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;