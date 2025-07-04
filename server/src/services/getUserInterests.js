const User = require('../models/users');
const Recommendation = require('../models/recommendations');

const getUserInterests = async (userId) => {
    //fetch user's interests from the database
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // console.log("user interests:", user.interests);
        return user.interests;
    } catch (error) {
        console.error('Error fetching user interests:', error);
        throw error;
    }
}

module.exports = getUserInterests;