const { model, Schema } = require("mongoose");

const subCategorySchema = new Schema(
  {
    categoryID: {
      type: Schema.Types.ObjectId,
      required: [true, "A sub category must have a category!"],
      ref: "Category",
    },
    subCategory: {
      type: String,
      required: [true, "A sub category must have a sub category name!"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = model("SubCategory", subCategorySchema);
