const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key";

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY); 
        
        req.user = decoded; 

        console.log("Decoded:", decoded);

        next(); 
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
