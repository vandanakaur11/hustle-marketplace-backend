const asyncHandler = require("express-async-handler");
const Category = require("./../models/categorySchema");

exports.getAllCategories = asyncHandler(async (req, res) => {
  const allCategories = await Category.find();

  allCategories &&
    res.status(200).json({
      status: "success",
      results: allCategories.length,
      data: { categories: allCategories },
    });
});

exports.getCategory = asyncHandler(async (req, res) => {
  const existingCategory = await Category.findById(req.params.id);

  existingCategory &&
    res
      .status(200)
      .json({ status: "success", data: { category: existingCategory } });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;

  // Check existing user
  const existingCategory = await Category.findOne({ category });

  if (existingCategory) {
    res.status(400);
    throw new Error(`This category '${category}' already exist!`);
  }

  // Validate fields
  if (!category) {
    res.status(400);
    throw new Error("Category field must be filled!");
  }

  const newCategory = await Category.create(req.body);

  newCategory &&
    res.status(201).json({
      status: "success",
      message: `${category} category created successfully.`,
    });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .json({ status: "success", data: { category: updatedCategory } });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
