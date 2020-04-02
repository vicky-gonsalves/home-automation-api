import io from 'socket.io-client';
import http from 'http';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import {
  accessTokenExpires,
  adminAccessToken,
  deviceAccessToken,
  deviceTwoAccessToken,
  userOneAccessToken,
  userTwoAccessToken,
} from '../fixtures/token.fixture';
import { deviceOne, deviceTwo, insertDevices } from '../fixtures/device.fixture';
import { accessOne, insertSharedDeviceAccess } from '../fixtures/sharedDeviceAccess.fixture';
import { insertSubDevices, subDeviceOne, subDeviceThree, subDeviceTwo } from '../fixtures/subDevice.fixture';
import {
  insertSubDeviceParams,
  subDeviceParamFour,
  subDeviceParamOne,
  subDeviceParamThree,
  subDeviceParamTwo,
} from '../fixtures/subDeviceParam.fixture';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { setupTestDB } from '../utils/setupTestDB';
import config from '../../src/config/config';
import SocketServer from '../../src/socketServer';
import NotificationService from '../../src/services/notification.service';
import SocketId from '../../src/models/socketId.model';
import Device from '../../src/models/device.model';
import {
  deviceParamOne,
  deviceParamSix,
  deviceParamThree,
  deviceParamTwo,
  insertDeviceParams,
} from '../fixtures/deviceParam.fixture';
import Log from '../../src/models/log.model';

