import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { User } from '../models/userSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import { generateToken } from '../utils/jwtToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';

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
        instagramURL,
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
        instagramURL,
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
        return next(new ErrorHandler('Por favor, ingresa una contraseña y un correo electrónico', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Correo o contraseña incorrectos', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Correo o contraseña incorrectos', 401));
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

export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        aboutMe: req.body.aboutMe,
        portfolioURL: req.body.portfolioURL,
        githubURL: req.body.githubURL,
        linkedinURL: req.body.linkedinURL,
        youtubeURL: req.body.youtubeURL,
        facebookURL: req.body.facebookURL,
        instagramURL: req.body.instagramURL,
    }

    if (req.files && req.files.avatar) {
        const avatar = req.files.avatar;
        const user = await User.findById(req.user.id);
        const profileImageId = user.avatar.public_id;
        await cloudinary.uploader.destroy(profileImageId);
        const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, { folder: 'AVATARS' });
        newUserData.avatar = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        }
    }

    if (req.files && req.files.resume) {
        const resume = req.files.resume;
        const user = await User.findById(req.user.id);
        const resumeId = user.resume.public_id;
        await cloudinary.uploader.destroy(resumeId);
        const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath, { folder: 'MY_RESUME' });
        newUserData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler('Please enter all fields', 400));
    }


    const isPasswordMatched = await user.comparePassword(currentPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Password is incorrect', 400));
    }

    if (newPassword !== confirmNewPassword) {
        return next(new ErrorHandler('La contraseña no coincide', 400));
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully',
    });
});

export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
    const id = "67933d3642081838487f87a5";
    const user = await User.findById(id);

    res.status(200).json({
        success: true,
        user,
    });
});

// FORGOT PASSWORD
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const { email } = req.body;
    
    if (!email) {
        return next(new ErrorHandler('Por favor, ingresa un correo electrónico', 400));
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('Usuario no encontrado con este correo electrónico.', 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetPasswordUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Recuperación de contraseña de Portafolio',
            message,
        });

        res.status(200).json({
            success: true,
            message: `Correo enviado a: ${user.email}`,
        });
    }
    catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// RESET PASSWORD

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler('El token de restablecimiento de contraseña no es válido o ha expirado.', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('La contraseña no coincide', 400));
    }

    user.password = await req.body.password;

    user.resetPasswordToken = undefined;

    user.resetPasswordExpire = undefined;

    await user.save();

    generateToken(user, "Contraseña restablecida con éxito.", 200, res);
}); 