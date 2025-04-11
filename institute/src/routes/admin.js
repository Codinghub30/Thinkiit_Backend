const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const {
  authenticate,
  checkInstituteAccess,
} = require("../middlewares/authMiddleware");

//  Create Admin
router.post("/", adminController.createAdmin);

//update admin
router.post("/admin/:id", adminController.updateAdmin);

//  Get All Admins
// router.get("/byinstituteID/:instituteId", adminController.getAllAdmins);

//  Get Admin by ID
router.get("/:id", adminController.getAdminById);

//  Assign rights to Admin
router.put("/:id/assign-rights", adminController.assignAdminrights);

//  Admin Login (JWT)
router.post("/login", adminController.loginAdmin);

//  Delete Admin
router.delete("/:id", adminController.deleteAdmin);

//  Change Password (After login)
router.put("/change-password", adminController.changePassword);

//  Forgot Password (Send Reset Email)
router.post("/forgot-password", adminController.forgotPassword);

//  Reset Password (Using Token)
router.post("/reset-password/:token", adminController.resetPassword);
router.get(
  "/admins/:instituteId",
  // authenticate,
  // checkInstituteAccess,
  adminController.getAllAdmins
);

module.exports = router;
