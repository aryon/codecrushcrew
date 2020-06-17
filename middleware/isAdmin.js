let admins = [
  "brandon@pixegon.com",
  "cashley@cultivatecoders.com",
  "jordan@cultivatecoders.com",
  "dtenorio.work@gmail.com",
  "will.farmerie@gmail.com",
  "mayaa0511@gmail.com",
  "carolinesue505@gmail.com",
  "carl.marq95@gmail.com"
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
