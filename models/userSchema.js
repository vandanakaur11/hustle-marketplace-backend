const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      first: {
        type: String,
        required: [true, "A user must have a first name!"],
        maxlength: [100, "The first name cannot exceed 100 characters.!"],
        minlength: [2, "The first name must have at least 2 characters.!"],
        trim: true,
      },
      last: {
        type: String,
        required: [true, "A user must have a last name!"],
        maxlength: [100, "The last name cannot exceed 100 characters.!"],
        minlength: [2, "The last name must have at least 2 characters.!"],
        trim: true,
      },
    },
    email: {
      type: String,
      required: [true, "A user must have a email address!"],
      maxlength: [100, "The email address cannot exceed 100 characters.!"],
      minlength: [5, "The email address must have at least 5 characters.!"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "A user must have a phone number!"],
      maxlength: [15, "The phone number cannot exceed 15 numbers.!"],
      minlength: [10, "The phone number must have at least 10 numbers.!"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "A user must have a password!"],
      maxlength: [1024, "The password cannot exceed 1024 characters.!"],
    },
    roleID: {
      type: Schema.Types.ObjectId,
      required: [true, "A user must have a role!"],
      ref: "Role",
    },
    location: {
      city: {
        type: String,
        default: "",
        maxlength: [100, "The city cannot exceed 100 characters.!"],
        trim: true,
      },
      area: {
        type: String,
        default: "",
        maxlength: [100, "The area cannot exceed 100 characters.!"],
        trim: true,
      },
      address: {
        type: String,
        default: "",
        maxlength: [500, "The address cannot exceed 500 characters.!"],
        trim: true,
      },
      postalCode: {
        type: String,
        default: "",
        maxlength: [10, "The postal code cannot exceed 10 characters.!"],
        trim: true,
      },
    },
    /* offerIDs: {
      type: [Schema.Types.ObjectId],
      ref: "Offer",
    }, */
    /* reviewIDs: {
      type: [Schema.Types.ObjectId],
      ref: "Review",
    }, */
    verificationCode: {
      type: Number,
      default: 0,
    },
    resetPasswordCode: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://i.ibb.co/ts8kZYd/admin.png",
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
