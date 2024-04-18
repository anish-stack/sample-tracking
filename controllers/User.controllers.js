const User = require('../model/User.model');
const sendEmail = require('../utils/sendMail');
const sendToken = require('../utils/sendToken');

// New User Register
exports.newRegister = async (req, res) => {
    try {
        const { userName, email, password, department } = req.body;

        // Validate inputs
        if (!userName || !email  || !password || !department) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        // Create new user
        const newUser = new User({
            userName, email, password, department
        })

        await newUser.save();

        // Send welcome email (optional)
        await sendEmail({
            email: newUser.email,
            subject: 'Welcome to Real Time Sample Tracking',
            message: 'Thank you for registering with us!'
        });


        res.status(200).json({
            success:true,
            data:newUser
        })
    } catch (error) {
        console.error('Error in registering user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password, department } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Check department
        if (user.department !== department) {
            return res.status(401).json({ success: false, message: 'Invalid department.' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Send token
        await sendToken(user, res, 200);
   
        
    } catch (error) {
        console.error('Error in user login:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


// Logout User and clear Token in Cookies
exports.logout = async (req, res) => {
    try {
        // Clear token in cookies
        res.clearCookie('token');
        res.status(200).json({ success: true, message: 'User logged out successfully.' });
    } catch (error) {
        console.error('Error in user logout:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users, excluding the password field
        const users = await User.find({}, { password: 0 });

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error in fetching users:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Middleware to retrieve token from cookies
exports.getTokenFromCookies = (req, res, next) => {
    try {
        // Check if token exists in cookies
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({ success: false, message: 'Token not found in cookies.' });
        }
        res.status(200).json({
            success: true, message: 'Token  found in cookies.',data:token
        })
       

        next();
    } catch (error) {
        console.error('Error in getTokenFromCookies middleware:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


// Delete User by Id
exports.deleteUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Please provide userId.' });
        }

        // Find user and delete
        await User.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error in deleting user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

//get User by Department Name
exports.getUsersByDepartment = async (req, res) => {
    try {
        const { department } = req.params;

        // Validate department name
        if (!department) {
            return res.status(400).json({ success: false, message: 'Please provide department name.' });
        }

        // Query users by department
        const users = await User.find({ department });

        // If no users found for the department, return a message
        if (!users || users.length === 0) {
            return res.status(404).json({ success: false, message: 'No users found for the department.' });
        }

        // console.log(first)
        // Accumulate user names in an array
        const names = [];
        for (let index = 0; index < users.length; index++) {
            const element = users[index];
            console.log(element.userName);
            console.log(element.email);

            names.push(element.userName);
        }

        // Return user names
        res.status(200).json({ success: true, data: names });
    } catch (error) {
        console.error('Error in getting users by department:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
