const router = require("express").Router();
const {
  createRole,
  deleteRole,
  getAllRoles,
  getRole,
  updateRole,
} = require("./../controllers/roleController");

router.route("/").get(getAllRoles).post(createRole);
router.route("/:id").get(getRole).patch(updateRole).delete(deleteRole);

module.exports = router;
