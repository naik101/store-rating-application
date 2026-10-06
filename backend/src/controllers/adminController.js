const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

// 1. View Dashboard Stats: Total Users, Stores, and Ratings
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. View Users with Search, Filter by Role, and Sorting (Asc/Desc)
const getUsers = async (req, res, next) => {
  try {
    const { search = '', role, sortBy = 'createdAt', order = 'desc' } = req.query;

    const where = {};

    // Filter by role if provided and valid
    if (role && ['ADMIN', 'USER', 'STORE_OWNER'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    // Search by Name, Email, Address
    if (search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
      ];
    }

    // Sorting
    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            ratings: true,
            stores: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

// 3. View Complete User Details
const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            _count: { select: { ratings: true } },
          },
        },
        ratings: {
          select: {
            id: true,
            rating: true,
            createdAt: true,
            store: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Add User (Admin, Normal User, Store Owner)
const addUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// 5. View Stores with Search, Sorting, and Overall Ratings
const getStores = async (req, res, next) => {
  try {
    const { search = '', sortBy = 'name', order = 'asc' } = req.query;

    const where = {};

    if (search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    // Calculate rating metrics
    const storesWithRating = stores.map((s) => {
      const totalRatings = s.ratings.length;
      const avgRating = totalRatings > 0
        ? parseFloat((s.ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
        : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        owner: s.owner,
        totalRatings,
        rating: avgRating,
        createdAt: s.createdAt,
      };
    });

    // Custom sorting including rating
    const sortOrder = order.toLowerCase() === 'desc' ? -1 : 1;
    storesWithRating.sort((a, b) => {
      if (sortBy === 'rating') {
        return (a.rating - b.rating) * sortOrder;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * sortOrder;
      }
      if (sortBy === 'email') {
        return a.email.localeCompare(b.email) * sortOrder;
      }
      if (sortBy === 'address') {
        return a.address.localeCompare(b.address) * sortOrder;
      }
      if (sortBy === 'createdAt') {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder;
      }
      return 0;
    });

    return res.json({
      success: true,
      data: { stores: storesWithRating },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Add Store
const addStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existingStore = await prisma.store.findUnique({ where: { email } });
    if (existingStore) {
      return res.status(409).json({ success: false, message: 'A store with this email already exists.' });
    }

    let validOwnerId = null;
    if (ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner || owner.role !== 'STORE_OWNER') {
        return res.status(400).json({ success: false, message: 'Assigned owner must be an existing user with role STORE_OWNER.' });
      }
      validOwnerId = owner.id;
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: validOwnerId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

// 7. View Store Owner Rating Information
const getStoreOwnerRatings = async (req, res, next) => {
  try {
    const owners = await prisma.user.findMany({
      where: { role: 'STORE_OWNER' },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        stores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: {
              select: {
                id: true,
                rating: true,
                createdAt: true,
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
        },
      },
    });

    const formattedOwners = owners.map((owner) => {
      const storesWithStats = owner.stores.map((store) => {
        const totalRatings = store.ratings.length;
        const avgRating = totalRatings > 0
          ? parseFloat((store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
          : 0;

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          totalRatings,
          averageRating: avgRating,
          ratings: store.ratings.map((r) => ({
            id: r.id,
            rating: r.rating,
            createdAt: r.createdAt,
            user: r.user,
          })),
        };
      });

      return {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        address: owner.address,
        stores: storesWithStats,
      };
    });

    return res.json({
      success: true,
      data: { owners: formattedOwners },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserDetails,
  addUser,
  getStores,
  addStore,
  getStoreOwnerRatings,
};
