import io from 'socket.io-client';
import http from 'http';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import {
  accessTokenExpires,
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
import { setupTestDBForSocket } from '../utils/setupTestDB';
import config from '../../src/config/config';
import SocketServer from '../../src/socketServer';
import NotificationService from '../../src/services/notification.service';
import SocketId from '../../src/models/socketId.model';
import Device from '../../src/models/device.model';

const port = 4000;
setupTestDBForSocket();
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
          expect(data[0].deviceId).toBe(deviceOne.deviceId);
          expect(data[1].deviceId).toBe(deviceOne.deviceId);
          expect(data[2].deviceId).toBe(deviceOne.deviceId);
          expect(data[0].subDeviceId).toBe(subDeviceOne.subDeviceId);
          expect(data[1].subDeviceId).toBe(subDeviceOne.subDeviceId);
          expect(data[2].subDeviceId).toBe(subDeviceTwo.subDeviceId);
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

        deviceIOClient.on('GET_ALL_SUB_DEVICE_PARAMS', async data => {
          const spy = jest.spyOn(NotificationService, 'sendMessage');
          const subDeviceParam = data[0];
          await SocketId.deleteMany();
          deviceIOClient.emit('subDeviceParam/update', {
            deviceId: subDeviceParam.deviceId,
            subDeviceId: subDeviceParam.subDeviceId,
            paramName: subDeviceParam.paramName,
            updatedBody: {
              paramValue: 'on',
            },
          });
          setTimeout(() => {
            expect(spy).not.toBeCalled();
            done();
          }, 10);
        });
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
  });
});
