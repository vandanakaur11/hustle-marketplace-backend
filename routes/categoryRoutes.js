const router = require("express").Router();
const {
  getAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("./../controllers/categoryController");

router.route("/").get(getAllCategories).post(createCategory);
router
  .route("/:id")
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

module.exports = router;
