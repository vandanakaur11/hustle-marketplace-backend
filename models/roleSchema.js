const { model, Schema } = require("mongoose");

const roleSchema = new Schema(
  {
    role: {
      type: String,
      required: [true, "A role must have a role name!"],
      enum: ["admin", "buyer", "seller"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Role", roleSchema);
