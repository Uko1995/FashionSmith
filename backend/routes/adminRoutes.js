import admin from '../controllers/adminController.js';
import users from '../controllers/userController.js';
import express from 'express';
const router = express.Router();

router.get('/displayOrders', users.isAuthenticated, admin.isAdmin, admin.getOrders);
router.get('/displayUsers', users.isAuthenticated, admin.isAdmin, admin.getUsers);
//router.put('/updateUser/:userId', admin.updateUser);
//router.delete('/removeUser/:userId', admin.deleteUser);


export default router;