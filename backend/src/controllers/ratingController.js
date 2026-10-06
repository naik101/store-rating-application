const prisma = require('../prisma');

// Submit or Modify Rating (1 to 5)
const submitOrUpdateRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID is required.' });
    }

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store does not exist.' });
    }

    // Upsert rating: creates if not exists, updates if already exists
    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        storeId,
        rating,
      },
    });

    // Compute updated average for the store
    const storeRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });

    const totalRatings = storeRatings.length;
    const overallRating = totalRatings > 0
      ? parseFloat((storeRatings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
      : 0;

    return res.json({
      success: true,
      message: 'Rating saved successfully.',
      data: {
        rating: savedRating.rating,
        overallRating,
        totalRatings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitOrUpdateRating,
};
