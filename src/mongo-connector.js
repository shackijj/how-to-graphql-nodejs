const {MongoClient} = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017';
const dbName = 'hackernews';

module.exports = async () => {
    const client = await MongoClient.connect(MONGO_URL);
    const db = client.db(dbName);
    return {
        Links: db.collection('links'),
        Users: db.collection('users'),
    };
}