const port = 4000;
setupTestDB();
describe('Socket Tests', () => {
  let deviceIOClient;
  let userIOClient;
  let httpServer;
  // eslint-disable-next-line no-unused-vars
  let socketServer;
  const socketUrl = `http://localhost:${port}`;
  const deviceOptions = {
    transports: ['websocket'],
    forceNew: true,
  };

  beforeAll(done => {
    httpServer = http.createServer();
    httpServer.listen(port);
    socketServer = new SocketServer(httpServer);
    done();
  });

  afterAll(done => {
    setTimeout(async () => {
      if (deviceIOClient && deviceIOClient.connected) {
        deviceIOClient.disconnect();
        deviceIOClient.destroy();
      }
      if (userIOClient && userIOClient.connected) {
        userIOClient.disconnect();
        userIOClient.destroy();
      }
      NotificationService.sendCommand('shutdownSocketServer');
      await httpServer.close();
      done();
    }, 1000);
  });

  describe('Auth Tests', () => {
    beforeEach(async () => {
      await insertDevices([deviceOne]);
      await insertUsers([userOne]);
    });

    afterEach(() => {
      if (deviceIOClient && deviceIOClient.connected) {
        deviceIOClient.disconnect();
        deviceIOClient.destroy();
      }
      if (userIOClient && userIOClient.connected) {
        userIOClient.disconnect();
        userIOClient.destroy();
      }
    });

    it('should connect to server if valid device token', done => {
      deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
      deviceIOClient.once('CONNECTED', data => {
        expect(data).toBeDefined();
        expect(data).toMatchObject({
          id: expect.anything(),
          name: deviceOne.name,
          deviceId: deviceOne.deviceId,
          deviceOwner: deviceOne.deviceOwner,
          registeredAt: expect.anything(),
          isDisabled: false,
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        });
        done();
      });
    });

    it('should connect to server if valid device token and send notification to users', done => {
      deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
      deviceIOClient.once('CONNECTED', () => {
        const spy = jest.spyOn(NotificationService, 'sendMessage');
        setTimeout(() => {
          expect(spy).toBeCalledWith(expect.anything(), 'SUB_DEVICE_MULTI_PARAM_UPDATED', []);
          done();
        }, 100);
      });
    });

    it('should send notification to users if device is disconnected', async done => {
      await insertSharedDeviceAccess([accessOne]);
      await insertSubDevices([subDeviceOne]);
      await insertSubDeviceParams([subDeviceParamThree]);
      const userOptions = {
        forceNew: true,
        transportOptions: {
          polling: {
            extraHeaders: {
              'x-auth-token': userOneAccessToken,
            },
          },
        },
      };

      deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
      deviceIOClient.on('connect', async () => {
        userIOClient = io.connect(socketUrl, userOptions);

        userIOClient.once('CONNECTED', async () => {
          deviceIOClient.disconnect();
        });

        userIOClient.on('SUB_DEVICE_MULTI_PARAM_UPDATED', data => {
          expect(data).toBeInstanceOf(Array);
          expect(data.length).toBe(1);
          expect(data[0].isDisabled).toBeDefined();
          expect(data[0].deviceId).toBeDefined();
          expect(data[0].subDeviceId).toBeDefined();
          expect(data[0].paramName).toBeDefined();
          expect(data[0].paramValue).toBeDefined();
          expect(data[0].paramValue).toBe('off');
          done();
        });
      });
    });

    it('should connect to server if valid user token', done => {
      const userOptions = {
        forceNew: true,
        transportOptions: {
          polling: {
            extraHeaders: {
              'x-auth-token': userOneAccessToken,
            },
          },
        },
      };
      userIOClient = io.connect(socketUrl, userOptions);
      userIOClient.once('CONNECTED', data => {
        expect(data).toBeDefined();
        expect(data).toMatchObject({
          id: expect.anything(),
          name: userOne.name,
          email: userOne.email,
        });
        done();
      });
    });

    it('should receive error if invalid token sent via auth_token', done => {
      const invalidToken = jwt.sign(
        {
          invalid: 'some',
          iat: moment().unix(),
          exp: accessTokenExpires.unix(),
        },
        config.jwt.secret
      );
      deviceIOClient = io.connect(`${socketUrl}?auth_token=${invalidToken}`, deviceOptions);
      deviceIOClient.once('error', err => {
        expect(err).toBeDefined();
        done();
      });
    });

    it('should receive error if invalid token sent via x-auth-token', done => {
      const invalidToken = jwt.sign(
        {
          invalid: 'some',
          iat: moment().unix(),
          exp: accessTokenExpires.unix(),
        },
        config.jwt.secret
      );
      const userOptions = {
        forceNew: true,
        transportOptions: {
          polling: {
            extraHeaders: {
              'x-auth-token': invalidToken,
            },
          },
        },
      };
      userIOClient = io.connect(socketUrl, userOptions);
      userIOClient.once('error', err => {
        expect(err).toBeDefined();
        done();
      });
    });

    it('should receive error if invalid device token', done => {
      deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
      deviceIOClient.once('error', err => {
        expect(err).toBeDefined();
        done();
      });
    });

    it('should receive error if invalid user token', done => {
      const userOptions = {
        forceNew: true,
        transportOptions: {
          polling: {
            extraHeaders: {
              'x-auth-token': userTwoAccessToken,
            },
          },
        },
      };
      userIOClient = io.connect(socketUrl, userOptions);
      userIOClient.once('error', err => {
        expect(err).toBeDefined();
        done();
      });
    });
  });

  describe('Device Route Tests', () => {
    describe('FROM DEVICE: subDeviceParam/getAll', () => {
      beforeEach(async () => {
        await insertDevices([deviceOne]);
        await insertUsers([userOne]);
      });

      afterEach(() => {
        if (deviceIOClient && deviceIOClient.connected) {
          deviceIOClient.disconnect();
          deviceIOClient.destroy();
        }
      });

      it('should listen subDeviceParam/get event and emit sub device params to the device', async done => {
        await insertSubDevices([subDeviceOne, subDeviceTwo]);
        await insertSubDeviceParams([subDeviceParamOne, subDeviceParamTwo, subDeviceParamThree]);
        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', data => {
          expect(data).toHaveLength(3);
          expect(data[0].deviceId).toBeDefined();
          expect(data[1].deviceId).toBeDefined();
          expect(data[2].deviceId).toBeDefined();
          expect(data[0].subDeviceId).toBeDefined();
          expect(data[1].subDeviceId).toBeDefined();
          expect(data[2].subDeviceId).toBeDefined();
          done();
        });
      });

      it('should listen subDeviceParam/get event, and return error if emitted by user', async done => {
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertSubDeviceParams([subDeviceParamFour]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${userOneAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        deviceIOClient.on('ERROR_SUB_DEVICE_PARAM_GET', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('"deviceId" must be a string');
          done();
        });
      });

      it('should listen subDeviceParam/get event and return error if device has no sub device', done => {
        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no sub device');
          done();
        });
      });

      it('should listen subDeviceParam/get event and return error if device has no sub device params', async done => {
        await insertSubDevices([subDeviceOne, subDeviceTwo]);
        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no sub device params');
          done();
        });
      });
    });

    describe('FROM DEVICE: deviceParam/getAll', () => {
      beforeEach(async () => {
        await insertDevices([deviceOne]);
        await insertUsers([userOne]);
      });

      afterEach(() => {
        if (deviceIOClient && deviceIOClient.connected) {
          deviceIOClient.disconnect();
          deviceIOClient.destroy();
        }
      });

      it('should listen deviceParam/get event and emit device params to the device', async done => {
        await insertDeviceParams([deviceParamOne, deviceParamTwo]);
        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/getAll');
        });

        deviceIOClient.on('GET_ALL_DEVICE_PARAMS', data => {
          expect(data).toHaveLength(2);
          expect(data[0].deviceId).toBeDefined();
          expect(data[1].deviceId).toBeDefined();
          done();
        });
      });

      it('should listen deviceParam/get event, and return error if emitted by user', async done => {
        await insertDevices([deviceTwo]);
        await insertDeviceParams([deviceParamThree]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${userOneAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/getAll');
        });

        deviceIOClient.on('ERROR_DEVICE_PARAM_GET', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('"deviceId" must be a string');
          done();
        });
      });

      it('should listen deviceParam/get event and return error if device has no device params', async done => {
        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/getAll');
        });

        deviceIOClient.on('GET_ALL_DEVICE_PARAMS', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no device params');
          done();
        });
      });
    });

    describe('FROM DEVICE: subDeviceParam/update', () => {
      afterEach(() => {
        if (deviceIOClient && deviceIOClient.connected) {
          deviceIOClient.disconnect();
          deviceIOClient.destroy();
        }
        if (userIOClient && userIOClient.connected) {
          userIOClient.disconnect();
          userIOClient.destroy();
        }
      });

      it('should listen subDeviceParam/update event, update it in database and emit sub device params to users', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertSubDeviceParams([subDeviceParamFour]);

        const userOptions = {
          forceNew: true,
          transportOptions: {
            polling: {
              extraHeaders: {
                'x-auth-token': userOneAccessToken,
              },
            },
          },
        };

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        userIOClient = io.connect(socketUrl, userOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        userIOClient.on('SUB_DEVICE_PARAMS_UPDATED', data => {
          expect(data).toBeInstanceOf(Object);
          expect(data).toBeDefined();
          expect(data).toMatchObject({
            deviceId: subDeviceParamFour.deviceId,
            subDeviceId: subDeviceParamFour.subDeviceId,
            paramName: subDeviceParamFour.paramName,
            paramValue: 'on',
            isDisabled: false,
          });
          done();
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', data => {
          const subDeviceParam = data[0];
          deviceIOClient.emit('subDeviceParam/update', {
            deviceId: subDeviceParam.deviceId,
            subDeviceId: subDeviceParam.subDeviceId,
            paramName: subDeviceParam.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });
      });

      it('should listen subDeviceParam/update event, update it in database and emit sub device params to users and create log', async done => {
        await insertUsers([admin]);
        await insertDevices([deviceOne]);
        await insertSubDevices([subDeviceOne]);
        await insertSubDeviceParams([subDeviceParamThree]);
        await insertDeviceParams([deviceParamSix]);

        const userOptions = {
          forceNew: true,
          transportOptions: {
            polling: {
              extraHeaders: {
                'x-auth-token': adminAccessToken,
              },
            },
          },
        };

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        userIOClient = io.connect(socketUrl, userOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        userIOClient.on('SUB_DEVICE_PARAMS_UPDATED', async data => {
          expect(data).toBeInstanceOf(Object);
          expect(data).toBeDefined();
          expect(data).toMatchObject({
            deviceId: subDeviceParamThree.deviceId,
            subDeviceId: subDeviceParamThree.subDeviceId,
            paramName: subDeviceParamThree.paramName,
            paramValue: 'on',
            isDisabled: false,
          });

          const dbLog = await Log.findOne({
            deviceId: subDeviceParamThree.deviceId,
            subDeviceId: subDeviceParamThree.subDeviceId,
            logName: `${subDeviceParamThree.paramName}_UPDATED`,
          });
          expect(dbLog).toBeDefined();
          expect(dbLog).toMatchObject({
            deviceId: subDeviceParamThree.deviceId,
            subDeviceId: subDeviceParamThree.subDeviceId,
            logName: `${subDeviceParamThree.paramName}_UPDATED`,
            logDescription: `${subDeviceOne.name} turned on when water level was ${deviceParamSix.paramValue}%`,
            createdBy: `device@${subDeviceParamThree.deviceId}.com`,
          });

          done();
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', data => {
          const subDeviceParam = data[0];
          deviceIOClient.emit('subDeviceParam/update', {
            deviceId: subDeviceParam.deviceId,
            subDeviceId: subDeviceParam.subDeviceId,
            paramName: subDeviceParam.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });
      });

      it('should listen subDeviceParam/update event, and return error if emitted by user', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertSubDeviceParams([subDeviceParamFour]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${userOneAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/update', {
            subDeviceId: subDeviceParamFour.subDeviceId,
            paramName: subDeviceParamFour.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });

        deviceIOClient.on('ERROR_SUB_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('"deviceId" must be a string');
          done();
        });
      });

      it('should listen subDeviceParam/update event, and return error if subDeviceId is invalid and emitted by device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertSubDeviceParams([subDeviceParamFour]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/update', {
            subDeviceId: 'invalid',
            paramName: subDeviceParamFour.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });

        deviceIOClient.on('ERROR_SUB_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe(
            '"subDeviceId" with value "invalid" fails to match the required pattern: /^[A-Za-z_\\d]{10,20}$/'
          );
          done();
        });
      });

      it('should listen subDeviceParam/update event, and return error if subDeviceId is missing and emitted by device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertSubDeviceParams([subDeviceParamFour]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/update', {
            paramName: subDeviceParamFour.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });

        deviceIOClient.on('ERROR_SUB_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('"subDeviceId" must be a string');
          done();
        });
      });

      it('should listen subDeviceParam/update event, and return error if paramName is missing and emitted by device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertSubDeviceParams([subDeviceParamFour]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/update', {
            subDeviceId: subDeviceParamFour.subDeviceId,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });

        deviceIOClient.on('ERROR_SUB_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('"paramName" must be a string');
          done();
        });
      });

      it('should listen subDeviceParam/update event, and return error if paramValue is missing and emitted by device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertSubDeviceParams([subDeviceParamFour]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/update', {
            subDeviceId: subDeviceParamFour.subDeviceId,
            paramName: subDeviceParamFour.paramName,
            updatedBody: {},
          });
        });

        deviceIOClient.on('ERROR_SUB_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('"paramValue" must be one of [string, number, object, array]');
          done();
        });
      });

      it('should listen subDeviceParam/update event, update it in database and emit sub device params to shared users', async done => {
        await insertUsers([admin, userOne]);
        await insertDevices([deviceOne]);
        await insertSubDevices([subDeviceOne]);
        await insertSubDeviceParams([subDeviceParamOne]);
        await insertSharedDeviceAccess([accessOne]);

        const userOptions = {
          forceNew: true,
          transportOptions: {
            polling: {
              extraHeaders: {
                'x-auth-token': userOneAccessToken,
              },
            },
          },
        };

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        userIOClient = io.connect(socketUrl, userOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        userIOClient.on('SUB_DEVICE_PARAMS_UPDATED', data => {
          expect(data).toBeInstanceOf(Object);
          expect(data).toBeDefined();
          expect(data).toMatchObject({
            deviceId: subDeviceParamOne.deviceId,
            subDeviceId: subDeviceParamOne.subDeviceId,
            paramName: subDeviceParamOne.paramName,
            paramValue: 'on',
            isDisabled: false,
          });
          done();
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', data => {
          const subDeviceParam = data[0];
          deviceIOClient.emit('subDeviceParam/update', {
            deviceId: subDeviceParam.deviceId,
            subDeviceId: subDeviceParam.subDeviceId,
            paramName: subDeviceParam.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });
      });

      it('should listen subDeviceParam/update event, update it in database and should not emit sub device params anyone if there is no socket Id available', async done => {
        await insertUsers([admin, userOne]);
        await insertDevices([deviceOne]);
        await insertSubDevices([subDeviceOne]);
        await insertSubDeviceParams([subDeviceParamOne]);
        await insertSharedDeviceAccess([accessOne]);

        let spy;
        const userOptions = {
          forceNew: true,
          transportOptions: {
            polling: {
              extraHeaders: {
                'x-auth-token': userOneAccessToken,
              },
            },
          },
        };

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        userIOClient = io.connect(socketUrl, userOptions);
        deviceIOClient.on('CONNECTED', async () => {
          await SocketId.deleteMany();
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', data => {
          spy = jest.spyOn(NotificationService, 'sendMessage');
          const subDeviceParam = data[0];
          deviceIOClient.emit('subDeviceParam/update', {
            deviceId: subDeviceParam.deviceId,
            subDeviceId: subDeviceParam.subDeviceId,
            paramName: subDeviceParam.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });

        setTimeout(() => {
          expect(spy).not.toBeCalled();
          done();
        }, 100);
      });

      it('should listen subDeviceParam/update event, and receive error if there is no active device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        deviceIOClient.on('ERROR_SUB_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no active device');
          done();
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', async () => {
          const dbDevice = await Device.findById(deviceTwo._id);
          Object.assign(dbDevice, { isDisabled: true });
          await dbDevice.save();
          deviceIOClient.emit('subDeviceParam/update', {
            deviceId: subDeviceParamFour.deviceId,
            subDeviceId: subDeviceParamFour.subDeviceId,
            paramName: subDeviceParamFour.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });
      });

      it('should listen subDeviceParam/update event, and receive error if there is no active sub-device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        deviceIOClient.on('ERROR_SUB_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no active sub device');
          done();
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no sub device');

          deviceIOClient.emit('subDeviceParam/update', {
            deviceId: subDeviceParamFour.deviceId,
            subDeviceId: subDeviceParamFour.subDeviceId,
            paramName: subDeviceParamFour.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });
      });

      it('should listen subDeviceParam/update event, and receive error if there is no active sub-device-param', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('subDeviceParam/getAll');
        });

        deviceIOClient.on('ERROR_SUB_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no active sub device param');
          done();
        });

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', () => {
          deviceIOClient.emit('subDeviceParam/update', {
            deviceId: subDeviceParamFour.deviceId,
            subDeviceId: subDeviceParamFour.subDeviceId,
            paramName: subDeviceParamFour.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });
      });
    });

    describe('FROM DEVICE: deviceParam/update', () => {
      afterEach(() => {
        if (deviceIOClient && deviceIOClient.connected) {
          deviceIOClient.disconnect();
          deviceIOClient.destroy();
        }
        if (userIOClient && userIOClient.connected) {
          userIOClient.disconnect();
          userIOClient.destroy();
        }
      });

      it('should listen deviceParam/update event, update it in database and emit device params to users', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertDeviceParams([deviceParamThree]);

        const userOptions = {
          forceNew: true,
          transportOptions: {
            polling: {
              extraHeaders: {
                'x-auth-token': userOneAccessToken,
              },
            },
          },
        };

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        userIOClient = io.connect(socketUrl, userOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/getAll');
        });

        userIOClient.on('DEVICE_PARAM_UPDATED', data => {
          expect(data).toBeInstanceOf(Object);
          expect(data).toBeDefined();
          expect(data).toMatchObject({
            deviceId: deviceParamThree.deviceId,
            paramName: deviceParamThree.paramName,
            paramValue: 70,
            isDisabled: false,
          });
          done();
        });

        deviceIOClient.on('GET_ALL_DEVICE_PARAMS', data => {
          const deviceParam = data[0];
          deviceIOClient.emit('deviceParam/update', {
            deviceId: deviceParam.deviceId,
            paramName: deviceParam.paramName,
            updatedBody: {
              paramValue: 70,
            },
          });
        });
      });

      it('should listen deviceParam/update event, update it in database and create log and emit device params to users', async done => {
        await insertUsers([admin]);
        await insertDevices([deviceOne]);
        await insertSubDevices([subDeviceOne]);
        await insertDeviceParams([deviceParamSix]);

        const userOptions = {
          forceNew: true,
          transportOptions: {
            polling: {
              extraHeaders: {
                'x-auth-token': adminAccessToken,
              },
            },
          },
        };

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        userIOClient = io.connect(socketUrl, userOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/getAll');
        });

        userIOClient.on('DEVICE_PARAM_UPDATED', async data => {
          expect(data).toBeInstanceOf(Object);
          expect(data).toBeDefined();
          expect(data).toMatchObject({
            deviceId: deviceParamSix.deviceId,
            paramName: deviceParamSix.paramName,
            paramValue: 'something',
            isDisabled: false,
          });

          const dbLog = await Log.findOne({
            deviceId: deviceParamOne.deviceId,
            logName: `${deviceParamOne.paramName}_UPDATED`,
          });
          expect(dbLog).toBeDefined();
          expect(dbLog).toMatchObject({
            deviceId: deviceOne.deviceId,
            logName: `${deviceParamOne.paramName}_UPDATED`,
            logDescription: `${deviceOne.name} ${deviceParamOne.paramName} updated to something`,
            createdBy: `device@${deviceOne.deviceId}.com`,
            triggeredByDevice: true,
          });

          done();
        });

        deviceIOClient.on('GET_ALL_DEVICE_PARAMS', data => {
          const deviceParam = data[0];
          deviceIOClient.emit('deviceParam/update', {
            deviceId: deviceParam.deviceId,
            paramName: deviceParam.paramName,
            updatedBody: {
              paramValue: 'something',
            },
          });
        });
      });

      it('should listen deviceParam/update event, and return error if emitted by user', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertDeviceParams([deviceParamThree]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${userOneAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/update', {
            paramName: deviceParamThree.paramName,
            updatedBody: {
              paramValue: 70,
            },
          });
        });

        deviceIOClient.on('ERROR_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('"deviceId" must be a string');
          done();
        });
      });

      it('should listen deviceParam/update event, and return error if subDeviceId is invalid and emitted by device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertDeviceParams([deviceParamTwo]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/update', {
            paramName: deviceParamTwo.paramName,
            updatedBody: {
              paramValue: 100,
            },
          });
        });

        deviceIOClient.on('ERROR_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no active device param');
          done();
        });
      });

      it('should listen deviceParam/update event, and return error if paramName is missing and emitted by device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertDeviceParams([deviceParamThree]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/update', {
            updatedBody: {
              paramValue: 'on',
            },
          });
        });

        deviceIOClient.on('ERROR_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('"paramName" must be a string');
          done();
        });
      });

      it('should listen deviceParam/update event, and return error if paramValue is missing and emitted by device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);
        await insertSubDevices([subDeviceThree]);
        await insertDeviceParams([deviceParamThree]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/update', {
            paramName: deviceParamThree.paramName,
            updatedBody: {},
          });
        });

        deviceIOClient.on('ERROR_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('"paramValue" must be one of [string, number, object, array]');
          done();
        });
      });

      it('should listen deviceParam/update event, update it in database and emit device params to shared users', async done => {
        await insertUsers([admin, userOne]);
        await insertDevices([deviceOne]);
        await insertSubDevices([subDeviceOne]);
        await insertDeviceParams([deviceParamOne]);
        await insertSharedDeviceAccess([accessOne]);

        const userOptions = {
          forceNew: true,
          transportOptions: {
            polling: {
              extraHeaders: {
                'x-auth-token': userOneAccessToken,
              },
            },
          },
        };

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        userIOClient = io.connect(socketUrl, userOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/getAll');
        });

        userIOClient.on('DEVICE_PARAM_UPDATED', data => {
          expect(data).toBeInstanceOf(Object);
          expect(data).toBeDefined();
          expect(data).toMatchObject({
            deviceId: deviceParamOne.deviceId,
            paramName: deviceParamOne.paramName,
            paramValue: 80,
            isDisabled: false,
          });
          done();
        });

        deviceIOClient.on('GET_ALL_DEVICE_PARAMS', data => {
          const deviceParam = data[0];
          deviceIOClient.emit('deviceParam/update', {
            paramName: deviceParam.paramName,
            updatedBody: {
              paramValue: 80,
            },
          });
        });
      });

      it('should listen deviceParam/update event, update it in database and should not emit device params anyone if there is no socket Id available', async done => {
        await insertUsers([admin, userOne]);
        await insertDevices([deviceOne]);
        await insertSubDevices([subDeviceOne]);
        await insertDeviceParams([deviceParamOne]);
        await insertSharedDeviceAccess([accessOne]);

        let spy;
        const userOptions = {
          forceNew: true,
          transportOptions: {
            polling: {
              extraHeaders: {
                'x-auth-token': userOneAccessToken,
              },
            },
          },
        };

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceAccessToken}`, deviceOptions);
        userIOClient = io.connect(socketUrl, userOptions);
        deviceIOClient.on('CONNECTED', async () => {
          await SocketId.deleteMany();
          deviceIOClient.emit('deviceParam/getAll');
        });

        deviceIOClient.on('GET_ALL_DEVICE_PARAMS', async data => {
          spy = jest.spyOn(NotificationService, 'sendMessage');
          const deviceParam = data[0];
          deviceIOClient.emit('deviceParam/update', {
            paramName: deviceParam.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
        });

        setTimeout(() => {
          expect(spy).not.toBeCalled();
          done();
        }, 100);
      });

      it('should listen deviceParam/update event, and receive error if there is no active device', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/getAll');
        });

        deviceIOClient.on('ERROR_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no active device');
          done();
        });

        deviceIOClient.on('GET_ALL_DEVICE_PARAMS', async () => {
          const dbDevice = await Device.findById(deviceTwo._id);
          Object.assign(dbDevice, { isDisabled: true });
          await dbDevice.save();
          deviceIOClient.emit('deviceParam/update', {
            paramName: deviceParamThree.paramName,
            updatedBody: {
              paramValue: 100,
            },
          });
        });
      });

      it('should listen deviceParam/update event, and receive error if there is no active device param', async done => {
        await insertUsers([userOne]);
        await insertDevices([deviceTwo]);

        deviceIOClient = io.connect(`${socketUrl}?auth_token=${deviceTwoAccessToken}`, deviceOptions);
        deviceIOClient.on('CONNECTED', () => {
          deviceIOClient.emit('deviceParam/getAll');
        });

        deviceIOClient.on('ERROR_DEVICE_PARAM_UPDATE', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no active device param');
          done();
        });

        deviceIOClient.on('GET_ALL_DEVICE_PARAMS', data => {
          expect(data).toHaveProperty('error');
          expect(data.error).toBe('no device params');

          deviceIOClient.emit('deviceParam/update', {
            paramName: deviceParamOne.paramName,
            updatedBody: {
              paramValue: 80,
            },
          });
        });
      });
    });
  });
});
