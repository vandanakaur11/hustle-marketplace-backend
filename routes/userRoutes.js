const router = require("express").Router();
const {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  loginUser,
  updateUser,
  verifyUser,
  changePassword,
  forgotPassword,
  updatePassword,
  uploadProfile,
} = require("../controllers/userController");

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
router.route("/:id/profile").patch(uploadProfile);
router.route("/:id/change-password").patch(changePassword);
router.route("/forgot-password").post(forgotPassword);
router.route("/:id/update-password").patch(updatePassword);
router.route("/login").post(loginUser);
router.route("/:id/verify").patch(verifyUser);

module.exports = router;
