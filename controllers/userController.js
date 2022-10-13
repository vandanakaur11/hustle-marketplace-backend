const fs = require("fs");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { env } = require("process");
const User = require("./../models/userSchema");
const cloudinary = require("cloudinary").v2;

sgMail.setApiKey(env.SENDGRID_API_KEY);

exports.getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await User.find();

  allUsers &&
    res.status(200).json({
      status: "success",
      results: allUsers.length,
      data: { users: allUsers },
    });
});

exports.getUser = asyncHandler(async (req, res) => {
  const existingUser = await User.findById(req.params.id);

  const userData = await User.aggregate([
    {
      $match: {
        _id: existingUser._id,
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "roleID",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $project: {
        password: 0,
        roleID: 0,
        verificationCode: 0,
        resetPasswordCode: 0,
        isVerified: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        "role._id": 0,
        "role.createdAt": 0,
        "role.updatedAt": 0,
        "role.__v": 0,
      },
    },
  ]);

  existingUser &&
    userData &&
    res.status(200).json({ status: "success", data: { user: userData } });
});

exports.createUser = asyncHandler(async (req, res) => {
  const {
    name: { first, last },
    email,
    phone,
    password,
    confirmPassword,
    roleID,
    location: { city, area },
  } = req.body;

  // Check existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error(
      `This email 'asdsad@gmailc.' is already associated with an account!`
    );
  }

  // Validate fields
  if (
    !first ||
    !last ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword ||
    !roleID ||
    !city ||
    !area
  ) {
    res.status(400);
    throw new Error("All fields must be filled!");
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Password mismatch!");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  // Generate random 6 digits code
  const min = 10000;
  const max = 99999;
  const random6DigitCode = Math.floor(Math.random() * min) + max;

  const newUser = await User.create({
    name: { first, last },
    email,
    phone,
    password: hashPassword,
    roleID,
    location: { city, area },
    verificationCode: random6DigitCode,
  });

  if (newUser) {
    // Send mail via sendgrid
    const mailOptions = {
      from: env.USER_EMAIL, // sender email
      to: email, // receiver email
      subject: "Verification Email - Hustle Marketplace",
      html: `<h4>Greetings from Hustle Marketplace,</h4><h4>Below is your one time use code:</h4><h4>${random6DigitCode}</h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The Hustle Marketplace Team</h4>`,
    };

    sendMailViaNodeMailer(mailOptions);

    newUser &&
      res.status(201).json({
        status: "success",
        message:
          "Account created successfully. Now check your email for verification code.",
        data: {
          user: newUser._id,
        },
      });
  }
});

