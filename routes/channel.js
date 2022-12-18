const express = require('express');
const router = express.Router();
const data = require('../data');
const helpers = require('../helper/validation');
const xss = require('xss');
const channelData = data.users




// get all channels 
router.route('/').get(async(req,res) => {
    try {
        const allChannels = await channelData.getAllChannels();
        console.log("Get all channels");
        console.log(allChannels);
        res.render('channel/error', {title: 'error', error: e});
    } catch(e) {
        res.status(500).render('error', {title: 'error', error: e});
    }
    
})

router.route('/delete')
.get(async (req, res) => {
    res.render('./protected/deleteChannel',{
        username: req.session.user.username,
        title: "Delete Channel"
    })
})
.delete(async (req, res) => {
    let output;
    try{
        output = await channelData.removeChannel(req.session.user.username)
        // res.render('./protected/logout'); //no idea why it is not rendering. I think it is because I need to refresh. Normally, you change route and then render. Here you render twice with the same endpoint /delete. We call "get" and "delete" on /delete
        res.redirect('../../logout')
        
    }catch(error){
        res.render('error', {title: 'error', error: error})
    }
})


module.exports = router;