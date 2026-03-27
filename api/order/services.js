const Model = require("../order/model");
const mongoose = require("mongoose");

// CREATE ORDER (invoice auto-generate)
const create = async (body) => {
  body.invoiceNumber = `INV-${Date.now()}`;
  
  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MOCK ORDER: Database is down. Creating simulation order.");
    return {
      _id: `order_mock_${Date.now()}`,
      ...body,
      createdAt: new Date(),
    };
  }
  
  return await Model.create(body);
};

// ASSIGN DELIVERY PARTNER & TRACKING
const assignDelivery = async (id, deliveryData) => {
  return await Model.findByIdAndUpdate(
    id,
    {
      deliveryPartner: deliveryData.deliveryPartner,
      trackingId: deliveryData.trackingId,
      expectedDeliveryDate: deliveryData.expectedDeliveryDate,
      orderStatus: "SHIPPED",
    },
    { new: true }
  );
};

// GET SINGLE ORDER
const getone = async (id) => {
  return await Model.findById(id)
    .populate("user", "name email")
    .populate("orderItems.product", "title price image");
};

// GET ALL ORDERS
const getAll = async () => {
  return await Model.find({}).sort({ createdAt: -1 });
};

// GET MY ORDERS
const getMyOrders = async (userId) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MOCK ORDER: Database is down. Return mock user orders.");
    return [
      {
        _id: `mock_ord_${Date.now()}`,
        createdAt: new Date().toISOString(),
        totalPrice: 1599,
        isExpressDelivery: true,
        deliverySlot: "Morning (9 AM - 12 PM)",
        orderStatus: "SHIPPED",
        paymentMethod: "Razorpay",
        isPaid: true,
        orderItems: [
          { title: "Premium Men's T-Shirt", quantity: 2, price: 799, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab" }
        ],
        shippingAddress: {
          fullName: "Suresh Pal",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
          addressType: "Home"
        }
      },
      {
        _id: `mock_ord_${Date.now() - 86400000}`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        totalPrice: 2499,
        isExpressDelivery: false,
        deliverySlot: "Anytime (9 AM - 8 PM)",
        orderStatus: "DELIVERED",
        deliveredAt: new Date(Date.now() - 40000000).toISOString(),
        paymentMethod: "COD",
        isPaid: false,
        orderItems: [
          { title: "Wireless Earbuds Pro", quantity: 1, price: 2499, image: "https://images.unsplash.com/photo-1606220588913-b3eea4cece47" }
        ],
        shippingAddress: {
          fullName: "Suresh Pal",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          addressType: "Office"
        }
      }
    ];
  }
  return await Model.find({ user: userId }).sort({ createdAt: -1 })
    .populate("orderItems.product", "title price image");
};

// UPDATE ORDER (generic)
const update = async (body, id) => {
  return await Model.findByIdAndUpdate(id, body, { new: true });
};

// UPDATE EXPECTED DELIVERY DATE ONLY
const updateExpectedDelivery = async (id, date) => {
  return await Model.findByIdAndUpdate(
    id,
    { expectedDeliveryDate: date },
    { new: true }
  );
};

// DELETE ORDER
const deleteone = async (id) => {
  return await Model.findByIdAndDelete(id);
};

// DELETE ALL ORDERS
const deleteAll = async () => {
  return await Model.deleteMany({});
};

module.exports = {
  create,
  assignDelivery,
  getone,
  getAll,
  getMyOrders,
  update,
  updateExpectedDelivery,
  deleteone,
  deleteAll,
};
