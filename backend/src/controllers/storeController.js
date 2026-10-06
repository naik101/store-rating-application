const prisma = require('../prisma');

// Get all stores with search, sort, overall rating, and current user's submitted rating
const getAllStores = async (req, res, next) => {
  try {
    const { search = '', sortBy = 'name', order = 'asc' } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const where = {};

    // Search by Name and Address
    if (search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
          },
        },
      },
    });

    const formattedStores = stores.map((s) => {
      const totalRatings = s.ratings.length;
      const overallRating = totalRatings > 0
        ? parseFloat((s.ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
        : 0;

      // Find current user's submitted rating for this store
      let userRating = null;
      if (currentUserId) {
        const found = s.ratings.find((r) => r.userId === currentUserId);
        if (found) {
          userRating = found.rating;
        }
      }

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        overallRating,
        totalRatings,
        userRating,
        createdAt: s.createdAt,
      };
    });

    // Sorting
    const sortMultiplier = order.toLowerCase() === 'desc' ? -1 : 1;
    formattedStores.sort((a, b) => {
      if (sortBy === 'rating' || sortBy === 'overallRating') {
        return (a.overallRating - b.overallRating) * sortMultiplier;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * sortMultiplier;
      }
      if (sortBy === 'address') {
        return a.address.localeCompare(b.address) * sortMultiplier;
      }
      return 0;
    });

    return res.json({
      success: true,
      data: { stores: formattedStores },
    });
  } catch (error) {
    next(error);
  }
};

// Get single store details
const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const totalRatings = store.ratings.length;
    const overallRating = totalRatings > 0
      ? parseFloat((store.ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
      : 0;

    let userRating = null;
    if (currentUserId) {
      const found = store.ratings.find((r) => r.userId === currentUserId);
      if (found) {
        userRating = found.rating;
      }
    }

    return res.json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          overallRating,
          totalRatings,
          userRating,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStores,
  getStoreById,
};
