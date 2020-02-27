import express from 'express';
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../../controllers/user.controller';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import {
  createUserValidation,
  deleteUserValidation,
  getUsersValidation,
  getUserValidation,
  updateUserValidation,
} from '../../validations/user.validation';

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(createUserValidation), createUser)
  .get(auth('getUsers'), validate(getUsersValidation), getUsers);

router
  .route('/:userId')
  .get(auth('getUsers'), validate(getUserValidation), getUser)
  .patch(auth('manageUsers'), validate(updateUserValidation), updateUser)
  .delete(auth('manageUsers'), validate(deleteUserValidation), deleteUser);

module.exports = router;
