const express = require("express");
const {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
} = require("../cart/controller");

const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/add", addToCart);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;