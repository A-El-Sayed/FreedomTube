//Here you will require data files and export them as shown in lecture code and worked in previous labs.
const userData = require('./users')
const postData = require('./posts')
const commentsData = require('./comments')
const statsData = require('./videoStat')


module.exports = {
    users: userData,
    posts: postData,
    comments: commentsData,
    stats: statsData
}