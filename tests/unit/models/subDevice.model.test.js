const faker = require('faker');
const { subDeviceType } = require('../../../src/config/device');

const { SubDevice } = require('../../../src/models');

describe('SubDevice Model', () => {
  describe('SubDevice validation', () => {
    let newSubDevice;
    beforeEach(() => {
      const email = faker.internet.email();
      newSubDevice = {
        deviceId: faker.random.alphaNumeric(16),
        subDeviceId: faker.random.alphaNumeric(16),
        name: faker.name.firstName(),
        type: faker.random.arrayElement(subDeviceType),
        createdBy: email,
        updatedBy: email,
      };
    });

    test('should correctly validate a valid subDevice', async () => {
      await expect(new SubDevice(newSubDevice).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if deviceId is invalid', async () => {
      newSubDevice.deviceId = 'invalid SubDevice id';
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is less than 16', async () => {
      newSubDevice.deviceId = faker.random.alphaNumeric(14);
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is greater than 20', async () => {
      newSubDevice.deviceId = faker.random.alphaNumeric(21);
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if subDeviceId is invalid', async () => {
      newSubDevice.subDeviceId = 'invalid SubDevice id';
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if subDeviceId length is less than 16', async () => {
      newSubDevice.subDeviceId = faker.random.alphaNumeric(14);
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if subDeviceId length is greater than 20', async () => {
      newSubDevice.subDeviceId = faker.random.alphaNumeric(21);
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if name is invalid', async () => {
      newSubDevice.name = 'invalid@SubDevice#id';
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if name length is less than 1', async () => {
      newSubDevice.name = '';
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if name length is greater than 20', async () => {
      newSubDevice.name = faker.random.alphaNumeric(21);
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if type is invalid', async () => {
      newSubDevice.type = 'invalidType';
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if isDisabled is invalid', async () => {
      newSubDevice.isDisabled = 'invalidType';
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if createdBy is invalid', async () => {
      newSubDevice.createdBy = 'invalidCreatedBy';
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });

    test('should throw a validation error if updatedBy is invalid', async () => {
      newSubDevice.updatedBy = 'invalidUpdatedBy';
      await expect(new SubDevice(newSubDevice).validate()).rejects.toThrow();
    });
  });

  describe('SubDevice toJSON()', () => {
    let newSubDevice;
    beforeEach(() => {
      const email = faker.internet.email();
      newSubDevice = {
        deviceId: faker.random.alphaNumeric(16),
        subDeviceId: faker.random.alphaNumeric(16),
        name: faker.name.firstName(),
        type: faker.random.arrayElement(subDeviceType),
        createdBy: email,
        updatedBy: email,
      };
    });

    test('should return id when toJSON is called', () => {
      expect(new SubDevice(newSubDevice).toJSON()).toHaveProperty('id');
    });

    test('should return id when transform is called', () => {
      expect(new SubDevice(newSubDevice).transform()).toHaveProperty('id');
    });
  });
});
