const validator = require('validator');

const validateSignUp = (req) => {
    const { fullname, email, password, role } = req.body;

    if (!fullname) {
        throw new Error("Name can't be blank");
    } 
    if (!validator.isEmail(email)) {
        throw new Error("Email is not valid");
    }
    if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
        throw new Error("Use a strong password (at least one uppercase, one lowercase, and one number)");
    }
    if (!["donor", "institute", "shopkeeper"].includes(role)) {
        throw new Error("Invalid role");
    }
};

module.exports = { validateSignUp };