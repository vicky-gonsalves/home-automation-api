import { pick } from 'lodash';

const getQueryOptions = query => {
  const page = query.page * 1 || 1;
  const limit = query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  const sort = {};
  if (query.sortBy) {
    const parts = query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  return { limit, skip, sort };
};

const filterKeys = (query, pickKeys) => {
  const filteredObj = pick(query, pickKeys);
  const allKeys = Object.keys(filteredObj);
  const regexedFilter = {};
  allKeys.forEach(key => {
    if (key === 'isDisabled') {
      regexedFilter[key] = filteredObj[key];
    } else {
      regexedFilter[key] = new RegExp(filteredObj[key], 'i');
    }
  });
  return regexedFilter;
};

module.exports = {
  getQueryOptions,
  filterKeys,
};
