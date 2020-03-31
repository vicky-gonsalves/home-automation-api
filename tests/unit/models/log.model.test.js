import faker from 'faker';
import Log from '../../../src/models/log.model';

describe('Log Model', () => {
  describe('Log validation', () => {
    let newLogOne;
    let newLogTwo;
    const email = faker.internet.email();
    beforeEach(() => {
      newLogOne = {
        deviceId: faker.random.alphaNumeric(12),
        subDeviceId: faker.random.alphaNumeric(12),
        logName: 'MotorStarted',
        logDescription: 'Motor 1 started by Vicky',
        createdBy: email,
      };
      newLogTwo = {
        deviceId: faker.random.alphaNumeric(12),
        logName: 'MotorStopped',
        logDescription: 'Motor 1 stopped by Vicky',
        isDevLog: true,
        triggeredByDevice: true,
        createdBy: email,
      };
    });

    test('should correctly validate a valid log', async () => {
      await expect(new Log(newLogOne).validate()).resolves.toBeUndefined();
      await expect(new Log(newLogTwo).validate()).resolves.toBeUndefined();
    });

    test('should correctly update a valid log', async () => {
      const log = await new Log(newLogOne);
      await expect(log.save()).toBeDefined();
    });

    test('should throw a validation error if deviceId is invalid', async () => {
      newLogOne.deviceId = 'invalid';
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId length is greater than 20', async () => {
      newLogOne.deviceId = faker.random.alphaNumeric(21);
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId is missing', async () => {
      delete newLogOne.deviceId;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId is null', async () => {
      newLogOne.deviceId = null;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId is blank', async () => {
      newLogOne.deviceId = '';
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if deviceId is undefined', async () => {
      newLogOne.deviceId = undefined;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if subDeviceId length is greater than 20', async () => {
      newLogOne.subDeviceId = faker.random.alphaNumeric(21);
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if subDeviceId is invalid', async () => {
      newLogOne.subDeviceId = 'invalid';
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if logName length is greater than 20', async () => {
      newLogOne.subDeviceId = faker.random.alphaNumeric(21);
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if logName is missing', async () => {
      delete newLogOne.logName;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if logName is null', async () => {
      newLogOne.logName = null;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if logName is undefined', async () => {
      newLogOne.logName = undefined;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if logName is blank', async () => {
      newLogOne.logName = '';
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if logDescription is missing', async () => {
      delete newLogOne.logDescription;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if logDescription is null', async () => {
      newLogOne.logDescription = null;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if logDescription is undefined', async () => {
      newLogOne.logDescription = undefined;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if logDescription is blank', async () => {
      newLogOne.logDescription = '';
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if isDevLog is not Boolean', async () => {
      newLogOne.isDevLog = 'string';
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if createdBy is invalid', async () => {
      newLogOne.createdBy = 'invalidCreatedBy';
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if createdBy is null', async () => {
      newLogOne.createdBy = null;
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if createdBy is blank', async () => {
      newLogOne.createdBy = '';
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if triggeredByDevice is not boolean', async () => {
      newLogOne.triggeredByDevice = 'string';
      await expect(new Log(newLogOne).validate()).rejects.toThrow();
    });
  });

  describe('Log toJSON()', () => {
    let newLogOne;
    const email = faker.internet.email();
    beforeEach(() => {
      newLogOne = {
        deviceId: faker.random.alphaNumeric(12),
        subDeviceId: faker.random.alphaNumeric(12),
        logName: 'MotorStarted',
        logDescription: 'Motor 1 started by Vicky',
        createdBy: email,
      };
    });

    test('should return object when toJSON is called', () => {
      const log = new Log(newLogOne).toJSON();
      expect(log).toHaveProperty('_id');
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('deviceId');
      expect(log).toHaveProperty('subDeviceId');
      expect(log).toHaveProperty('logName');
      expect(log).toHaveProperty('logDescription');
      expect(log).toHaveProperty('isDevLog');
      expect(log).toHaveProperty('createdBy');
      expect(log).toHaveProperty('triggeredByDevice');
    });

    test('should return object when transform is called', () => {
      const log = new Log(newLogOne).transform();
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('deviceId');
      expect(log).toHaveProperty('subDeviceId');
      expect(log).toHaveProperty('logName');
      expect(log).toHaveProperty('logDescription');
      expect(log).toHaveProperty('isDevLog');
      expect(log).toHaveProperty('createdBy');
      expect(log).toHaveProperty('triggeredByDevice');
    });
  });
});