exports.verifyUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check user exist or not
  const existingUser = await User.findById(id);

  if (!existingUser) {
    res.status(400);
    throw new Error("User not found!");
  }

  if (existingUser.isVerified) {
    res.status(400);
    throw new Error("User already verified, Now login!");
  }

  const { verificationCode } = req.body;

  if (verificationCode !== existingUser.verificationCode) {
    res.status(400);
    throw new Error("Invalid verification code! check your email");
  }

  const verifiedUser = await User.updateOne(
    { _id: id },
    { $set: { verificationCode: 0, isVerified: true } },
    { new: true }
  );

  if (verifiedUser) {
    // Send mail via sendgrid

    /* const mailDetails = {
        from: env.USER_EMAIL, // sender email
        to: existingUser.email, // receiver email
        subject: "Verified Account - Hustle Marketplace",
        html: successMessage,
      };

      sendMailViaSendGrid(mailDetails); */

    // Send mail via nodemailer

    const mailOptions = {
      from: env.USER_EMAIL, // sender email
      to: existingUser.email, // receiver email
      subject: "Verified Account - Hustle Marketplace",
      html: `<h4>Your account verified successfully... Now <a href="${env.CLIENT_LOCAL_URL}/login">Login</a> your account</h4><h4>Regards,</h4><h4>Hustle Marketplace Team</h4>`,
    };

    sendMailViaNodeMailer(mailOptions);

    res.status(200).json({
      status: "success",
      message: "Account verified successfully, Now login...",
    });
  }

  res.status(400);
  throw new Error("Something went wrong!");
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check existing user
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    res.status(400);
    throw new Error("User not found!");
  }

  // Validate fields
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields must be filled!");
  }

  // Check user verified or not
  if (!existingUser.isVerified) {
    // Generate random 6 digits code
    const min = 10000;
    const max = 99999;
    const random6DigitCode = Math.floor(Math.random() * min) + max;

    // Send mail via sendgrid

    /* const mailDetails = {
        from: env.USER_EMAIL, // sender email
        to: email, // receiver email
        subject: "Verification Email - Hustle Marketplace",
        html: `<h4>Greetings from Hustle Marketplace,</h4><h4>Below is your one time use verify link:</h4><h4>Click here for verification <a href="${verificationLink}">link</a></h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The Hustle Marketplace Team</h4>`,
      };

      sendMailViaSendGrid(mailDetails); */

    // Send mail via nodemailer

    const mailOptions = {
      from: env.USER_EMAIL, // sender email
      to: email, // receiver email
      subject: "Verification Email - Hustle Marketplace",
      html: `<h4>Greetings from Hustle Marketplace,</h4><h4>Below is your one time use code:</h4><h4>${random6DigitCode}</h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The Hustle Marketplace Team</h4>`,
    };

    sendMailViaNodeMailer(mailOptions);

    res.status(400);
    throw new Error(
      "Your account not verified! check your email for verification code."
    );
  }

  // Verify Password
  const verifyPassword = await bcrypt.compare(password, existingUser.password);

  console.log("verifyPassword >>>>>>>>>>>>", verifyPassword);

  // Get data with role
  const userData = await User.aggregate([
    {
      $match: {
        _id: existingUser._id,
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "roleID",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $project: {
        password: 0,
        roleID: 0,
        verificationCode: 0,
        resetPasswordCode: 0,
        isVerified: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        "role._id": 0,
        "role.createdAt": 0,
        "role.updatedAt": 0,
        "role.__v": 0,
      },
    },
  ]);

  // console.log("userData >>>>>>>>>", userData);
  // console.log("userData >>>>>>>>>", userData[0].role);

  if (verifyPassword) {
    res.status(200).json({
      status: "success",
      token: generateToken(email),
      data: { user: userData },
    });
  }

  res.status(400);
  throw new Error("Invalid username or password!");
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check user exist or not
  const existingUser = await User.findById(id);

  if (!existingUser) {
    res.status(400);
    throw new Error("User not found!");
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate fields
  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error("All fields must be filled!");
  }

  // Verify Password
  const verifyCurrentPassword = await bcrypt.compare(
    currentPassword,
    existingUser.password
  );

  if (!verifyCurrentPassword) {
    res.status(400);
    throw new Error("Invalid current password!");
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("Password mismatch!");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(newPassword, salt);

  const updatePassword = await User.updateOne(
    { _id: id },
    { $set: { password: hashPassword } },
    { new: true, runValidators: true }
  );

  if (updatePassword) {
    res.status(200).json({
      status: "success",
      message: "Password changed successfully...",
    });
  }

  res.status(400);
  throw new Error("Something went wrong!");
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check existing user
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    res.status(400);
    throw new Error("User not found!");
  }

  // Validate fields
  if (!email) {
    res.status(400);
    throw new Error("Email field must be filled!");
  }

  const { _id, email: userEmail } = existingUser;

  // Generate random 6 digits code
  const min = 10000;
  const max = 99999;
  const random6DigitCode = Math.floor(Math.random() * min) + max;

  console.log("Random 6 digit code", random6DigitCode);

  const updateCode = await User.updateOne(
    { _id },
    { $set: { resetPasswordCode: random6DigitCode } }
  );

  if (updateCode) {
    // Send mail via sendgrid

    /* const mailDetails = {
        from: env.USER_EMAIL, // sender email
        to: email, // receiver email
        subject: "Forgot Password Verification Code - Hustle Marketplace",
        html: forgotPassword,
      };

      sendMailViaSendGrid(mailDetails); */

    // Send mail via nodemailer

    const mailOptions = {
      from: env.USER_EMAIL, // sender email
      to: email, // receiver email
      subject: "Forgot Password Verification Code - Hustle Marketplace",
      html: `<h4>Greetings from Hustle Marketplace,</h4><h4>Below is your one time use code:</h4><h4>${random6DigitCode}</h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The Hustle Marketplace Team</h4>`,
    };

    sendMailViaNodeMailer(mailOptions);

    res.status(200).json({
      status: "success",
      message: `Success! verification code sent to '${userEmail}' email.`,
      data: {
        id: _id,
      },
    });
  }

  res.status(400);
  throw new Error("Something went wrong!");
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check user exist or not
  const existingUser = await User.findById(id);

  if (!existingUser) {
    res.status(400);
    throw new Error("User not found!");
  }

  const { resetPasswordCode, newPassword, confirmPassword } = req.body;

  // Validate fields
  if (!resetPasswordCode || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error("All fields must be filled!");
  }

  if (resetPasswordCode !== existingUser.resetPasswordCode) {
    res.status(400);
    throw new Error("Invalid reset password code!");
  }

  // Compare password and confirm password
  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("Password mismatch!");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(newPassword, salt);

  const updatePassword = await User.updateOne(
    { _id: id },
    { $set: { password: hashPassword, resetPasswordCode: 0 } },
    { new: true, runValidators: true }
  );

  if (updatePassword) {
    res.status(200).json({
      status: "success",
      message: "Password reset successfully. Now login...",
    });
  }

  res.status(400);
  throw new Error("Something went wrong!");
});

