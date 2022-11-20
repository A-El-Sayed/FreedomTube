const express = require('express');
const router = express.Router();
const data = require('../data');
const channelData = data.channel;
const userData = data.users;
const validation = require('../helper/validation');

router.get('/:channelId', async(req, res) => {
    const chennelId = req.params.channelId.trim();

    try {
        await channelData.getChannelById(chennelId);
    } catch(e) {
        res.status(400).render('error', {error: e});
    }

    try {
        let result = channelData.getChannelById(chennelId);
        if (!result) {
            res.status(404).render('channelNotFound', {searchChannel: chennelId});
            return;
        }
        res.render('homepage', {body: result});
    } catch(e) {
        res.status(500).render('error', {error: e});
    }

})

router.get('/:channelName', async(req, res) => {
    const channelName = req.params.channelName.trim();

    try {
        await channelData.getChannelByName(chennelId);
    } catch(e) {
        res.status(400).render('error', {error: e});
    }

    try {
        let result = channelData.getChannelById(chennelId);
        if (!result) {
            res.status(404).render('channelNotFound', {searchChannel: chennelId});
            return;
        }
        res.render('homepage', {body: result});
    } catch(e) {
        res.status(500).render('error', {error: e});
    }

})