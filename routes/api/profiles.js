const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profiles')
const User = require('../../models/User')
const {check, validationResult} = require('express-validator/check');

router.get('/me', auth, async (req,res)=>{
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate('user',['name', 'avatar']);
        if(!profile){
            return res.status(400).json({msg:'Profile Not Available'})
        }
        res.json(profile)
    }catch(err){
        console.error(err.message);
        res.status(500).json({msg:'Service error'})
    }
})

router.post('/', [auth, 
    check('status','status is required').not().isEmpty(),
    check('skills','skills are required').not().isEmpty()],
    async(req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()}); 
        }   
    const {website, location,bio,githubusername,status,skills,youtube,facebook,twitter,linkedin} = req.body;
    const ProfileFields = {};
    ProfileFields.user = req.user.id;
    if(website) ProfileFields.website = website;
    if(location) ProfileFields.location = location;
    if(bio) ProfileFields.bio = bio;
    if(githubusername) ProfileFields.githubusername = githubusername;
    if(status) ProfileFields.status = status;
    if(skills) {
        ProfileFields.skills = skills.split(',').map(skills=>skills.trim());
    }
    console.log(ProfileFields.skills);
    ProfileFields.social = {};
    if(youtube) ProfileFields.social.youtube = youtube;
    if(facebook) ProfileFields.social.facebook = facebook;
    if(twitter) ProfileFields.social.twitter = twitter;
    if(linkedin) ProfileFields.social.linkedin = linkedin;
    try{
        let profile = await Profile.findOne({user: req.user.id});

        if(profile){
            console.log('Im here')
            // mongoose.set('useFindAndModify', false);    
            profile = await Profile.findOneAndUpdate(
                {user:req.user.id},
                {$set:ProfileFields},
                {new:true});
            return res.json(profile);
        }   
        profile = new Profile(ProfileFields);
        await profile.save();
        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).json({msg:'Server Error'});
    }
})

router.get('/', async(req, res) => {
    try{
        const profile = await Profile.find().populate('user',['name','avatar']);
        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).json({msg:'Server Error'});
    }
})

router.get('/user/:user_id', async(req, res) => {
    try{
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);
        if(!profile) return res.status(400).json({msg: 'No profile for the user'});
        res.json(profile);
    }catch(err){
        console.error(err.message);
        if(err.kind) return res.status(400).json({msg: 'No profile for the user'});
        res.status(500).json({msg:'Server Error'});
    }
})

router.delete('/', auth, async(req,res)=>{
    try{
        await Profile.findOneAndRemove({user: req.user.id});
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg:'User Deleted'});
    }catch(err){
        console.error(err.message);
        res.status(500).json({msg:'Server Error'});
    }
})

module.exports = router;