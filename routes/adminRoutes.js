import admin from '..controllers/adminController.js';
import express from 'express';
const router = express.Router();

router.get('/admin', admin.getAdmin);
router.get('/displayOrders', admin.getOrders);
router.get('/displayUsers', admin.getUsers);
router.delete('/removeUser/:userId', admin.deleteUser);