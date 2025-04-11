const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const checkInstituteAccess = async (req, res, next) => {
  const instituteIdFromToken = req.user.instituteId;

  const requestedInstituteId = req.params.instituteId || req.body.instituteId;

  if (instituteIdFromToken !== requestedInstituteId) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  next();
};

module.exports = { authenticate, checkInstituteAccess };
