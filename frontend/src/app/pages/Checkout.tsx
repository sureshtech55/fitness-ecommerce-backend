import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { normalizeProduct } from '../data/products';
import { orderApi } from '../services/api';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle2, ArrowRight, ChevronRight, CreditCard, Wallet, Banknote, Truck, MapPin, Package, ShieldCheck, Clock, Zap, Home, Building2, Navigation } from 'lucide-react';

const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const onPayment = async (price: number, itemName: string, token: string, onSuccess: (response: any) => void, onFailure: () => void) => {
  try {
    const options = {
      amount: price, // payment controller multiplies by 100
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    const res = await axios.post('http://localhost:3000/api/payments/create-order', options, config);
    const data = res.data.data; // Backend returns { success: true, data: order }

    const paymentObject = new (window as any).Razorpay({
      key: data.key_id || "rzp_test_your_key", // Use key from backend if possible
      order_id: data.id,
      amount: data.amount,
      currency: "INR",
      name: "Meenova",
      description: itemName,
      handler: function (response: any) {
        const options2 = {
          razorpayOrderId: data.id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }

        axios.post('http://localhost:3000/api/payments/verify', options2, config).then((res) => {
          if (res?.data?.success) {
            onSuccess(response);
          } else {
            toast.error("Payment verification failed");
            onFailure();
          }
        }).catch((err) => {
          console.error(err);
          onFailure();
        })
      },
      modal: {
        ondismiss: function() {
          onFailure();
        }
      }
    })

    paymentObject.open();
  } catch (error: any) {
    console.error(error);
    const message = error.response?.data?.message || "Failed to initialize payment";
    toast.error(message);
    onFailure();
  }
}


export function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useShop();
  const { isAuthenticated, user, token } = useAuth();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [orderResponse, setOrderResponse] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
    loadScript("https://checkout.razorpay.com/v1/checkout.js");
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
    instructions: ''
  });

  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'express'>('standard');
  const [deliverySlot, setDeliverySlot] = useState<string>('Anytime');
  const [saveAddress, setSaveAddress] = useState(false);

  const subtotal = cart.reduce((sum, item) => {
    const np = normalizeProduct(item);
    return sum + np.displayPrice;
  }, 0);
  
  const deliveryFee = deliverySpeed === 'express' ? 99 : 0;
  const total = subtotal + deliveryFee;

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      toast.loading("Detecting location...", { id: "gps" });
      navigator.geolocation.getCurrentPosition((position) => {
        // Mock reverse geocoding for now
        setFormData(prev => ({ ...prev, city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }));
        setPincodeStatus('valid');
        toast.success("Location detected successfully!", { id: "gps" });
      }, () => {
        toast.error("Please allow location access in your browser.", { id: "gps" });
      });
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'pincode') {
      setPincodeStatus('idle');
    }
  };

  const handleVerifyPincode = async () => {
    if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }

    setPincodeStatus('checking');
    // Simulate API call for pincode verification
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate that pincodes starting with '1' to '8' are serviceable
    if (formData.pincode.startsWith('0') || formData.pincode === '999999') {
      setPincodeStatus('invalid');
      toast.error('Sorry, we do not deliver to this PIN code yet.');
    } else {
      setPincodeStatus('valid');
      // Auto-fill mock city/state on valid pincode
      setFormData(prev => ({ ...prev, city: 'Delhi', state: 'Delhi' })); 
      toast.success('PIN code is serviceable!');
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeStatus !== 'valid') {
      toast.error('Please verify your PIN code first');
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to place an order');
      navigate('/login?redirect=/checkout');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        shippingAddress: {
          fullName: formData.name,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          phone: formData.phone,
          landmark: formData.landmark,
          addressType: formData.addressType,
        },
        deliveryInstructions: formData.instructions,
        deliverySlot: deliverySpeed === 'standard' ? deliverySlot : 'ASAP',
        isExpressDelivery: deliverySpeed === 'express',
        cartItems: cart.map((item) => {
          const np = normalizeProduct(item);
          return {
            productId: np.displayId,
            quantity: 1,
            price: np.displayPrice,
            image: np.displayImage,
            name: np.displayName
          };
        }),
        itemsPrice: subtotal,
        shippingPrice: deliveryFee,
        totalPrice: total,
        paymentMethod: paymentMethod === 'online' ? 'Razorpay' : 'COD',
      };

      if (saveAddress && isAuthenticated) {
         toast.success("Address saved to profile (Simulation)");
      }

      if (paymentMethod === 'online') {
        // Handle Online Payment (Razorpay)
        await onPayment(
          total, 
          'Order Payment',
          token || '',
          async (paymentRes: any) => {
            // After successful razorpay payment, create the order in DB
            const finalOrderData = { ...orderData, isPaid: true, paymentId: paymentRes.razorpay_payment_id };
            const res = await orderApi.create(finalOrderData);
            setOrderResponse(res.data);
            setStep(3);
            clearCart();
            toast.success('Payment successful & Order placed!');
          },
          () => {
            setLoading(false);
          }
        );
      } else {
        // Handle COD
        const res = await orderApi.create(orderData);
        setOrderResponse(res.data);
        setStep(3);
        clearCart();
        toast.success('Order placed successfully (COD)!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      if (paymentMethod === 'cod') setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <main className="container mx-auto px-4 py-32 min-h-screen text-center flex flex-col items-center justify-center">
        <Package size={64} className="text-muted-foreground mb-4 opacity-20" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <button
          onClick={() => navigate('/shop')}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
        >
          Continue Shopping
        </button>
      </main>
    );
  }

  // Stepper Header
  const Stepper = () => (
    <div className="flex items-center justify-center mb-12 max-w-2xl mx-auto px-4">
      <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-border bg-white'}`}>
          {step > 1 ? <CheckCircle2 size={20} /> : '1'}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">Address</span>
      </div>
      <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
      <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-border bg-white'}`}>
          {step > 2 ? <CheckCircle2 size={20} /> : '2'}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">Payment</span>
      </div>
      <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-border'}`} />
      <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary text-white' : 'border-border bg-white'}`}>
          {step >= 3 ? <CheckCircle2 size={20} /> : '3'}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">Confirm</span>
      </div>
    </div>
  );

  return (
    <main className="container mx-auto px-4 pt-36 pb-12 min-h-screen">
      <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Checkout</h1>
      
      {step < 4 && <Stepper />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-border shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <MapPin className="text-primary" /> Delivery Address
                </h2>
                <button 
                  type="button" 
                  onClick={handleDetectLocation}
                  className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-all w-fit"
                >
                  <Navigation size={16} /> Detect My Location
                </button>
              </div>
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium" 
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Street Address</label>
                  <input type="text" name="street" value={formData.street} onChange={handleChange} required
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                    placeholder="House No / Flat No, Building, Area"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Landmark (Optional)</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                    placeholder="E.g. Near Apollo Hospital, Opposite School"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">PIN Code</label>
                    <div className="relative">
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required
                        className={`w-full p-4 pr-24 bg-gray-50 border rounded-2xl outline-none transition-all font-medium ${pincodeStatus === 'valid' ? 'border-emerald-500' : pincodeStatus === 'invalid' ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                        placeholder="400001"
                        maxLength={6}
                      />
                      <button 
                        type="button"
                        onClick={handleVerifyPincode}
                        disabled={pincodeStatus === 'checking' || formData.pincode.length < 6}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-secondary text-primary rounded-xl text-xs font-bold hover:bg-secondary/80 transition-all disabled:opacity-50"
                      >
                        {pincodeStatus === 'checking' ? 'Verify...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <label className="text-sm font-semibold text-gray-700 block">Address Type</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.addressType === 'Home' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-gray-500 hover:border-primary/50'}`}>
                      <input type="radio" name="addressType" value="Home" checked={formData.addressType === 'Home'} onChange={handleChange} className="hidden" />
                      <Home size={20} /> <span className="font-bold">Home</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.addressType === 'Office' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-gray-500 hover:border-primary/50'}`}>
                      <input type="radio" name="addressType" value="Office" checked={formData.addressType === 'Office'} onChange={handleChange} className="hidden" />
                      <Building2 size={20} /> <span className="font-bold">Office</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-semibold text-gray-700">Delivery Instructions (Optional)</label>
                  <textarea name="instructions" value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} rows={2}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium resize-none"
                    placeholder="E.g. Call before delivery, Leave at gate"
                  />
                </div>

                {isAuthenticated && (
                  <label className="flex items-center gap-3 cursor-pointer pt-2 group">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${saveAddress ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary/50'}`}>
                      {saveAddress && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <span className="font-medium text-gray-700 text-sm">Save this address for future checkouts</span>
                    <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="hidden" />
                  </label>
                )}

                <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group mt-4">
                  Continue to Delivery & Payment <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-border shadow-sm mb-8">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <Truck className="text-primary" /> Delivery Options
                </h2>
                
                <div className="space-y-4 mb-8">
                  <label className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all ${deliverySpeed === 'standard' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                    <input type="radio" name="speed" className="hidden" checked={deliverySpeed === 'standard'} onChange={() => setDeliverySpeed('standard')} />
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${deliverySpeed === 'standard' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Truck size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-foreground">Standard Delivery</p>
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs">Free</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Get it in 3-5 business days</p>
                      </div>
                      {deliverySpeed === 'standard' && <CheckCircle2 className="text-primary" size={24} />}
                    </div>
                  </label>

                  <label className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all ${deliverySpeed === 'express' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                    <input type="radio" name="speed" className="hidden" checked={deliverySpeed === 'express'} onChange={() => setDeliverySpeed('express')} />
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${deliverySpeed === 'express' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Zap size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-foreground">Express Delivery</p>
                          <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-xs">+₹99</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Priority dispatch. Get it by tomorrow!</p>
                      </div>
                      {deliverySpeed === 'express' && <CheckCircle2 className="text-primary" size={24} />}
                    </div>
                  </label>
                </div>

                {deliverySpeed === 'standard' && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <label className="text-sm font-semibold text-gray-700 block"><Clock size={16} className="inline mr-1 text-primary"/> Available Time Slots</label>
                    <select value={deliverySlot} onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary font-medium transition-all"
                    >
                      <option value="Anytime">Anytime (9 AM - 8 PM)</option>
                      <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                      <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                      <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-border shadow-sm">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <CreditCard className="text-primary" /> Choose Payment Method
                </h2>
              <div className="space-y-4">
                <label className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                  <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'online' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Wallet size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">Online Payment (UPI / Card / Netbanking)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Secure payment via Razorpay</p>
                    </div>
                    {paymentMethod === 'online' && <CheckCircle2 className="text-primary" size={24} />}
                  </div>
                </label>

                <label className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                  <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Banknote size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">Cash on Delivery (COD)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Pay when your order arrives</p>
                    </div>
                    {paymentMethod === 'cod' && <CheckCircle2 className="text-primary" size={24} />}
                  </div>
                </label>

                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-border rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all">
                    Go Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                    {loading ? 'Processing...' : paymentMethod === 'online' ? `Pay ₹${total.toFixed(0)} & Place Order` : `Confirm Order (COD)`}
                  </button>
                </div>
              </div>
            </div>
            </>
          )}

          {step === 3 && orderResponse && (
            <div className="bg-white p-6 sm:p-12 rounded-3xl border border-border shadow-sm text-center">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">Order Confirmed!</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Thank you for your purchase. Your order <span className="text-primary font-bold">#{orderResponse._id?.slice(-10).toUpperCase()}</span> has been placed successfully.
              </p>
              
              <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left border border-gray-100">
                <div className="space-y-3">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground flex items-center gap-2">
                      {orderResponse.isExpressDelivery ? <Zap size={18} className="text-primary" /> : <Truck size={18} className="text-primary" />} 
                      {orderResponse.isExpressDelivery ? 'Tomorrow (Express)' : '3-5 Business Days (Standard)'}
                    </p>
                    {orderResponse.deliverySlot && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12}/> {orderResponse.deliverySlot}</p>}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Method</p>
                  <p className="font-bold text-foreground flex items-center gap-2 capitalize">
                    {paymentMethod === 'online' ? <Wallet size={18} className="text-primary" /> : <Banknote size={18} className="text-primary" />}
                    {paymentMethod === 'online' ? 'Paid Online' : 'Cash on Delivery'}
                  </p>
                </div>
              </div>

              <div className="mb-8 text-left">
                <h3 className="font-bold text-lg mb-4 px-2">Ordered Items</h3>
                <div className="space-y-3">
                  {orderResponse.cartItems?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-border">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-border">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-primary">₹{item.price}</span>
                    </div>
                  ))}
                  <div className="pt-4 px-4 flex justify-between items-center border-t border-dashed border-border mt-2">
                    <span className="font-bold text-gray-500 uppercase text-xs tracking-widest">Grand Total</span>
                    <span className="text-2xl font-bold text-primary">₹{orderResponse.totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/account/orders')} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                  Track Your Order <Truck size={20} />
                </button>
                <button onClick={() => navigate('/')} className="px-8 py-4 border-2 border-border rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Order Summary */}
        {step !== 3 && (
        <div className="lg:col-span-1">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm sticky top-32">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => {
                const np = normalizeProduct(item);
                return (
                  <div key={np.displayId} className="flex items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-border group-hover:border-primary/20 transition-all">
                      <img src={np.displayImage} alt={np.displayName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{np.displayName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Qty: 1</p>
                    </div>
                    <span className="font-bold text-foreground">₹{np.displayPrice}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-4 pt-6 border-t border-dashed border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-bold">₹{subtotal.toFixed(0)}</span>
              </div>
              <div className={`flex justify-between items-center ${deliverySpeed === 'standard' ? 'text-emerald-600' : 'text-primary'}`}>
                <span className="font-medium">Shipping</span>
                {deliverySpeed === 'standard' ? (
                  <span className="font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Free</span>
                ) : (
                  <span className="font-bold text-sm bg-primary/10 px-3 py-1 rounded-full border border-primary/20">+₹99 (Express)</span>
                )}
              </div>
              <div className="pt-6 border-t-2 border-border flex justify-between items-end">
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Amount</p>
                  <p className="text-3xl font-bold text-primary">₹{total.toFixed(0)}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-[10px] text-muted-foreground flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-tighter">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure Checkout
              </div>
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-tighter">
                <Truck size={14} className="text-emerald-500" /> Fast Delivery
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
