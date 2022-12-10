const express = require('express');
const router = express.Router();
const data = require('../data');
const channelData = data.users




// get all channels 
router.route('/').get(async(req,res) => {
    try {
        const allChannels = await channelData.getAllChannels();
        console.log("Get all channels");
        console.log(allChannels);
        res.render('channel/error', {error: e});
    } catch(e) {
        res.status(500).render('error', {error: e});
    }
    
})

router.route('/delete')
.get(async (req, res) => {
    res.render('./protected/deleteChannel',{
        username: req.session.user.username
    })
})
.delete(async (req, res) => {
    let output;
    try{
        output = await channelData.removeChannel(req.session.user.username)
        // res.render('./protected/logout'); //no idea why it is not rendering. I think it is because I need to refresh. Normally, you change route and then render. Here you render twice with the same endpoint /delete. We call "get" and "delete" on /delete
        res.redirect('../../logout')
        
    }catch(error){
        res.render('error', {error: error})
    }
})


// get channel by Id
router.get('/:channelId', async(req, res) => {
    const channelID = req.params.channelId.trim();

    // check input
    try {
        let result = await channelData.getChannelById(channelID);
        res.render('channel/channelFound', {
            username: result.username,
            subscriber: result.subscribers.toString(),
            totalviews: result.totalViews.toString(),
            subscribedChannels: result.subscribedChannels.toString(),
            videosID: result.videosID.toString(),
        });
    } catch(e) {
        if (e === "No user with that id") {
            res.status(404).render('channel/channelNotFound', {searchChannel: channelID});
        }else{
        res.status(500).render('error', {error: e});
    }}

})

// get channel by name
router.get('/:channelName', async(req, res) => {
    const channelName = req.params.channelName.trim();

    // check input
    try {
        await channelData.getChannelByName(channelName);
    } catch(e) {
        res.status(400).render('error', {error: e});
    }

    try {
        let result = await channelData.getChannelByName(channelName);
        if (!result) {
            res.status(404).render('channelNotFound', {searchChannel: channelName});
            return;
        }
        res.render('channel/channelNotFound', {channelData: result});
    } catch(e) {
        res.status(500).render('error', {error: e});
    }

})

//update a channel
router.route('/update/:id')
.get(async(req, res) => {

    // check Id
    try {
        let result = await channelData.getChannelById(req.params.id.trim())
    } catch(e) {
        res.status(404).render('channelNotFound', {searchChannel: channelId})
    }
    res.render('channel/update', {channelData: result})

    // check the channel exist
    try {
        let result = await channelData.getChannelById(req.params.id.trim())
        if (!result) {
            res.status(404).render('channelNotFound', {searchChannel: channelID});
            return;
        }
        res.render('channel/updatePage', {channelData: result});

    } catch(e) {
        res.status(500).render('error', {error: e});
    }
    
})
.put(async (req, res) => {
    let updatedData = req.body;
    let errors = [];

    if (!updatedData.channelName) {
        errors.push('No channelName provided');
    }

    if (!updatedData.email) {
        errors.push('No email provided');
    }

    if (errors.length > 0) {
        res.render('channel/update', { // redirect to update page to ask correct input from user
        errors: errors,
        hasErrors: true,
        updatedData: updatedData,
        });
        return;
    }
    
    try {
        const updatedChannel = await channelData.updatePost(updatedData.channelName, updatedData.email);
        res.redirect(`/channel/${updatedChannel._id}`);
    } catch (e) {
        res.status(500).render('error', {error: e});
    }
    
})



module.exports = router;