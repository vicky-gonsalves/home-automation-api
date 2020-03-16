import faker from 'faker';
import { deviceType, deviceVariant } from '../../../src/config/device';
import Device from '../../../src/models/device.model';

describe('Device Model', () => {
  describe('Device validation', () => {
    let newDevice;
    beforeEach(() => {
      const email = faker.internet.email();
      newDevice = {
        deviceId: faker.random.alphaNumeric(10),
        name: faker.name.firstName(),
        type: faker.random.arrayElement(deviceType),
        variant: faker.random.arrayElement(deviceVariant),
        deviceOwner: email,
        registeredAt: new Date().toISOString(),
        createdBy: email,
        updatedBy: email,
      };
    });

    test('should correctly validate a valid device', async () => {
      await expect(new Device(newDevice).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if deviceId is invalid', async () => {
      newDevice.deviceId = 'invalid Device id';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is less than 10', async () => {
      newDevice.deviceId = faker.random.alphaNumeric(9);
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is greater than 20', async () => {
      newDevice.deviceId = faker.random.alphaNumeric(21);
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if name is invalid', async () => {
      newDevice.name = 'invalid@Device#id';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if name length is less than 1', async () => {
      newDevice.name = '';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if name length is greater than 20', async () => {
      newDevice.name = faker.random.alphaNumeric(21);
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if type is invalid', async () => {
      newDevice.type = 'invalidType';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if variant is invalid', async () => {
      newDevice.variant = 'invalidVariant';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if isDisabled is invalid', async () => {
      newDevice.isDisabled = 'invalidType';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceOwner is invalid', async () => {
      newDevice.deviceOwner = 'invalidDeviceOwner';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if registeredAt is invalid', async () => {
      newDevice.registeredAt = 'invalidRegisteredAt';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if createdBy is invalid', async () => {
      newDevice.createdBy = 'invalidCreatedBy';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if updatedBy is invalid', async () => {
      newDevice.updatedBy = 'invalidUpdatedBy';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });
  });

  describe('Device toJSON()', () => {
    let newDevice;
    beforeEach(() => {
      const email = faker.internet.email();
      newDevice = {
        deviceId: faker.random.alphaNumeric(10),
        name: faker.name.firstName(),
        type: faker.random.arrayElement(deviceType),
        variant: faker.random.arrayElement(deviceVariant),
        deviceOwner: email,
        registeredAt: new Date().toISOString(),
        createdBy: email,
      };
    });

    test('should return id when toJSON is called', () => {
      expect(new Device(newDevice).toJSON()).toHaveProperty('id');
    });

    test('should return id when transform is called', () => {
      expect(new Device(newDevice).transform()).toHaveProperty('id');
    });
  });
});
