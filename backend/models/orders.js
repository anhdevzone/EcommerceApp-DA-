import mongoose from 'mongoose';

const ordersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: String
        },
        productTitle: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
        image: {
          type: String,
        },
        subTotal: {
          type: Number,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Chờ xác nhận","Đã xác nhận", "Đang giao", "Hoàn thành"],
      default: "Chờ xác nhận"
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt automatically

ordersSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ordersSchema.set('toJSON', {
  virtuals: true,
});

export const Orders = mongoose.model('Orders', ordersSchema);
