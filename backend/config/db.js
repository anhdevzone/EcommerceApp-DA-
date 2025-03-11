import mongoose from "mongoose";
export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://anhdevzone:0000@cluster0.8lw7x.mongodb.net/ecommerce-app"
    )
    .then(() => console.log("DB Connected"));
};
