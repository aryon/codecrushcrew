let admins = [
  "brandon@pixegon.com",
  "cashley@cultivatecoders.com"
];

module.exports = {
  isAdmin: function() {
    return (req, res, next) => {
      req.isAdmin = false;

      if(req.user && admins.includes(req.user.email)) {
        req.isAdmin = true;
      }

      next();
    }
  }
}
