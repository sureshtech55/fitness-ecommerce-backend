const express = require("express");
const {
     createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    updateUserPassword,
    toggleUserBlocked,
    addAddress,
    updateAddress,
    deleteAddress,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    toggleNewsletter,
} = require("../controller/controller");

const { authMiddleware, authorize } = require("../../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/email/:email", authorize("admin"), getUserByEmail);
router.get("/:id/wishlist", getWishlist);
router.post("/:id/wishlist", addToWishlist);
router.delete("/:id/wishlist/:productId", removeFromWishlist);

router.post("/:id/addressess", addAddress);
router.put("/:id/addressess/:addressId", updateAddress);
router.delete("/:id/addressess/:addressId", deleteAddress);

router.patch("/:id/block", authorize("admin"), toggleUserBlocked);
router.patch("/:id/newsletter", toggleNewsletter);

router.post("/", authorize("admin"), createUser);
router.get("/", authorize("admin"), getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", authorize("admin"), deleteUser);
router.patch("/:id/password", updateUserPassword);


module.exports = router;
