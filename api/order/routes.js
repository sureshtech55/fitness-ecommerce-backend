const express = require("express");
const {
  create,
  getone,
  getAll,
  update,
  assignDelivery,
  updateExpectedDeliveryDate,
  deleteone,
  deleteAll,
} = require("../order/controller");

const { authMiddleware, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getone);
router.put("/:id", update);
router.put("/:id/delivery", assignDelivery);
router.put("/:id/delivery-date", updateExpectedDeliveryDate);
router.delete("/:id", deleteone);

router.delete("/", authorize("admin"), deleteAll);

module.exports = router;
