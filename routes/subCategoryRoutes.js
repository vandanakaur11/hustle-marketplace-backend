const router = require("express").Router();
const {
  getAllSubCategories,
  createSubCategory,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategoryController");

router.route("/").get(getAllSubCategories).post(createSubCategory);
router
  .route("/:id")
  .get(getSubCategory)
  .patch(updateSubCategory)
  .delete(deleteSubCategory);

module.exports = router;
