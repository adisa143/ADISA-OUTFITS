const Razorpay = require("razorpay");

module.exports = async function handler(req, res) {
  // Only POST requests are allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    // Razorpay credentials MUST come from Vercel Environment Variables
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay environment variables are missing"
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const body = req.body || {};

    // Amount comes from checkout
    const amount = Number(body.amount);

    // Basic validation
    if (!Number.isInteger(amount) || amount < 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "ADISA_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order"
    });
  }
};
