"use server";

import Razorpay from 'razorpay';
import crypto from 'crypto';  // Used to verify the signature
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types";
import { redirect } from 'next/navigation';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import { ObjectId } from 'mongodb';
import User from '../database/models/user.model';

// Initialize Razorpay instance with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY_ID!,  // Use test key for Razorpay
  key_secret: process.env.RAZORPAY_TEST_SECRET_KEY!
});

// Checkout Order using Razorpay
export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const price = order.isFree ? 0 : Number(order.price) * 100;  // Razorpay works in paise (100 INR = 10000 paise)

  // Create a shorter receipt ID with a max length of 40 characters
  const receiptId = `receipt_${order.eventId.slice(0, 10)}_${order.buyerId.slice(0, 10)}`;

  try {
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: price,
      currency: "INR",
      receipt: receiptId,  // Ensure receipt ID is less than 40 characters
      notes: {
        eventId: order.eventId,
        buyerId: order.buyerId
      }
    });

    // Redirect to a custom checkout page or Razorpay's prebuilt checkout
    redirect(`/payment?order_id=${razorpayOrder.id}`);
  } catch (error) {
    throw error;
  }
};

// Razorpay Signature Verification
export const verifyRazorpaySignature = (payment: any, orderId: string) => {
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_TEST_SECRET_KEY!);
  hmac.update(orderId + "|" + payment.razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === payment.razorpay_signature) {
    return true; // Signature matches
  }

  return false; // Invalid signature
};

// Create an Order in your Database
export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();

    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId,
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
};

// GET ORDERS BY EVENT (Unchanged)
export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    await connectToDatabase()

    if (!eventId) throw new Error('Event ID is required')
    const eventObjectId = new ObjectId(eventId)

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      {
        $unwind: '$buyer',
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: {
            $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
          },
        },
      },
      {
        $match: {
          $and: [{ eventId: eventObjectId }, { buyer: { $regex: RegExp(searchString, 'i') } }],
        },
      },
    ]);

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
  }
}

// GET ORDERS BY USER (Unchanged)
export async function getOrdersByUser({ userId, limit = 3, page }: GetOrdersByUserParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { buyer: userId };

    const orders = await Order.distinct('event._id')
      .find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event',
        model: Event,
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      });

    const ordersCount = await Order.distinct('event._id').countDocuments(conditions);

    return { data: JSON.parse(JSON.stringify(orders)), totalPages: Math.ceil(ordersCount / limit) };
  } catch (error) {
    handleError(error);
  }
}
