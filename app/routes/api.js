 var bodyParser = require('body-parser');  
  var User = require('../models/user'); 
  var jwt = require('jsonwebtoken'); 
 var config = require('../../config');

 var superSecret = config.secret;

module.exports= function(app,express){
var apiRouter= express.Router();

apiRouter.post('/authenticate', function(req,res){
  User.findOne({
    username: req.body.username
  }).select('password').exec(function(err,user){
    if (err) throw err;

      //no user with that username was found
    if(!user) {
      res.json({success:false, message:'Authenication failed. User not found'});
    } else if (user){
      //check if password matches
      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword){
        res.json({success: false, message:'Wrong password'});
      }
      else {
        //if user is found and password is right
        //create a token
         var token = jwt.sign(user, superSecret, { 
          expiresInMinutes: 1440 }); 
        //return the information including token as JSON
        res.json({
          success: true,
          message:'Welcome Aboard',
          token:token
        });
      }
    }
  });
});

//route middleware to verify a token
apiRouter.use(function(req,res,next){
  
  //check header or url parameters or post parameters for token
  var token = req.body.token || req.param('token') || req.headers['x-access-token'];

  //decode token
  if(token) {
    //verifies secret and checks exp
    jwt.verify(token,superSecret,function(err,decoded){
      if (err) {
        return res.status(403).send({ success: false, message: 'Failed to authenticate token'});

      } else {
        //if all checks out, save to request for use in other routes
        req.decoded=decoded;
        next();
      }
    });
  }
  else {

    //if there is no token return an http response of 403
    return res.status(403).send({success:false, message: 'No token provides'});
  }
  
});

apiRouter.get('/',function(req,res){
   res.json({message:'hooray! welcome to our api'});
});

apiRouter.route('/users')
  .post(function(req,res){
    var user= new User();
    user.name= req.body.name;
    user.username=req.body.username;
    user.password= req.body.password;

    user.save(function(err){
      if (err){
        if (err.code== 11000)
          return res.json({success:false, message: 'A user with that username already exists.'});

        else 
          return res.send(err);
      }
      res.json ({message:"User Created!"});
    });
  })
  .get(function(req,res){
    User.find(function(err,users){
    if (err) res.send(err);

    res.json(users);
  });
  });

  apiRouter.route('/users/:user_id')

  .get(function(req, res){
    User.findById(req.params.user_id, function(err,user){
      if (err) res.send(err);

      res.json(user);
    });
  })

  .put(function(req, res) { 
  User.findById(req.params.user_id, function(err, user) {
  if (err) res.send(err); 
   if (req.body.name) user.name = req.body.name; 
    if (req.body.username) user.username = req.body.username; 
    if (req.body.password) user.password = req.body.password; 
 user.save(function(err)
  { if (err) res.send(err); 
  res.json({ message: 'User updated!' });  });  });  })

  .delete(function(req,res){
    
      User.remove({
        _id: req.params.user_id
      }, function(err,user){
        if (err) res.send(err);
        res.json({message: 'Successfully Deleted'});
      });
    });
  
 return apiRouter;
};
