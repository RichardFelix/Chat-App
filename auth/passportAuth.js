module.exports = function(passport, FacebookStragety, config, mongoose){
    
    var chatUser = new mongoose.Schema({
        profileID:String,
        fullname:String,
        profilePic:String
    })
    
    var userModel = mongoose.model('chatUser', chatUser);
    
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id,done){
        userModel.findById(id, function(err, user){
            done(err, user);
        })
    })
    
    passport.use(new FacebookStragety({
        clientID: config.fb.appID,
        clientSecret: config.fb.appSecret,
        callbackURL: config.fb.callbackURL,
        profileFields: ['id', 'displayName', 'photos']
    }, function(accessToken, refreshToken, profile, done){
            userModel.findOne({'profileID':profile.id}, function(err, result){
                if(result){
                    done(null, result);
                }else{
                    var NewChatUser = new userModel({
                        profileID:profile.id,
                        fullname:profile.displayName,
                        profilePic:profile.photos[0].value || ''
                    });
                    
                    NewChatUser.save(function(err){
                        done(null, NewChatUser);
                    })
                }
            })
    }))
}


