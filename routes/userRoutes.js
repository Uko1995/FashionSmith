import express from 'express';
import users from '../controllers/userController.js';

const app = express();
const router = express.Router();

router.post('/signup', users.signUp);
//router.get('/displayUsers', getUsers);
//router.delete('/removeUsers', deleteUsers);
router.post('/login', users.login);
router.get('/logout', users.isAuthenticated, users.logout);
router.delete('/removeUser', users.isAuthenticated, users.removeUser);
router.put('/updateUserInfo', users.isAuthenticated, users.updateUserInfo);
router.post('/addMeasurement', users.isAuthenticated, users.addMeasurement);
router.get('/getMeasurement', users.isAuthenticated, users.displayMeasurement);
router.put('/updateMeasurement', users.isAuthenticated, users.updateMeasurement);
router.delete('/removeMeasurement', users.isAuthenticated, users.removeMeasurement);

export default router;