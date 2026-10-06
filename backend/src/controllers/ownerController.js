const prisma = require('../prisma');

// View store details, average rating, and list of users who submitted ratings
const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { search = '', sortBy = 'createdAt', order = 'desc' } = req.query;

    // Find all stores owned by this store owner
    const stores = await prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const averageRating = totalRatings > 0
        ? parseFloat((store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
        : 0;

      // Filter rating users by search term if provided
      let ratingsList = store.ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        createdAt: r.createdAt,
        userName: r.user.name,
        userEmail: r.user.email,
        userId: r.user.id,
      }));

      if (search.trim()) {
        const term = search.trim().toLowerCase();
        ratingsList = ratingsList.filter(
          (r) =>
            r.userName.toLowerCase().includes(term) ||
            r.userEmail.toLowerCase().includes(term)
        );
      }

      // Sort ratings
      const multiplier = order.toLowerCase() === 'asc' ? 1 : -1;
      ratingsList.sort((a, b) => {
        if (sortBy === 'rating') {
          return (a.rating - b.rating) * multiplier;
        }
        if (sortBy === 'userName') {
          return a.userName.localeCompare(b.userName) * multiplier;
        }
        if (sortBy === 'createdAt') {
          return (new Date(a.createdAt) - new Date(b.createdAt)) * multiplier;
        }
        return 0;
      });

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        totalRatings,
        averageRating,
        ratings: ratingsList,
      };
    });

    return res.json({
      success: true,
      data: { stores: formattedStores },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwnerDashboard,
};
