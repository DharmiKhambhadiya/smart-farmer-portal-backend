module.exports = (req, res, next) => {
  const { email, password } = req.body;

  if (
    !email ||
    typeof email !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ message: "Invalid or missing fields" });
  }

  next(); // proceed if validation passes
};
