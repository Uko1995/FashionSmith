import mongoose from "mongoose";

const userVerificationSchema = new mongoose.Schema({
    email: {type: String, required: true},
    uniqueString: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    expiresAt: {type: Date, default: Date.now + 1 * 60 * 60 * 1000},
});

const UserVerification = mongoose.model('UserVerification', userVerificationSchema);

export default UserVerification;