import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  tenantId: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  isVerified: boolean;
}

const userSchema = new Schema<UserDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    firebaseUid: { type: String, required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: 'uploads/avatar_default.png' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, firebaseUid: 1 }, { unique: true });

export const UserModel = model<UserDocument>('User', userSchema);
