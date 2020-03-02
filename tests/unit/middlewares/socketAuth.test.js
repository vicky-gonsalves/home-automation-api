import { deviceOne, insertDevices } from '../../fixtures/device.fixture';
import { setupTestDB } from '../../utils/setupTestDB';
import Device from '../../../src/models/device.model';
import SocketId from '../../../src/models/socketId.model';
import AppError from '../../../src/utils/AppError';
import socketAuth from '../../../src/middlewares/socketAuth';
import {
  deviceAccessToken,
  userOneAccessToken,
  noDeviceAccessToken,
  noUserAccessToken,
  deviceTwoAccessToken,
  userTwoAccessToken,
} from '../../fixtures/token.fixture';
import { admin, insertUsers, userOne } from '../../fixtures/user.fixture';
import { handleDisconnection } from '../../../src/controllers/socketId.controller';

setupTestDB();

describe('SocketAuth middlewares', () => {
  let next;
  let deviceHandshake;
  let userHandshake;
  beforeEach(async () => {
    await insertUsers([admin, userOne]);
    next = jest.fn();
    deviceHandshake = {
      id: 'dNHFg2ivX8BEs-wKAAAB',
      handshake: {
        headers: {
          host: 'fc9d0304.ngrok.io:80',
          connection: 'Upgrade',
          upgrade: 'websocket',
          'sec-websocket-version': '13',
          'sec-websocket-key': 'YMqcKucTDLKygYX7mAr1iA==',
          'sec-websocket-protocol': 'arduino',
          origin: 'file://',
          'user-agent': 'arduino-WebSocket-Client',
          'x-forwarded-for': '45.114.249.104',
        },
        time: new Date(),
        address: '::ffff:127.0.0.1',
        xdomain: true,
        secure: false,
        issued: new Date().getTime(),
        url: `/socketAuth.io/?transport=websocket`,
        query: {
          transport: 'websocket',
          auth_token: deviceAccessToken,
        },
      },
    };

    userHandshake = {
      id: 'dNHFg2ivX8BEs-wKBBAB',
      handshake: {
        headers: {
          host: 'localhost:9000',
          connection: 'keep-alive',
          accept: '*/*',
          'x-auth-token': userOneAccessToken,
          'sec-fetch-dest': 'empty',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-mode': 'cors',
          referer: 'http://localhost:9000/',
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'en-US,en;q=0.9,de;q=0.8',
          cookie:
            'Webstorm-8c9791c8=f6e70a3c-1086-4b63-8d2c-78b9bb9a5100; Webstorm-b11ea929=f6e70a3c-1086-4b63-8d2c-78b9bb9a5100; Webstorm-29b0a80d=380e2ceb-50de-47cf-b1bc-f882a1b5cf2c; io=dNHFg2ivX8BEs-wKAAAB',
        },
        time: new Date(),
        address: '::1',
        xdomain: false,
        secure: false,
        issued: new Date().getTime(),
        url: '/socketAuth.io/?EIO=3&transport=polling&t=N2W2_D9',
        query: { EIO: '3', transport: 'polling', t: 'N2W2_D9' },
      },
    };
  });

  it('should handshake with device and register it if not already registered and save socketAuth id', async () => {
    delete deviceOne.registeredAt;
    await insertDevices([deviceOne]);
    await socketAuth(deviceHandshake, next);
    const dbDevice = await Device.findById(deviceOne._id);
    expect(dbDevice).toBeDefined();
    expect(dbDevice.registeredAt).toBeDefined();

    const dbSocketId = await SocketId.findOne({ type: 'device', idType: 'deviceId', bindedTo: deviceOne.deviceId });
    expect(dbSocketId).toBeDefined();
    expect(dbSocketId.socketId).toEqual(deviceHandshake.id);
    expect(next).toHaveBeenCalled();
  });

  it('should handshake with device and skip register it if already registered and save socketAuth id', async () => {
    deviceOne.registeredAt = new Date();
    await insertDevices([deviceOne]);
    await socketAuth(deviceHandshake, next);
    const dbDevice = await Device.findById(deviceOne._id);
    expect(dbDevice).toBeDefined();
    expect(dbDevice.registeredAt).toBeDefined();

    const dbSocketId = await SocketId.findOne({ type: 'device', idType: 'deviceId', bindedTo: deviceOne.deviceId });
    expect(dbSocketId).toBeDefined();
    expect(dbSocketId.socketId).toEqual(deviceHandshake.id);
    expect(next).toHaveBeenCalled();
  });

  it('should handshake with user and save socketAuth id', async () => {
    await socketAuth(userHandshake, next);

    const dbSocketId = await SocketId.findOne({ type: 'user', idType: 'email', bindedTo: userOne.email });
    expect(dbSocketId).toBeDefined();
    expect(dbSocketId.socketId).toEqual(userHandshake.id);
    expect(next).toHaveBeenCalled();
  });

  it('should return Error if no socketAuth were sent', async () => {
    await socketAuth(null, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return Error if no handshake data were sent', async () => {
    delete userHandshake.handshake;
    await socketAuth(userHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return Error if no headers were sent', async () => {
    delete userHandshake.handshake.headers;
    await socketAuth(userHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return Error if no x-auth-token', async () => {
    delete userHandshake.handshake.headers['x-auth-token'];
    await socketAuth(userHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return Error if no auth_token', async () => {
    delete deviceOne.registeredAt;
    await insertDevices([deviceOne]);
    delete deviceHandshake.handshake.query.auth_token;
    await socketAuth(deviceHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return Error if x-auth-token is blank', async () => {
    userHandshake.handshake.headers['x-auth-token'] = '';
    await socketAuth(userHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return Error if auth_token is blank', async () => {
    delete deviceOne.registeredAt;
    await insertDevices([deviceOne]);
    deviceHandshake.handshake.query.auth_token = '';
    await socketAuth(deviceHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return Error if x-auth-token is invalid', async () => {
    userHandshake.handshake.headers['x-auth-token'] = 'invalid';
    await socketAuth(userHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return Error if auth_token is invalid', async () => {
    delete deviceOne.registeredAt;
    await insertDevices([deviceOne]);
    deviceHandshake.handshake.query.auth_token = 'invalid';
    await socketAuth(deviceHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return AppError if authentication params doesnt have deviceId', async () => {
    delete deviceOne.registeredAt;
    await insertDevices([deviceOne]);
    deviceHandshake.handshake.query.auth_token = noDeviceAccessToken;
    await socketAuth(deviceHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should return AppError if authentication params doesnt have user', async () => {
    userHandshake.handshake.headers['x-auth-token'] = noUserAccessToken;
    await socketAuth(userHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should return AppError if device not found', async () => {
    deviceHandshake.handshake.query.auth_token = deviceTwoAccessToken;
    await socketAuth(deviceHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should return AppError if user not found', async () => {
    userHandshake.handshake.headers['x-auth-token'] = userTwoAccessToken;
    await socketAuth(userHandshake, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should delete socket id on disconnection', async () => {
    delete deviceOne.registeredAt;
    await insertDevices([deviceOne]);
    await socketAuth(deviceHandshake, next);
    await handleDisconnection(deviceHandshake.id);
    const socketId = await SocketId.findOne({ socketId: deviceHandshake.id });
    expect(socketId).toBeNull();
  });
});
