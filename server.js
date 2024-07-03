var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/productDB");
var product = require("./model/product.js");
const User = require('./model/user.js');
const crypto = require("crypto");
const session = require('express-session');
const salt = bcrypt.genSaltSync(10);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function( ) {
    console.log("hurray! we connected");
});

app.use("/", (req, res, next) => {
  next();
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }

    const userData = await User.findOne({ username });
    if (!userData) {
      return res.status(400).json({
        errorMessage: 'Username is incorrect!',
        status: false
      });
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({
        errorMessage: 'Password is incorrect!',
        status: false
      });
    }

    // req.session.userId = userData._id; // Uncomment if using sessions

    res.status(200).json({
      token: 'dummyToken', // Generate a real token in a real-world application
      role: userData.role
    });
  } catch (error) {
    console.error("Error during login:", error); // Log the error for debugging
    res.status(500).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

const saltRounds = 10;
app.post("/register", (req, res) => {
  try {
    const { username, role } = req.body;
    if (!username || !role) {
      return res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }

    user.find({ username: username }, (err, data) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({
          errorMessage: 'Something went wrong!',
          status: false
        });
      }

      if (data.length === 0) {
        const defaultPassword = username + '123';
        const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);
        let User = new user({
          username: username,
          password: hashedPassword,
          role: role,
          isFirstLogin: true,
        });

        User.save((err, data) => {
          if (err) {
            console.error('Error saving user:', err);
            return res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            // Here we can send the password to the user via email or any other method
            res.status(200).json({
              status: true,
              title: 'Registered Successfully. Please check your email for the password.',
              password: defaultPassword // You would typically not send this in a real app
            });
          }
        });
      } else {
        res.status(400).json({
          errorMessage: `UserName ${username} Already Exist!`,
          status: false
        });
      }
    });
  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


/* Function to check user and generate token */
function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.username, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err
      });
    } else {
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true
      });
    }
  });
}

/* Add Product API */
app.post("/add-product", (req, res) => {
  try {
    if (req.body && req.body.name && req.body.customer && req.body.accType && req.body.orderType && req.body.newCol1 && req.body.newCol2 && req.body.platform && req.body.reqDate && req.body.submissionDate && req.body.startDate && req.body.endDate && req.body.rolloverDate && req.body.rolloverDays && req.body.rolloverDaysH && req.body.waitingDays && req.body.waitingDaysH && req.body.testingDays && req.body.testingDaysH  && req.body.config && req.body.status && req.body.testedBy && req.body.rel && req.body.reportNo && req.body.releaseDate && req.body.reviewedBy && req.body.codeCompare && req.body.newFW && req.body.tBugs && req.body.submissionReason ) {
      let new_product = new product({
        name: req.body.name,
        customer: req.body.customer,
        accType: req.body.accType,
        orderType: req.body.orderType,
        newCol1: req.body.newCol1,
        newCol2: req.body.newCol2,
        platform: req.body.platform,
        reqDate: req.body.reqDate,
        submissionDate: req.body.submissionDate,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        rolloverDate: req.body.rolloverDate,
        rolloverDays: req.body.rolloverDays,
        rolloverDaysH: req.body.rolloverDaysH,
        waitingDays: req.body.waitingDays,
        waitingDaysH: req.body.waitingDaysH,
        testingDays: req.body.testingDays,
        testingDaysH: req.body.testingDaysH,
        config: req.body.config,
        status: req.body.status,
        testedBy: req.body.testedBy,
        rel: req.body.rel,
        reportNo: req.body.reportNo,
        releaseDate: req.body.releaseDate,
        reviewedBy: req.body.reviewedBy,
        codeCompare: req.body.codeCompare,
        newFW: req.body.newFW,
        tBugs: req.body.tBugs,
        submissionReason: req.body.submissionReason,
        //user_id: req.user.id
      });      
      new_product.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Product Added successfully.'
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } 
  catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.post("/update-product", (req, res) => {
  try {
    if (req.body && req.body.id) {
      product.findById(req.body.id, (err, new_product) => {
        if (err || !new_product) {
          return res.status(404).json({
            errorMessage: 'Product not found!',
            status: false
          });
        }

        // Update only provided fields
        Object.keys(req.body).forEach(key => {
          if (req.body[key] !== undefined && req.body[key] !== null) {
            new_product[key] = req.body[key];
          }
        });

        new_product.save((err, data) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            res.status(200).json({
              status: true,
              title: 'Product updated.'
            });
          }
        });
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});




/* Delete Product API */
app.post("/delete-product", (req, res) => {
  try {
    if (req.body && req.body.id) {
      product.findByIdAndUpdate(req.body.id, { is_delete: true }, { new: true }, (err, data) => {
        if (data && data.is_delete) {
          res.status(200).json({
            status: true,
            title: 'Product deleted.'
          });
        } else {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});




app.get("/get-product", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false
    });
    if (req.query && req.query.search) {
      const searchQuery = { $regex: req.query.search, $options: 'i' };
      query["$and"].push({
        $or: [
          { customer: searchQuery },
          { name: searchQuery },
          { platform: searchQuery },
          { config: searchQuery },
          { testedBy: searchQuery }
        ]
      });
    }
    var perPage = 5;
    var page = req.query.page || 1;
    product.find(query, { date: 1, name: 1, id: 1,customer: 1, accType: 1,orderType: 1, newCol1: 1, newCol2: 1,platform: 1,  config: 1, status: 1, testedBy: 1, reqDate: 1, submissionDate: 1, startDate: 1, endDate: 1, rolloverDate: 1, rolloverDays: 1, rolloverDaysH: 1, waitingDays: 1, waitingDaysH: 1, testingDays: 1, testingDaysH: 1, reportNo: 1, releaseDate: 1, reviewedBy: 1, codeCompare: 1, newFW: 1, rel: 1, reportNo: 1, releaseDate: 1, reviewedBy: 1, codeCompare: 1, newFW: 1, tBugs: 1, submissionReason: 1, image: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        console.log("Data from backend:", data);
        product.find(query).count()
          .then((count) => {
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Product retrived.',
                products: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'There is no product!',
                status: false
              });
            }
          });
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.get("/get-users", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false
    });
    if (req.query && req.query.search) {
      const searchQuery = { $regex: req.query.search, $options: 'i' };
      query["$and"].push({
        $or: [
          { username: searchQuery },
          { role: searchQuery }
        ]
      });
    }
    var perPage = 10;
    var page = req.query.page || 1;
    console.log("Query:", query); // Log the query
    User.find(query, { username: 1, role: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        console.log("Data from backend:", data);
        User.find(query).count()
          .then((count) => {
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Users retrieved.',
                users: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'There are no users!',
                status: false
              });
            }
          });
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Use your JWT secret
    return decoded.userId; // Assuming the token contains the userId
  } catch (error) {
    return null;
  }
};

app.get('/get-user', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ errorMessage: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ errorMessage: 'Unauthorized: Invalid token format' });
  }

  // Replace 'your_jwt_secret' with your actual secret key used to sign the JWT
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ errorMessage: 'Unauthorized: Invalid token' });
    }

    const userId = decoded.id; // Adjust according to how the ID is stored in the token

    if (!userId) {
      return res.status(401).json({ errorMessage: 'Unauthorized: User ID not found in token' });
    }

    User.findById(userId, { username: 1, role: 1 })
      .then(user => {
        if (!user) {
          return res.status(404).json({ errorMessage: 'User not found' });
        }
        res.status(200).json({ user });
      })
      .catch(err => {
        res.status(500).json({ errorMessage: 'Internal server error', error: err.message });
      });
  });
});

