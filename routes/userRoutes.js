import express from 'express';
import users from '../controllers/userController.js';

const router = express.Router();

router.post('/signup', users.signUp);
router.post('/login', users.login);
router.get('/logout', users.isAuthenticated, users.logout);
router.delete('/removeUser', users.isAuthenticated, users.removeUser);
router.put('/updateUserInfo', users.isAuthenticated, users.updateUserInfo);
router.post('/addMeasurement', users.isAuthenticated, users.addMeasurement);
router.get('/getMeasurement', users.isAuthenticated, users.displayMeasurement);
router.put('/updateMeasurement', users.isAuthenticated, users.updateMeasurement);
router.delete('/removeMeasurement', users.isAuthenticated, users.removeMeasurement);
router.post('/newOrder', users.isAuthenticated, users.createOrder);
router.get('/getOrder', users.isAuthenticated, users.showOrder);
router.get('/updateOrder', users.isAuthenticated, users.updateOrder);
router.delete('/removeOrder', users.isAuthenticated, users.removeOrder);

export default router;