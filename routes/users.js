const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


const User = require('../models/User');

//Login Page
router.get('/login', (req, res) => res.render('login'));

module.exports = router;

//Login Page
router.get('/register', (req, res) => res.render('register'));


//Register Handle
router.post('/register', (req, res)=>{
    const { name, summonerName, email, password, password2 } = req.body;

    let errors = [];


    //check required fields
    if(!name || !email || !summonerName || !password || !password2){
        errors.push({msg: 'Please fill in all fields'});
    }

    //check passwords match
    if(password !== password2) {
        errors.push ({msg: 'Passwords do not match'});
    }

    //check pass length
    if(password.length < 6){

        errors.push({msg: 'Password should be at least 6 characters'});
    }

    if(errors.length > 0){

        res.render('register', {
            errors, 
            name, 
            summonerName,
            email,
            password,
            password2 
        })


    }
    else {
        User.findOne({email: email})
        .then(user => {
            if(user) {
                //already has that email
                errors.push({ msg: 'Email Already Registered'});
                res.render('register', {
                    errors, 
                    name, 
                    summonerName,
                    email,
                    password,
                    password2 
                });
            } else {
                const newUser = new User({
                    name, 
                    summonerName,
                    email,
                    password
                });

               //pass encryption
               bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) =>{
                   if(err) throw err;
                   //password is hashed password
                   newUser.password = hash;

                   newUser.save()
                   .then(user =>{
                       req.flash('success_msg', 'Registration Success');
                       res.redirect('/users/login')
                   })
                   .catch(err => console.log(err));

               } ))

            }
        });
    }

});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true 

    })(req, res, next);  
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});


module.exports = router;