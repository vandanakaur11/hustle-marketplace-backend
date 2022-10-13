const asyncHandler = require("express-async-handler");
const SubCategory = require("./../models/subCategorySchema");

exports.getAllSubCategories = asyncHandler(async (req, res) => {
  const allSubCategories = await SubCategory.find();

  allSubCategories &&
    res.status(200).json({
      status: "success",
      results: allSubCategories.length,
      data: { subCategories: allSubCategories },
    });
});

exports.getSubCategory = asyncHandler(async (req, res) => {
  const existingSubCategory = await SubCategory.findById(req.params.id);

  const subCategoryData = await SubCategory.aggregate([
    {
      $match: {
        _id: existingSubCategory._id,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryID",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $project: {
        categoryID: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        "category._id": 0,
        "category.createdAt": 0,
        "category.updatedAt": 0,
        "category.__v": 0,
      },
    },
  ]);

  existingSubCategory &&
    subCategoryData &&
    res
      .status(200)
      .json({ status: "success", data: { subCategory: subCategoryData } });
});

exports.createSubCategory = asyncHandler(async (req, res) => {
  const { categoryID, subCategory } = req.body;

  // Check existing user
  const existingSubCategory = await SubCategory.findOne({ subCategory });

  if (existingSubCategory) {
    res.status(400);
    throw new Error(`This sub category '${subCategory}' already exist!`);
  }

  // Validate fields
  if (!categoryID || !subCategory) {
    res.status(400);
    throw new Error("All fields must be filled!");
  }

  const newSubCategory = await SubCategory.create(req.body);

  newSubCategory &&
    res.status(201).json({
      status: "success",
      message: `${subCategory} sub category created successfully.`,
    });
});

exports.updateSubCategory = asyncHandler(async (req, res) => {
  const updatedSubCategory = await SubCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .json({ status: "success", data: { subCategory: updatedSubCategory } });
});

exports.deleteSubCategory = asyncHandler(async (req, res) => {
  await SubCategory.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
