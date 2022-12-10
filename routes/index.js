//Here you will require route files and export them as used in previous labs
//Here you will require route files and export them as used in previous labs
const postRoutes = require('./post');
const videoFeedRoutes = require('./videoFeed');
const channelRoutes = require('./channel');
const userRoutes = require('./users');
const commentRoutes = require('./comments');

const constructorMethod = (app) => {
    app.use('/api/posts', postRoutes);
    app.use('/videoFeedRoutes', videoFeedRoutes);
    app.use('/channel', channelRoutes);
    app.use('/', userRoutes);
    app.use('/comments', )
    
    app.use('*', (req, res) => { //TODO Might never be called? since everything will go to 5.
        res.status(404).render('error', {
            title: "error",
            error: 'invalid url'
        })
    });
};
  
  module.exports = constructorMethod;
  