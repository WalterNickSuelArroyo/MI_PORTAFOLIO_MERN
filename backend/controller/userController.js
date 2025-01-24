import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { User } from '../models/userSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import { generateToken } from '../utils/jwtToken.js';

export const register = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler('Avatar and resume are required', 400));
    }

    const { avatar } = req.files;

    const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(avatar.tempFilePath, { folder: 'AVATARS' });

    if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponseForAvatar.error || "Unknow Cludinary Error"
        )
    }

    const { resume } = req.files;

    const cloudinaryResponseForResume = await cloudinary.uploader.upload(resume.tempFilePath, { folder: 'MY_RESUME' });

    if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponseForResume.error || "Unknow Cludinary Error"
        )
    }

    const {
        fullName,
        email,
        phone,
        aboutMe,
        password,
        portfolioURL,
        githubURL,
        linkedinURL,
        youtubeURL,
        facebookURL,
    } = req.body;

    const user = await User.create({
        fullName,
        email,
        phone,
        aboutMe,
        password,
        portfolioURL,
        githubURL,
        linkedinURL,
        youtubeURL,
        facebookURL,
        avatar: {
            public_id: cloudinaryResponseForAvatar.public_id,
            url: cloudinaryResponseForAvatar.secure_url,
        },
        resume: {
            public_id: cloudinaryResponseForResume.public_id,
            url: cloudinaryResponseForResume.secure_url,
        },
    });

    generateToken(user, "User registered successfully", 201, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password'));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password'));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password'));
    }

    generateToken(user, "User logged in successfully", 200, res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie('token', "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logged out",
    });
});