const asyncHandler = require("express-async-handler");
const Role = require("./../models/roleSchema");

exports.getAllRoles = asyncHandler(async (req, res) => {
  const allRoles = await Role.find();

  allRoles &&
    res.status(200).json({
      status: "success",
      results: allRoles.length,
      data: { roles: allRoles },
    });
});

exports.getRole = asyncHandler(async (req, res) => {
  const existingRole = await Role.findById(req.params.id);

  existingRole &&
    res.status(200).json({ status: "success", data: { role: existingRole } });
});

exports.createRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  // Check existing user
  const existingRole = await Role.findOne({ role });

  if (existingRole) {
    res.status(400);
    throw new Error(`This role '${role}' already exist!`);
  }

  // Validate fields
  if (!role) {
    res.status(400);
    throw new Error("Role field must be filled!");
  }

  const newRole = await Role.create(req.body);

  newRole &&
    res.status(201).json({
      status: "success",
      message: `${role} role created successfully.`,
    });
});

exports.updateRole = asyncHandler(async (req, res) => {
  const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { role: updatedRole } });
});

exports.deleteRole = asyncHandler(async (req, res) => {
  await Role.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
