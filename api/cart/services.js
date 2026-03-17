const Cart = require("../cart/model");

const getUserCartService = async (userId) => {
    return await Cart.findOne({ userId }).populate("cartItems.productId");
}; 

const addToCartService = async (userId, productData) => {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = await Cart.create({
            userId,
            cartItems: [productData],
            totalPrice: productData.price * productData.quantity,
            totalPriceAfterDiscount: 
            productData.price * productData.quantity - 
            (productData.totalProductDiscount || 0),
        });
        return cart;
    }

    const itemIndex = cart.cartItems.findIndex(
        (item) =>
            item.productId.toString() === productData.productId.toString()
    );

   if (itemIndex > -1) {
    cart.cartItems[itemIndex].quantity += productData.quantity;
   } else {
    cart.cartItems.push(productData);
   }

   cart.totalPrice += productData.price * productData.quantity;
   cart.totalPriceAfterDiscount = 
   cart.totalPrice - (cart.discount || 0);

   await cart.save();
   return cart;
};

const removeFromCartService = async (userId, productId) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) return null;

    cart.cartItems = cart.cartItems.filter(
        (item) => item.productId.toString() !== productId
    );

    await cart.save();
    return cart;
};

const clearCartService = async (userId) => {
    return await Cart.findOneAndDelete({ userId });
};

module.exports = {
    getUserCartService,
    addToCartService,
    removeFromCartService,
    clearCartService,
};