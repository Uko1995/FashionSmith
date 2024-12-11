import express from 'express';
import { signUp, getUsers, deleteUsers, login, logout, isAuthenticated, removeUser, updateUserInfo} from '../controllers/userController.js';

const app = express();
const router = express.Router();

router.post('/signup', signUp);
//router.get('/displayUsers', getUsers);
//router.delete('/removeUsers', deleteUsers);
router.post('/login', login);
router.get('/logout', isAuthenticated, logout);
router.delete('/removeUser',isAuthenticated, removeUser);
router.put('/updateUserInfo', isAuthenticated, updateUserInfo);

export default router;