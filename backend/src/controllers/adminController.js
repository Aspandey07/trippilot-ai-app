const User = require('../models/User');
const Itinerary = require('../models/Itinerary');

// Get overview stats
const getStats = async (req, res) => {
  try {
    const users = await User.find({});
    const itineraries = await Itinerary.find({});

    // Count roles
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role !== 'admin').length;

    // Get recent registrations and itineraries
    // MongoDB or Fallback DB returns QueryChain which resolves to Array
    const recentUsers = [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));

    const recentItineraries = [...itineraries]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      totalUsers: users.length,
      totalItineraries: itineraries.length,
      adminCount,
      userCount,
      recentUsers,
      recentItineraries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const safeUsers = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      createdAt: u.createdAt
    }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Safety check: Prevent self-demotion
    if (userId.toString() === req.user.id.toString() && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove admin rights from yourself' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { role });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User role updated to ${role} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user and their itineraries
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety check: Prevent deleting self
    if (id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all itineraries belonging to this user
    const userItineraries = await Itinerary.find({ user: id });
    for (const itinerary of userItineraries) {
      await Itinerary.findByIdAndDelete(itinerary._id);
    }

    res.json({ message: 'User and all associated itineraries successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all itineraries
const getAllItineraries = async (req, res) => {
  try {
    // Populate is handled by fallbackDb or mongoose
    const itineraries = await Itinerary.find({}).populate('user', 'name email');
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an itinerary
const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItinerary = await Itinerary.findByIdAndDelete(id);
    if (!deletedItinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.json({ message: 'Itinerary successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllItineraries,
  deleteItinerary
};
