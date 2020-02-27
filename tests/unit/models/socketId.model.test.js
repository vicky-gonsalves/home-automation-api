import faker from 'faker';
import { socketUserType, socketUserIdType } from '../../../src/config/socketUser';
import SocketId from '../../../src/models/socketId.model';

describe('SocketId Model', () => {
  describe('SocketId validation', () => {
    let newSocketIdOne;
    let newSocketIdTwo;
    beforeEach(() => {
      newSocketIdOne = {
        type: socketUserType[0],
        idType: socketUserIdType[0],
        socketId: faker.random.uuid(),
        bindedTo: faker.random.uuid(),
      };
      newSocketIdTwo = {
        type: socketUserType[0],
        idType: socketUserIdType[0],
        socketId: faker.random.uuid(),
        bindedTo: faker.internet.email().toLowerCase(),
      };
    });

    test('should correctly validate a valid socketId', async () => {
      await expect(new SocketId(newSocketIdOne).validate()).resolves.toBeUndefined();
      await expect(new SocketId(newSocketIdTwo).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if type is invalid', async () => {
      newSocketIdOne.type = 'invalid';
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if type is missing', async () => {
      delete newSocketIdOne.type;
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if idType is invalid', async () => {
      newSocketIdOne.idType = 'invalid';
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if idType is missing', async () => {
      delete newSocketIdOne.idType;
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if socketId is missing', async () => {
      delete newSocketIdOne.socketId;
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if socketId is null', async () => {
      newSocketIdOne.socketId = null;
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if socketId is undefined', async () => {
      newSocketIdOne.socketId = undefined;
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if socketId is blank', async () => {
      newSocketIdOne.socketId = '';
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if bindedTo is missing', async () => {
      delete newSocketIdOne.bindedTo;
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if bindedTo is null', async () => {
      newSocketIdOne.bindedTo = null;
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if bindedTo is undefined', async () => {
      newSocketIdOne.bindedTo = undefined;
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if bindedTo is blank', async () => {
      newSocketIdOne.bindedTo = '';
      await expect(new SocketId(newSocketIdOne).validate()).rejects.toThrow();
    });
  });

  describe('SocketId toJSON()', () => {
    let newSocketIdOne;
    beforeEach(() => {
      newSocketIdOne = {
        type: socketUserType[0],
        idType: socketUserIdType[0],
        socketId: faker.random.uuid(),
      };
    });

    test('should return id when toJSON is called', () => {
      expect(new SocketId(newSocketIdOne).toJSON()).toHaveProperty('id');
    });

    test('should return id when transform is called', () => {
      expect(new SocketId(newSocketIdOne).transform()).toHaveProperty('id');
    });
  });
});
