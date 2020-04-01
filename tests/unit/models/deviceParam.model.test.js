import faker from 'faker';
import DeviceParam from '../../../src/models/deviceParam.model';

describe('DeviceParam Model', () => {
  describe('DeviceParam validation', () => {
    let newDeviceParam;
    beforeEach(() => {
      const email = faker.internet.email();
      newDeviceParam = {
        deviceId: faker.random.alphaNumeric(10),
        paramName: faker.name.firstName(),
        paramValue: faker.random.alphaNumeric(50),
        createdBy: email,
        updatedBy: email,
      };
    });

    test('should correctly validate a valid deviceParam', async () => {
      await expect(new DeviceParam(newDeviceParam).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if deviceId is invalid', async () => {
      newDeviceParam.deviceId = 'invalid device id';
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is less than 10', async () => {
      newDeviceParam.deviceId = faker.random.alphaNumeric(9);
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is greater than 20', async () => {
      newDeviceParam.deviceId = faker.random.alphaNumeric(21);
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName is invalid', async () => {
      newDeviceParam.paramName = 'invalid@DeviceParam#id';
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName length is less than 1', async () => {
      newDeviceParam.paramName = '';
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName length is greater than 50', async () => {
      newDeviceParam.paramName = faker.random.alphaNumeric(51);
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramValue is empty', async () => {
      newDeviceParam.paramValue = null;
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramValue is blank string', async () => {
      newDeviceParam.paramValue = '';
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should accept object in paramValue', async () => {
      newDeviceParam.paramValue = {};
      await expect(new DeviceParam(newDeviceParam).validate()).resolves.toBeUndefined();
    });

    test('should accept number in paramValue', async () => {
      newDeviceParam.paramValue = 100;
      await expect(new DeviceParam(newDeviceParam).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if isDisabled is invalid', async () => {
      newDeviceParam.isDisabled = 'invalidType';
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if createdBy is invalid', async () => {
      newDeviceParam.createdBy = 'invalidCreatedBy';
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if updatedBy is invalid', async () => {
      newDeviceParam.updatedBy = 'invalidUpdatedBy';
      await expect(new DeviceParam(newDeviceParam).validate()).rejects.toThrow();
    });
  });

  describe('DeviceParam toJSON()', () => {
    let newDeviceParam;
    beforeEach(() => {
      const email = faker.internet.email();
      newDeviceParam = {
        deviceId: faker.random.alphaNumeric(10),
        paramName: faker.name.firstName(),
        paramValue: faker.random.alphaNumeric(50),
        createdBy: email,
        updatedBy: email,
      };
    });

    test('should return id when toJSON is called', () => {
      expect(new DeviceParam(newDeviceParam).toJSON()).toHaveProperty('id');
    });

    test('should return id when transform is called', () => {
      expect(new DeviceParam(newDeviceParam).transform()).toHaveProperty('id');
    });
  });
});
