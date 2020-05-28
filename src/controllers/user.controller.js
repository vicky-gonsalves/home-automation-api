import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersCountService,
  getUsersService,
  updateUserService,
} from '../services/user.service';

const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const createUser = catchAsync(async (req, res) => {
  const user = await createUserService(req.body);
  res.status(httpStatus.CREATED).send(user.transform());
});

const getUsers = catchAsync(async (req, res) => {
  const _users = await getUsersService(req.query);
  const count = await getUsersCountService(req.query);
  const users = _users.map(user => user.transform(true));
  res.send({ users, count });
});

const getUser = catchAsync(async (req, res) => {
  const user = await getUserByIdService(req.params.userId);
  res.send(user.transform(true));
});

const updateUser = catchAsync(async (req, res) => {
  req.body._updatedBy = req.user.email;
  const user = await updateUserService(req.params.userId, req.body);
  res.send(user.transform());
});

const deleteUser = catchAsync(async (req, res) => {
  await deleteUserService(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
