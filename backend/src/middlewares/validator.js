const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const validateRegistration = (req, res, next) => {
  const { name, email, password, address } = req.body;
  const errors = [];

  // Name validation: 20-60 characters
  if (!name || typeof name !== 'string' || name.trim().length < 20 || name.trim().length > 60) {
    errors.push('Name must be between 20 and 60 characters.');
  }

  // Email validation: standard email format
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  // Password validation: 8-16 characters, at least 1 uppercase letter, at least 1 special character
  if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    errors.push('Password must be 8-16 characters long, with at least 1 uppercase letter and 1 special character.');
  }

  // Address validation: Maximum 400 characters
  if (address === undefined || address === null || typeof address !== 'string' || address.length > 400) {
    errors.push('Address must not exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors.join(' ') });
  }

  // Clean strings
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.address = address.trim();

  next();
};

const validateAddUser = (req, res, next) => {
  const { name, email, password, address, role } = req.body;
  const errors = [];

  // Name validation: 20-60 characters
  if (!name || typeof name !== 'string' || name.trim().length < 20 || name.trim().length > 60) {
    errors.push('Name must be between 20 and 60 characters.');
  }

  // Email validation
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  // Password validation: 8-16 characters, 1 uppercase, 1 special character
  if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    errors.push('Password must be 8-16 characters long, with at least 1 uppercase letter and 1 special character.');
  }

  // Address validation: Maximum 400 characters
  if (address === undefined || address === null || typeof address !== 'string' || address.length > 400) {
    errors.push('Address must not exceed 400 characters.');
  }

  // Role validation: ADMIN, USER, STORE_OWNER
  const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
  if (!role || !validRoles.includes(role)) {
    errors.push('Role must be one of: ADMIN, USER, STORE_OWNER.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors.join(' ') });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.address = address.trim();

  next();
};

const validateAddStore = (req, res, next) => {
  const { name, email, address } = req.body;
  const errors = [];

  // Store Name: 20-60 characters
  if (!name || typeof name !== 'string' || name.trim().length < 20 || name.trim().length > 60) {
    errors.push('Store name must be between 20 and 60 characters.');
  }

  // Store Email: standard email format
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required for the store.');
  }

  // Store Address: Maximum 400 characters
  if (address === undefined || address === null || typeof address !== 'string' || address.length > 400) {
    errors.push('Store address must not exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors.join(' ') });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.address = address.trim();

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('Current password is required.');
  }

  if (!newPassword || typeof newPassword !== 'string' || !PASSWORD_REGEX.test(newPassword)) {
    errors.push('New password must be 8-16 characters long, with at least 1 uppercase letter and 1 special character.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors.join(' ') });
  }

  next();
};

const validateRating = (req, res, next) => {
  const { rating } = req.body;

  const parsed = Number(rating);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5.',
    });
  }

  req.body.rating = parsed;
  next();
};

module.exports = {
  validateRegistration,
  validateAddUser,
  validateAddStore,
  validatePasswordChange,
  validateRating,
  EMAIL_REGEX,
  PASSWORD_REGEX,
};
