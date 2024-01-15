const Auth = require("../models/auth");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {

    const { username, password, role } = req.body;

    //encrypt user password by hashing the password
    encryptedPassword = await bcrypt.hash(password, 10);

    const auth = new Auth(({
        username,
        password: encryptedPassword,
        role
    }))

    auth.save()
        .then(user => {

            // create JWT token
            const token = jwt.sign(
                {
                    userid: user._id,
                    username: user.username,
                },
                "RANDOM-TOKEN",
                { expiresIn: "1h" }
            );

            auth.token = token

            //return auth object
            res.status(200).json({
                message: "User added",
                user: auth
            })
        })
        .catch(err => {
            if (err.code === 11000) {
                res.send({ message: "user already exists" })
            }
            else
                res.send({ message: "Internal Server Error" })
        })


}

const authenticateUser = (req, res) => {

    const { username, password } = req.body;

    Auth.findOne({ username })

        // if email exists
        .then((user) => {
            // compare the password entered and the hashed password found
            bcrypt
                .compare(password, user.password)
                .then((passwordCheck) => {

                    // check if password matches
                    if (!passwordCheck) {
                        return res.status(400).send({
                            message: "Passwords does not match",
                        });
                    }

                    // create JWT token
                    const token = jwt.sign(
                        {
                            userid: user._id,
                            username: user.username,
                        },
                        "RANDOM-TOKEN",
                        { expiresIn: "24h" }
                    );

                    //   return success response
                    res.status(200).send({
                        message: "Login Successful",
                        username: user.username,
                        token,
                    });
                })
                // catch error if password does not match
                .catch((error) => {
                    res.status(400).send({
                        message: "Passwords does not match",
                        error,
                    });
                });
        })
        // catch error if email does not exist
        .catch((e) => {
            res.status(404).send({
                message: "User not found",
                e,
            });
        });

}

module.exports = {
    registerUser,
    authenticateUser
}