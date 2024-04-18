const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
    userName: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        trim: true
    },
   
    password: {
        type: String,
        trim: true,
        minlength: 6,
        maxlength: 30
    },
    department: {
        type: String,
        enum: ["Merchant", "Trim Department", "Fabric Department", "PATTERN MAKING", "PATTERN CUTTING", "FABRIC CUTTING", "SEWING", "FINISHING", "QC CHECK"],
        default: "Merchant"
    }
}, { timestamps: true });

//hash Password
UserSchema.pre('save', async function (next) {
    try {
        const user = this;
        if (!user.isModified('password')) return next();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        return next();
    } catch (error) {
        return next(error);
    }
});

//Decrypt  Password

UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};
const User = mongoose.model('User', UserSchema);

module.exports = User;
