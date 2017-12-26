const express = require('express');

const bodyParser = require('body-parser');
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const schema = require('./schema');
const connectMongo = require('./mongo-connector');
const {authentificate} = require('./authentification');
const buildDataloaders = require('./dataloaders');
const formatError = require('./formatError');

const {execute, subscribe} = require('graphql');
const {createServer} = require('http');
const {SubscriptionServer} = require('subscriptions-transport-ws');

const PORT = 3000;

const start = async () => {
    const app = express();
    const mongo = await connectMongo();

    const buildOptions = async (req, res) => {
        const dataloaders = buildDataloaders(mongo);
        const user = await authentificate(req, dataloaders);
        return {
            context: {
                dataloaders,
                mongo,
                user,
            },
            schema,
            formatError
        };
    };

    app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

    app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
        passHeader: `Authorization: 'bearer token-foo@bar.com'`,
        subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
    }))
    

    const server = createServer(app);
    server.listen(PORT, () => {
        SubscriptionServer.create(
            {execute, subscribe, schema},
            {server, path: '/subscriptions'},
        );
        console.log(`Hackernews GraphQL server running on http://localhost:${PORT}/graphql`);
    });
};

start();