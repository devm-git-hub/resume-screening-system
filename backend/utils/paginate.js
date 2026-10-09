// utils/paginate.js
const getPagination = (query, defaultLimit = 10) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const buildPagination = (total, page, limit) => ({
  total,
  page,
  pages: Math.ceil(total / limit),
});

module.exports = { getPagination, buildPagination };