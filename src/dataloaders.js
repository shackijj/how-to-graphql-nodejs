const DataLoader = require('dataloader');

async function batchUsersByID(Users, keys) {
    return await Users.find({_id: {$in: keys}}).toArray();
}

async function batchUsersByEmail(Users, keys) {
    return await Users.find({email: {$in: keys}}).toArray();
}

module.exports = ({Users}) => {
    let userByIDLoader = new DataLoader(
        keys => batchUsersByID(Users, keys).then(users => {
            for (let user of users) {
                userByEmailLoader.prime(user.email, user);
            }
            return users;
        }),
        {cacheKeyFn: key => key.toString()},
    );
    
    let userByEmailLoader = new DataLoader(
        keys => batchUsersByEmail(Users, keys).then(users => {
            for (let user of users) {
                userByIDLoader.prime(user._id, user);
            }
            return users;
        }),
        {cacheKeyFn: key => key.toString()},
    );

    return {
        userByIDLoader,
        userByEmailLoader,
    }
};
