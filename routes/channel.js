const express = require('express');
const router = express.Router();
const data = require('../data');
const channelData = data.channel;




// get all channels
router.route('/').get(async(req,res) => {
    try {
        const allChannel = await channelData.getAllChannel();
        res.render('channel/error', {error: e});
    } catch(e) {
        res.status(500).render('error', {error: e});
    }
    
})
// get channel by Id
router.get('/:channelId', async(req, res) => {
    const chennelId = req.params.channelId.trim();

    // check input
    try {
        await channelData.getChannelById(chennelId);
    } catch(e) {
        res.status(400).render('error', {error: e});
    }

    try {
        let result = await channelData.getChannelById(chennelId);
        if (!result) {
            res.status(404).render('channelNotFound', {searchChannel: chennelId});
            return;
        }
        res.render('channel/channelFound', {channelData: result});
    } catch(e) {
        res.status(500).render('error', {error: e});
    }

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

// create a channel
router.route('new')
.get(async(req, res) => {
    res.render('channel/new');
})
.post(async(req, res) => {
    const userInputData = req.body;
    let errors = [];

    if (!userInputData.channelName) {
        errors.push('No channelName provided');
    }

    if (!userInputData.email) {
        errors.push('No email provided');
    }
    
    if (errors.length > 0) {
        res.render('channel/new', { // redirect to create page to ask correct input from user
        errors: errors,
        hasErrors: true,
        userInputData: userInputData,
        });
        return;
    }

    try {
        const newChannel = await channelData.addChannel(
        userInputData.channelName,
        userInputData.email,
        );

        res.redirect(`/channel/${newChannel._id}`); // redirect to user channel page
    } catch (e) {
        res.status(500).json({error: e});
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
            res.status(404).render('channelNotFound', {searchChannel: chennelId});
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
.delete(async (req, res) => {
    
    try {
        await channelData.getChannelById(req.params.id);
    } catch (e) {
        res.status(404).render('channelNotFound', {searchChannel: channelId})
        return;
    }

    try {
        await channelData.removeChannel(req.params.id);
        res.redirect('/'); // redirect to homepage
    } catch (e) {
        res.status(500).render('error', {error: e});
    }
})


module.exports = router;