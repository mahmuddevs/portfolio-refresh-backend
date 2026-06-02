import { Schema, model } from "mongoose";
import { hashData } from "../utils/hashUtils.js";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: "admin" | "user";
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) {
    return;
  }
  this.password = await hashData(this.password);
});
export const User = model<IUser>("User", UserSchema);