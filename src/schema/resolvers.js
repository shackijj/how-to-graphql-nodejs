const {ObjectID} = require('mongodb');
const {URL} = require('url');
const pubsub = require('../pubsub');

class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
    }
}

function assertValidLink({url}) {
    try {
        new URL(url);
    } catch (error) {
        throw new ValidationError('Link validation error: invalid url.', 'url');
    }
}
module.exports = {
    Query: {
        allLinks: async (root, data, {mongo: {Links}}) => {
            return await Links.find({}).toArray();
        },
        allUsers: async (root, data, {mongo: {Users}}) => {
            return await Users.find({}).toArray();
        }
    },
    Mutation: {
        createLink: async (root, data, {mongo: {Links}, user}) => {
            assertValidLink(data);
            const newLink = Object.assign({postedById: user && user._id}, data);
            const response = await Links.insert(newLink);
            pubsub.publish('Link', {Link: {mutation: 'CREATED', node: newLink}});
            return Object.assign({id: response.insertedIds[0]}, newLink);
        },
        createUser: async (root, data, {mongo: {Users}}) => {
            const newUser = {
                name: data.name,
                email: data.authProvider.email.email,
                password: data.authProvider.email.password,
            };
            const response = await Users.insert(newUser);
            return Object.assign({id: response.insertedIds[0]}, newUser);
        },
        signinUser: async (root, data, {mongo: {Users}}) => {
            const user = await Users.findOne({email: data.email.email});
            if (data.email.password === user.password) {
                return {token: `token-${user.email}`, user};
            }
        },
        createVote: async (root, data, {mongo: {Votes}, user}) => {
            const newVote = {
                userId: user && user._id,
                linkId: new ObjectID(data.linkId),
            };

            const response = await Votes.insert(newVote);
            pubsub.publish('Vote', {Vote: {mutation: 'CREATED', node: newVote}});
            return Object.assign({id: response.insertedIds[0]}, newVote);
        },
    },
    User: {
        id: root => root._id || root.id,
        votes: async({_id}, data, {mongo: {Votes}}) => {
            return await Votes.find({userId: _id}).toArray();
        }
    },
    Vote: {
        id: root => root._id || root.id,
        user: async ({userId}, data, {dataloaders: {userByIDLoader}}) => {
            return await userByIDLoader.load(userId);
          },
        link: async ({linkId}, data, {mongo: {Links}}) => {
            return await Links.findOne({_id: linkId});
        }
    },
    Link: {
        id: root => root._id || root.id,
        postedBy: async ({postedById}, data, {dataloaders: {userByIDLoader}}) => {
            return await userByIDLoader.load(postedById);
        },
        votes: async ({_id}, data, {mongo: {Votes}}) => {
            return await Votes.find({linkId: _id}).toArray();
        },
    },
    Subscription: {
        Link: {
            subscribe: () => pubsub.asyncIterator('Link')
        },
        Vote: {
            subscribe: () => pubsub.asyncIterator('Vote')
        }
    }
};
