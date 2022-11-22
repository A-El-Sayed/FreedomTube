//Here you will require route files and export them as used in previous labs
//Here you will require route files and export them as used in previous labs
const postRoutes = require('./post');
const videoFeedRoutes = require('./videoFeed');
const channelRoutes = require('./channel');

const constructorMethod = (app) => {
    app.use('/api/posts', postRoutes);
    app.use('/', videoFeedRoutes);
    app.use('/channel', channelRoutes);
    
    app.use('*', (req, res) => { //TODO Might never be called? since everything will go to 5.
        console.log("hello");
    });
};
  
  module.exports = constructorMethod;
  