app.put("/edit-user/:id", (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body;
  User.findByIdAndUpdate(id, { username, role }, { new: true })
    .then((user) => {
      res.status(200).json({
        status: true,
        message: 'User updated successfully.',
        user
      });
    })
    .catch((err) => {
      res.status(400).json({
        errorMessage: err.message || err,
        status: false
      });
    });
});

// Route for deleting a user
app.delete("/delete-user/:id", (req, res) => {
  const { id } = req.params;

  User.findByIdAndUpdate(id, { is_delete: true })
    .then(() => {
      res.status(200).json({
        status: true,
        message: 'User deleted successfully.'
      });
    })
    .catch((err) => {
      res.status(400).json({
        errorMessage: err.message || err,
        status: false
      });
    });
});

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.get("/graph-product", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false
    });
    if (req.query && req.query.search) {
      const searchQuery = { $regex: req.query.search, $options: 'i' };
      query["$and"].push({
        $or: [
          { customer: searchQuery },
          { name: searchQuery },
          { platform: searchQuery },
          { config: searchQuery },
          { testedBy: searchQuery }
        ]
      });
    }
    var perPage = 1000;
    var page = req.query.page || 1;
    product.find(query, { date: 1, name: 1, id: 1,customer: 1, accType: 1,orderType: 1, newCol1: 1, newCol2: 1,platform: 1,  config: 1, status: 1, testedBy: 1, reqDate: 1, submissionDate: 1, startDate: 1, endDate: 1, rolloverDate: 1, rolloverDays: 1, rolloverDaysH: 1, waitingDays: 1, waitingDaysH: 1, testingDays: 1, testingDaysH: 1, reportNo: 1, releaseDate: 1, reviewedBy: 1, codeCompare: 1, newFW: 1, rel: 1, reportNo: 1, releaseDate: 1, reviewedBy: 1, codeCompare: 1, newFW: 1, tBugs: 1, submissionReason: 1, image: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        console.log("Data from backend:", data);
        product.find(query).count()
          .then((count) => {
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Product retrived.',
                products: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'There is no product!',
                status: false
              });
            }
          });
      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

// Endpoint to reset password
app.post('/reset-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        errorMessage: 'User not found!',
        status: false
      });
    }

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        errorMessage: 'Old password is incorrect!',
        status: false
      });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully.',
      status: true
    });
  } catch (err) {
    res.status(500).json({
      errorMessage: err.message || 'Something went wrong!',
      status: false
    });
  }
});


app.post('/api/re-password', async (req, res) => {
  const { username, newPassword } = req.body;
  
  try {
    // Check if the user exists
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    existingUser.password = hashedPassword;
    existingUser.isFirstLogin = true; // Optionally reset isFirstLogin flag
    await existingUser.save();

    // Respond with success message
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
});

// Other existing routes...
app.listen(2000, () => {
  console.log("Server is running on port 2000");
});

