'use strict';

import faker from 'faker';
import SocketId from '../models/socketId.model';
import logger from '../config/logger';

const socketIds = [
  {
    type: 'device',
    idType: 'deviceId',
    bindedTo: 'tank000000000001',
    socketId: faker.random.uuid(),
  },
  {
    type: 'device',
    idType: 'deviceId',
    bindedTo: 'bedroom000000001',
    socketId: faker.random.uuid(),
  },
  {
    type: 'device',
    idType: 'deviceId',
    bindedTo: 'outdoor000000001',
    socketId: faker.random.uuid(),
  },
  {
    type: 'user',
    idType: 'email',
    bindedTo: 'johndoe@email.com',
    socketId: faker.random.uuid(),
  },
  {
    type: 'user',
    idType: 'email',
    bindedTo: 'johndoe2@email.com',
    socketId: faker.random.uuid(),
  },
  {
    type: 'user',
    idType: 'email',
    bindedTo: 'johndoe2@email.com',
    socketId: faker.random.uuid(),
  },
  {
    type: 'user',
    idType: 'email',
    bindedTo: 'vicky.gonsalves@outlook.com',
    socketId: faker.random.uuid(),
  },
];

const SeedSocketIdFn = async () => {
  await SocketId.find({}).deleteMany();
  await SocketId.create(socketIds);
  logger.info('Socket Id Seed Done');
};

module.exports = SeedSocketIdFn;
