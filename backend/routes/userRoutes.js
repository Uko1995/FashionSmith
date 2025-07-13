import express from "express";
import users from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", users.signUp);
router.get("/emailVerification/:uniqueString", users.emailVerification);
router.delete("/removeUsers", users.deleteUsers);
router.post("/login", users.login);
router.post("/forgotPassword", users.isAuthenticated, users.forgotPassword);
router.get("/resetPassword/:uniqueString", users.resetPasswordGet);
router.post("/resetPassword", users.resetPasswordPost);
router.get("/logout", users.isAuthenticated, users.logout);
router.delete("/removeUser", users.isAuthenticated, users.removeUser);
router.get("/getUser", users.isAuthenticated, users.getUser);
router.put("/updateUserInfo", users.isAuthenticated, users.updateUserInfo);
router.post("/addMeasurement", users.isAuthenticated, users.addMeasurement);
router.get("/getMeasurement", users.isAuthenticated, users.displayMeasurement);
router.put(
  "/updateMeasurement",
  users.isAuthenticated,
  users.updateMeasurement
);
router.delete(
  "/removeMeasurement",
  users.isAuthenticated,
  users.removeMeasurement
);
router.post("/newOrder", users.isAuthenticated, users.createOrder);
router.get("/getOrder", users.isAuthenticated, users.showOrder);
router.get("/updateOrder", users.isAuthenticated, users.updateOrder);
router.delete(
  "/removeOrder/:orderId",
  users.isAuthenticated,
  users.removeOrder
);

export default router;
