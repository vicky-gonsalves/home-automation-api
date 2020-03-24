import faker from 'faker';
import { idType, settingType } from '../../../src/config/setting';
import Setting from '../../../src/models/setting.model';

describe('Setting Model', () => {
  describe('Setting validation', () => {
    let newSettingOne;
    let newSettingTwo;
    const email = faker.internet.email();
    beforeEach(() => {
      newSettingOne = {
        type: settingType[0],
        idType: idType[0],
        bindedTo: faker.random.uuid(),
        paramName: 'preferredMotor',
        paramValue: faker.random.uuid(),
        createdBy: email,
        updatedBy: email,
      };
      newSettingTwo = {
        type: settingType[1],
        idType: idType[1],
        parent: faker.random.alphaNumeric(12),
        bindedTo: faker.random.uuid(),
        paramName: 'someParam',
        paramValue: 'someValue',
        createdBy: email,
        updatedBy: email,
      };
    });

    test('should correctly validate a valid setting', async () => {
      await expect(new Setting(newSettingOne).validate()).resolves.toBeUndefined();
      await expect(new Setting(newSettingTwo).validate()).resolves.toBeUndefined();
    });

    test('should correctly update a valid setting', async () => {
      const setting = await new Setting(newSettingOne);
      setting._updatedBy = email;
      await expect(setting.save()).toBeDefined();
    });

    test('should throw a validation error if parent is invalid', async () => {
      newSettingOne.parent = 'invalid';
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if type is invalid', async () => {
      newSettingOne.type = 'invalid';
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if type is missing', async () => {
      delete newSettingOne.type;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if idType is invalid', async () => {
      newSettingOne.idType = 'invalid';
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if idType is missing', async () => {
      delete newSettingOne.idType;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if bindedTo is missing', async () => {
      delete newSettingOne.bindedTo;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if bindedTo is null', async () => {
      newSettingOne.bindedTo = null;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if bindedTo is undefined', async () => {
      newSettingOne.bindedTo = undefined;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if bindedTo is blank', async () => {
      newSettingOne.bindedTo = '';
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName is missing', async () => {
      delete newSettingOne.paramName;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName is null', async () => {
      newSettingOne.paramName = null;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName is undefined', async () => {
      newSettingOne.paramName = undefined;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramName is blank', async () => {
      newSettingOne.paramName = '';
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramValue is missing', async () => {
      delete newSettingOne.paramValue;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramValue is null', async () => {
      newSettingOne.paramValue = null;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramValue is undefined', async () => {
      newSettingOne.paramValue = undefined;
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if paramValue is blank', async () => {
      newSettingOne.paramValue = '';
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if isDisabled is invalid', async () => {
      newSettingOne.isDisabled = 'invalidType';
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if createdBy is invalid', async () => {
      newSettingOne.createdBy = 'invalidCreatedBy';
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });

    test('should throw a validation error if updatedBy is invalid', async () => {
      newSettingOne.updatedBy = 'invalidUpdatedBy';
      await expect(new Setting(newSettingOne).validate()).rejects.toThrow();
    });
  });

  describe('Setting toJSON()', () => {
    let newSettingOne;
    let newSettingTwo;
    const email = faker.internet.email();
    beforeEach(() => {
      newSettingOne = {
        type: settingType[0],
        idType: idType[0],
        bindedTo: faker.random.uuid(),
        paramName: 'preferredMotor',
        paramValue: faker.random.uuid(),
        createdBy: email,
        updatedBy: email,
      };
      newSettingTwo = {
        type: settingType[1],
        idType: idType[1],
        parent: faker.random.alphaNumeric(12),
        bindedTo: faker.random.uuid(),
        paramName: 'someParam',
        paramValue: 'someValue',
        createdBy: email,
        updatedBy: email,
      };
    });

    test('should return object when toJSON is called', () => {
      const setting = new Setting(newSettingOne).toJSON();
      expect(setting).toHaveProperty('_id');
      expect(setting).toHaveProperty('id');
      expect(setting).toHaveProperty('idType');
      expect(setting).toHaveProperty('bindedTo');
      expect(setting).toHaveProperty('paramName');
      expect(setting).toHaveProperty('paramValue');
      expect(setting).toHaveProperty('isDisabled');
      expect(setting).toHaveProperty('createdBy');
      expect(setting).toHaveProperty('updatedBy');
    });

    test('should return object when transform is called', () => {
      const setting = new Setting(newSettingOne).transform();
      expect(setting).toHaveProperty('id');
      expect(setting).toHaveProperty('idType');
      expect(setting).toHaveProperty('bindedTo');
      expect(setting).toHaveProperty('paramName');
      expect(setting).toHaveProperty('paramValue');
      expect(setting).toHaveProperty('isDisabled');
      expect(setting).toHaveProperty('createdBy');
      expect(setting).toHaveProperty('updatedBy');
    });

    test('should return object with parent when transform is called', () => {
      const setting = new Setting(newSettingTwo).transform();
      expect(setting).toHaveProperty('id');
      expect(setting).toHaveProperty('idType');
      expect(setting).toHaveProperty('bindedTo');
      expect(setting).toHaveProperty('parent');
      expect(setting).toHaveProperty('paramName');
      expect(setting).toHaveProperty('paramValue');
      expect(setting).toHaveProperty('isDisabled');
      expect(setting).toHaveProperty('createdBy');
      expect(setting).toHaveProperty('updatedBy');
    });
  });
});
