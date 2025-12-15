

const User = require('../models/User');
const mongoose = require('mongoose');

const getMe = async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const totalBalance = user.totalIncome - user.totalExpenses;

        res.status(200).json({

            username: user.username,
            email: user.email,
            profilePhotoURL: user.profilePhotoURL || 'default_profile.png',
            totalIncome: user.totalIncome,
            totalExpenses: user.totalExpenses,
            totalBalance: totalBalance,
        });

    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


const updateIncome = async (req, res) => {
    const { newBaseIncome } = req.body;

    if (typeof newBaseIncome !== 'number') {
        return res.status(400).json({ message: 'New base income must be a number.' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { totalIncome: newBaseIncome },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }



        res.status(200).json({
            message: 'Base income updated successfully',
            totalIncome: user.totalIncome
        });

    } catch (error) {
        console.error('Update Income Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


const updateUserProfile = async (req, res) => {

    const { username, email, profilePhotoURL } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username || user.username;

        if (profilePhotoURL) {
            user.profilePhotoURL = profilePhotoURL;
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'This email is already registered by another user.' });
            }
            user.email = email;
        }

        const updatedUser = await user.save();

        res.json({
            username: updatedUser.username,
            email: updatedUser.email,
            profilePhotoURL: updatedUser.profilePhotoURL,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error during profile update', error: error.message });
    }
};


module.exports = {
    getMe,
    updateIncome,
    updateUserProfile
};