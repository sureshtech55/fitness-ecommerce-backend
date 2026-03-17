require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./api/oauth/services/oauth.service");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./auth/routes/auth.routes");
const oauthRoutes = require("./api/oauth/routes/oauth.routes");
const categoryRoutes = require("./api/category/routes");
const productRoutes = require("./api/product/routes/routes");
const cartRoutes = require("./api/cart/routes");
const orderRoutes = require("./api/order/routes");
const couponRoutes = require("./api/coupon/routes");
const userRoutes = require("./api/user/routes/routes");
const settingRoutes = require("./api/setting/routes/settings.routes");
const notificationRoutes = require("./api/notifications/routes/notification.routes");
const paymentRoutes = require("./api/payment/routes/payment.routes");
const adminRoutes = require("./api/admin/routes/admin.routes");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.JWT_SECRET || "secretkey",
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});