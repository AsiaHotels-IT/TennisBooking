const User = require('../model/user');

// สมัครสมาชิก
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).send('User already exists!!');
    }
    user = new User({
      username,
      password, // เก็บ plain text!
      role
    });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// ล็อกอิน
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found...');
    }
    if (password !== user.password) {
      return res.status(400).send('Password is not correct');
    }
    // เก็บ user info ใน session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };
    res.send({ success: true, user: req.session.user });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// logout
exports.logout = async (req, res) => {
  req.session.destroy(() => {
    res.send({ success: true });
  });
};