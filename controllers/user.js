const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const maskemail = require("maskemail");

exports.signup = (req, res, next) => {
  User.findOne({ email: req.body.email }).then((email) => {
    if (email) {
      return res
        .status(401)
        .json({ message: "Cette adresse email est déjà inscrit" });
    } else {
      bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
          const user = new User({
            userId: req.body.userId,
            email: maskemail(req.body.email, { allowed: /@\.-/ }),
            password: hash,
          });
          user
            .save()
            .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
            .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
    }
  });
};

exports.login = (req, res, next) => {
  User.findOne({ email: maskemail(req.body.email) })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
