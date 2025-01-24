import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Please enter your full name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
    },
    aboutMe: {
        type: String,
        required: [true, "Please enter about yourself"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Password must contain at least 8 characters"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    resume: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    portfolioURL: {
        type: String,
        required: [true, "Please enter your portfolio URL"],
    },
    githubURL: {
        type: String,
    },
    linkedinURL: {
        type: String,
    },
    youtubeURL: {
        type: String,
    },
    facebookURL: {
        type: String,
    },
    instagramURL: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    },
});

// Encrypting password before saving user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Return JWT token
userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
}


export const User = mongoose.model("User", userSchema);