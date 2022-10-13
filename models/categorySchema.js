const { model, Schema } = require("mongoose");

const categorySchema = new Schema(
  {
    category: {
      type: String,
      required: [true, "A category must have a category name!"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Category", categorySchema);
