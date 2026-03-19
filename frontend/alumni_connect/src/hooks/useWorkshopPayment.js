import { useState } from 'react';
import { createPaymentOrder, verifyPayment, registerFreeWorkshop } from '../api/workshopService';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const useWorkshopPayment = () => {
  const [processing, setProcessing] = useState(false);

  const handleRegister = async (workshop, user, onSuccess) => {
    setProcessing(true);
    try {
      // Step 1: Initialize Order
      const data = await createPaymentOrder(workshop.id);

      // A. If Workshop is FREE, the backend returns { isFree: true }
      // We immediately call the free registration endpoint.
      if (data.isFree) {
        await registerFreeWorkshop(workshop.id);
        alert('Registered Successfully for Free Workshop!');
        if (onSuccess) onSuccess();
        setProcessing(false);
        return;
      }

      // B. If Paid, we need Razorpay
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setProcessing(false);
        return;
      }

      // Configure Razorpay Options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Alumni Connect",
        description: `Register for ${workshop.title}`,
        image: workshop.image, // Optional: Show workshop image in modal
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Step 2: Verify Payment on Backend
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              workshopId: workshop.id
            });

            if (verifyRes.success) {
              alert('Payment Successful! You are registered.');
              if (onSuccess) onSuccess();
            }
          } catch (err) {
            console.error(err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: "#2563EB" // Blue color
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response){
        alert(response.error.description);
      });
      
      paymentObject.open();

    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setProcessing(false); // Note: For paid flow, this might close before modal closes, which is fine
    }
  };

  return { handleRegister, processing };
};