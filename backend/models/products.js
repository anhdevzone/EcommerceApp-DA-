import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: 1000000 // Maximum price in USD
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0,
    max: 1000000
  },
  catName: {
    type: String,
    default: "",
  },
  subName: {
    type: String,
    default: "",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number, // Tỷ lệ giảm giá từ 0-100%
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0 && value <= 100; // Xác thực tỷ lệ giảm giá
      },
      message: "Discount must be between 0 and 100",
    },
  },
  ramName: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "ProductRams",
    required: true,
  },
  sizeName: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "ProductSize",
    required: true,
  },
  weightName: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "ProductWeigth",
    required: true,
  },
  location: { type: String, required: true },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Tính toán giá mới dựa trên discount và oldPrice
productSchema.pre("save", function (next) {
  if (this.discount >= 0 && this.discount <= 100) {
    this.price = this.oldPrice - (this.oldPrice * this.discount) / 100;
  } else {
    this.price = this.oldPrice;
  }
  next();
});

// Virtual field for id
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Update price formatting for USD
productSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.price = parseFloat(ret.price).toFixed(2); // Format to 2 decimal places for USD
    ret.oldPrice = parseFloat(ret.oldPrice).toFixed(2);
    return ret;
  },
});

export const Products = mongoose.model("Products", productSchema);
