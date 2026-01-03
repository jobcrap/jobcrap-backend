const { PAGINATION } = require('../constants');

/**
 * Calculate pagination metadata
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items count
 * @returns {Object} Pagination metadata
 */
const getPaginationData = (page = 1, limit = PAGINATION.DEFAULT_LIMIT, total = 0) => {
    // Sanitize inputs
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT));

    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext,
        hasPrev,
        skip,
        limit
    };
};

module.exports = {
    getPaginationData
};
