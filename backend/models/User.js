import mongoose from 'mongoose';

const sharedUserSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    role: {
        type: String,
        enum: ['Owner', 'Editor', 'Viewer'],
        default: 'Viewer'
    }
}, { _id: false });

const fileSchema = new mongoose.Schema({
    repoName: { type: String },
    language: { type: String },
    type: { type: String },
    vmId: { type: String },
    sharedUsers: [sharedUserSchema],  // array of userId + role
    access: { type: String, enum: ["Restricted", "Anyone with the Link"], default: "Restricted" },
    action: {type: String, enum: ["Viewer", "Editor"], default: "Viewer"}
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    userId: { type: String },
    repos: [fileSchema]  // array of file objects
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
