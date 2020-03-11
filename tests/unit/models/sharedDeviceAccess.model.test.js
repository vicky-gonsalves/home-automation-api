import faker from 'faker';
import SharedDeviceAccess from '../../../src/models/sharedDeviceAccess.model';
import { deviceOne } from '../../fixtures/device.fixture';
import { userOne } from '../../fixtures/user.fixture';

describe('SharedDeviceAccess Model', () => {
  describe('SharedDeviceAccess validation', () => {
    let newAccess;
    beforeEach(() => {
      const email1 = deviceOne.deviceOwner;
      const email2 = userOne.email;
      newAccess = {
        deviceId: deviceOne.deviceId,
        email: email2,
        sharedBy: email1,
      };
    });

    test('should correctly validate a valid sharedDeviceAccess', async () => {
      await expect(new SharedDeviceAccess(newAccess).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if deviceId is invalid', async () => {
      newAccess.deviceId = 'invalid SharedDeviceAccess id';
      await expect(new SharedDeviceAccess(newAccess).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is less than 10', async () => {
      newAccess.deviceId = faker.random.alphaNumeric(9);
      await expect(new SharedDeviceAccess(newAccess).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is greater than 20', async () => {
      newAccess.deviceId = faker.random.alphaNumeric(21);
      await expect(new SharedDeviceAccess(newAccess).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId is missing', async () => {
      delete newAccess.deviceId;
      await expect(new SharedDeviceAccess(newAccess).validate()).rejects.toThrow();
    });

    test('should throw a validation error if email is invalid', async () => {
      newAccess.email = 'invalidEmail';
      await expect(new SharedDeviceAccess(newAccess).validate()).rejects.toThrow();
    });

    test('should throw a validation error if email is missing', async () => {
      delete newAccess.email;
      await expect(new SharedDeviceAccess(newAccess).validate()).rejects.toThrow();
    });

    test('should throw a validation error if sharedBy is invalid', async () => {
      newAccess.sharedBy = 'invalidEmail';
      await expect(new SharedDeviceAccess(newAccess).validate()).rejects.toThrow();
    });

    test('should throw a validation error if sharedBy is missing', async () => {
      delete newAccess.sharedBy;
      await expect(new SharedDeviceAccess(newAccess).validate()).rejects.toThrow();
    });
  });

  describe('SharedDeviceAccess toJSON()', () => {
    let newAccess;
    beforeEach(() => {
      const email1 = deviceOne.deviceOwner;
      const email2 = userOne.email;
      newAccess = {
        deviceId: deviceOne.deviceId,
        email: email2,
        sharedBy: email1,
      };
    });

    test('should return id when toJSON is called', () => {
      expect(new SharedDeviceAccess(newAccess).toJSON()).toHaveProperty('id');
    });

    test('should return id when transform is called', () => {
      expect(new SharedDeviceAccess(newAccess).transform()).toHaveProperty('id');
    });
  });
});
