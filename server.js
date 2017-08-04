var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jsonWebToken = require('jsonwebtoken');
var config = require('./config');
var userModel = require('./app/models/user');

var apiRoutes = express.Router();
var port = process.env.port || 5000;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));


// app.get('/', function (req, res) {
//     res.send("naveedaheer.com");
// });







app.get('/create', function (req, res) {

    var userInfo = new userModel({
        userFullName: 'Naveed Aheer',
        userPassword: 'naveed123',
        admin: true
    });

    userInfo.save(function (err) {
        if (err) { throw err; }

        console.log('User Saved Successfully');
        res.json({ succuess: true });
    })
})

apiRoutes.post('/auth', function (req, res) {
    userModel.findOne({
        userFullName: req.body.userFullName
    }, function (err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            res.json({ success: false, response: 'auth failed' })
        } else if (user) {
            if (user.userPassword != req.body.userPassword) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {
                var token = jsonWebToken.sign(user, app.get('superSecret'), {
                    expiresIn: 1440,
                });
            }
        }
        res.json({
            success: true,
            response: "You got Token",
            token: token
        });
    })
})

apiRoutes.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jsonWebToken.verify(token, app.get('superSecret'), function (err, decode) {
            if (err) {
                return res.json({ success: false, response: 'Failed to authenticate' });
            } else {
                req.decode = decode;
                next();
            }
        });
    } else {
        // no token
        return res.status(403).send({
            success: false,
            response: 'No token provided'
        });
    }
});

apiRoutes.get('/', function (req, res) {
    res.json({ response: 'welcome to naveedaheer.com' });
});

apiRoutes.get('/users', function (req, res) {
    userModel.find({}, function (err, users) {
        res.json(users);
    });
});

app.use(apiRoutes);
app.listen(port);
console.log("app is running on port " + port);