exports.updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

// Upload Student Profile
exports.uploadProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const existingUser = await User.findById(id);

  if (!existingUser) {
    res.status(400);
    throw new Error("User not found!");
  }

  console.log("req.files.avatar", req.files.avatar);

  const avatar = req.files.avatar;

  // Validate Image
  const fileSize = avatar.size / 1000;
  const fileExt = avatar.name.split(".")[1];

  console.log("fileSize", fileSize);
  console.log("fileExt", fileExt);

  if (fileSize > 500) {
    res.status(400);
    throw new Error("File size must be lower than 500kb!");
  }

  if (!["jpg", "png"].includes(fileExt)) {
    res.status(400);
    throw new Error("File extension must be jpg or png!");
  }

  cloudinary.uploader.upload(
    avatar.tempFilePath,
    {
      // if save same file name with any unique code use these two properties
      // use_filename: true,
      // unique_filename: false,
      folder: "hustle_marketplace",
      public_id: id,
    },

    async (err, image) => {
      if (err) {
        console.error("err", err);
      }

      console.log("File Uploaded");

      // console.log(image);
      console.log(image.url);

      // update user avatar field
      await User.findByIdAndUpdate(
        id,
        { avatar: image.url },
        { new: true, runValidators: true }
      );

      fs.unlink(avatar.tempFilePath, (err) => {
        if (err) console.error("inside fs", err);
      });

      res.status(200).json({
        data: {
          file: image.url,
        },
      });
    }
  );
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const generateToken = (email) => {
  console.log("env.JWT_SECRET >>>>>>>>>", env.JWT_SECRET);

  return jwt.sign({ email }, env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

/* const sendMailViaSendGrid = asyncHandler(async (mailDetails) => {
  await sgMail
    .send(mailDetails:any)
    .then(() => {
      console.log("Mail sent successfully!");
    })
    .catch((err) => {
      console.error("sendMailViaSendGrid err >>>>>>>>>>>>>>>>>>", err);
    });
}); */

const sendMailViaNodeMailer = (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.USER_EMAIL,
      pass: env.USER_PASS,
    },
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("sendMailViaNodeMailer error >>>>>>>>>>>>>", error);
    } else {
      console.log("info >>>>>>", info);
      console.info("Email sent: " + info.response);
    }
  });
};
