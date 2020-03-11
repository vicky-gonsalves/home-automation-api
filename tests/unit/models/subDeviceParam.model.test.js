import faker from 'faker';
import SubDeviceParam from '../../../src/models/subDeviceParam.model';

describe('SubDeviceParam Model', () => {
  describe('SubDeviceParam validation', () => {
    let newSubDeviceParam;
    beforeEach(() => {
      const email = faker.internet.email();
      newSubDeviceParam = {
        deviceId: faker.random.alphaNumeric(10),
        subDeviceId: faker.random.alphaNumeric(10),
        paramName: faker.name.firstName(),
        paramValue: faker.random.alphaNumeric(50),
        createdBy: email,
        updatedBy: email,
      };
    });

    test('should correctly validate a valid subDeviceParam', async () => {
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if deviceId is invalid', async () => {
      newSubDeviceParam.deviceId = 'invalid device id';
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is less than 10', async () => {
      newSubDeviceParam.deviceId = faker.random.alphaNumeric(9);
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is greater than 20', async () => {
      newSubDeviceParam.deviceId = faker.random.alphaNumeric(21);
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if subDeviceId is invalid', async () => {
      newSubDeviceParam.subDeviceId = 'invalid subDevice id';
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if subDeviceId length is less than 10', async () => {
      newSubDeviceParam.subDeviceId = faker.random.alphaNumeric(9);
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if subDeviceId length is greater than 20', async () => {
      newSubDeviceParam.subDeviceId = faker.random.alphaNumeric(21);
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName is invalid', async () => {
      newSubDeviceParam.paramName = 'invalid@SubDeviceParam#id';
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName length is less than 1', async () => {
      newSubDeviceParam.paramName = '';
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName length is greater than 50', async () => {
      newSubDeviceParam.paramName = faker.random.alphaNumeric(51);
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramValue is empty', async () => {
      newSubDeviceParam.paramValue = null;
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramValue is blank string', async () => {
      newSubDeviceParam.paramValue = '';
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should accept object in paramValue', async () => {
      newSubDeviceParam.paramValue = {};
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).resolves.toBeUndefined();
    });

    test('should accept number in paramValue', async () => {
      newSubDeviceParam.paramValue = 100;
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if isDisabled is invalid', async () => {
      newSubDeviceParam.isDisabled = 'invalidType';
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if createdBy is invalid', async () => {
      newSubDeviceParam.createdBy = 'invalidCreatedBy';
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });

    test('should throw a validation error if updatedBy is invalid', async () => {
      newSubDeviceParam.updatedBy = 'invalidUpdatedBy';
      await expect(new SubDeviceParam(newSubDeviceParam).validate()).rejects.toThrow();
    });
  });

  describe('SubDeviceParam toJSON()', () => {
    let newSubDeviceParam;
    beforeEach(() => {
      const email = faker.internet.email();
      newSubDeviceParam = {
        deviceId: faker.random.alphaNumeric(10),
        subDeviceId: faker.random.alphaNumeric(10),
        paramName: faker.name.firstName(),
        paramValue: faker.random.alphaNumeric(50),
        createdBy: email,
        updatedBy: email,
      };
    });

    test('should return id when toJSON is called', () => {
      expect(new SubDeviceParam(newSubDeviceParam).toJSON()).toHaveProperty('id');
    });

    test('should return id when transform is called', () => {
      expect(new SubDeviceParam(newSubDeviceParam).transform()).toHaveProperty('id');
    });
  });
});
