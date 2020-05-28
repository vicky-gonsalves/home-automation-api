import httpStatus from 'http-status';
import SharedDeviceAccess from '../models/sharedDeviceAccess.model';
import AppError from '../utils/AppError';
import { filterKeys, getQueryOptions } from '../utils/service.util';

const pickKeys = ['id', 'email', 'sharedBy', 'isDisabled', 'createdAt', 'updatedAt'];
const pickSubKeys = ['name'];

const checkDuplicateSharedDeviceAccessService = async (deviceId, email, excludeDeviceId) => {
  const sharedDeviceAccess = await SharedDeviceAccess.findOne({ deviceId, email, _id: { $ne: excludeDeviceId } });
  if (sharedDeviceAccess) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already has access to device');
  }
};

const checkAccessIfExists = async (deviceId, email) => {
  const sharedDeviceAccess = await SharedDeviceAccess.findOne({ deviceId, email });
  if (!sharedDeviceAccess) {
    throw new AppError(httpStatus.FORBIDDEN, "User doesn't have access to the device");
  }
  return sharedDeviceAccess;
};

const createSharedDeviceAccessService = async sharedDeviceAccessBody => {
  await checkDuplicateSharedDeviceAccessService(sharedDeviceAccessBody.deviceId, sharedDeviceAccessBody.email);
  return SharedDeviceAccess.create(sharedDeviceAccessBody);
};

const getSharedDeviceAccessByIdService = async id => {
  const sharedDeviceAccess = await SharedDeviceAccess.findById(id);
  if (!sharedDeviceAccess) {
    throw new AppError(httpStatus.NOT_FOUND, 'No shared device access found with this id');
  }
  return sharedDeviceAccess;
};

const getSharedDeviceAccessesService = async query => {
  const filter = filterKeys(query, pickKeys);
  const subFilter = filterKeys(query, pickSubKeys);
  const options = getQueryOptions(query);
  const dataQuery = [];
  const onlyCountQuery = [];

  onlyCountQuery.push({ $match: { ...filter, deviceId: query.deviceId } });
  onlyCountQuery.push({
    $lookup: {
      from: 'users',
      let: { p_email: '$email' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$email', '$$p_email'],
            },
          },
        },
      ],
      as: 'user',
    },
  });

  if (!(Object.keys(subFilter).length === 0 && subFilter.constructor === Object)) {
    const matchObject = { $match: {} };
    const keys = Object.keys(subFilter);
    keys.forEach(key => {
      matchObject.$match[`user.${key}`] = subFilter[key];
    });
    onlyCountQuery.push(matchObject);
  }

  onlyCountQuery.push({
    $project: {
      id: '$_id',
      deviceId: '$deviceId',
      email: '$email',
      isDisabled: '$isDisabled',
      sharedBy: '$sharedBy',
      createdAt: '$createdAt',
      updatedAt: '$updatedAt',
      name: { $arrayElemAt: ['$user.name', 0] },
      userId: { $arrayElemAt: ['$user._id', 0] },
    },
  });

  dataQuery.push({ $sort: options.sort });
  dataQuery.push({ $skip: options.skip });
  dataQuery.push({ $limit: options.limit });

  return SharedDeviceAccess.aggregate([
    {
      $facet: {
        sharedDeviceAccesses: [...onlyCountQuery, ...dataQuery],
        count: [...onlyCountQuery, { $count: 'count' }],
      },
    },
    {
      $project: {
        sharedDeviceAccesses: '$sharedDeviceAccesses',
        count: { $arrayElemAt: ['$count.count', 0] },
      },
    },
  ]);
};

const deleteSharedDeviceAccessByDeviceIdService = async deviceId => {
  const sharedDeviceAccesses = await SharedDeviceAccess.find({ deviceId });
  return Promise.all(sharedDeviceAccesses.map(sharedDeviceAccess => sharedDeviceAccess.remove()));
};

const updateSharedDeviceAccessService = async (id, updateBody) => {
  const sharedDeviceAccess = await getSharedDeviceAccessByIdService(id);
  if (updateBody.deviceId || updateBody.email) {
    await checkDuplicateSharedDeviceAccessService(updateBody.deviceId, updateBody.email, id);
  }
  Object.assign(sharedDeviceAccess, updateBody);
  await sharedDeviceAccess.save();
  return sharedDeviceAccess;
};

const updateSharedDeviceAccessEmailService = async (oldEmail, newEmail) => {
  const sharedDeviceAccesses = await SharedDeviceAccess.find({ email: oldEmail });
  return Promise.all(
    sharedDeviceAccesses.map(async sharedDeviceAccess => {
      Object.assign(sharedDeviceAccess, { email: newEmail });
      await sharedDeviceAccess.save();
      return sharedDeviceAccess;
    })
  );
};

const deleteSharedDeviceAccessService = async id => {
  const sharedDeviceAccess = await getSharedDeviceAccessByIdService(id);
  await sharedDeviceAccess.remove();
  return sharedDeviceAccess;
};

const checkAndDeleteAccessIfExists = async (deviceId, email) => {
  const sharedDeviceAccesses = await SharedDeviceAccess.find({ deviceId, email });
  return Promise.all(sharedDeviceAccesses.map(sharedDeviceAccess => sharedDeviceAccess.remove()));
};

const deleteSharedDeviceAccessByUserEmailService = async email => {
  const sharedDeviceAccesses = await SharedDeviceAccess.find({ email });
  return Promise.all(sharedDeviceAccesses.map(sharedDeviceAccess => sharedDeviceAccess.remove()));
};

const getSharedDeviceAccessByDeviceIdService = deviceId => {
  return SharedDeviceAccess.find({ deviceId, isDisabled: false });
};

const getSharedDeviceAccessByEmailService = email => {
  return SharedDeviceAccess.find({ email, isDisabled: false });
};

module.exports = {
  checkDuplicateSharedDeviceAccessService,
  createSharedDeviceAccessService,
  getSharedDeviceAccessByIdService,
  getSharedDeviceAccessesService,
  updateSharedDeviceAccessService,
  updateSharedDeviceAccessEmailService,
  deleteSharedDeviceAccessByDeviceIdService,
  deleteSharedDeviceAccessService,
  deleteSharedDeviceAccessByUserEmailService,
  checkAndDeleteAccessIfExists,
  getSharedDeviceAccessByDeviceIdService,
  getSharedDeviceAccessByEmailService,
  checkAccessIfExists,
};
