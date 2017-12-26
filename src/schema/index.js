const {makeExecutableSchema} = require('graphql-tools');
const resolvers = require('./resolvers');

// Define your types here.
const typeDefs = `
  type Subscription {
    Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
    Vote(filter: VoteSubscriptionFilter): VoteSubscriptionPayload
  }

  input LinkSubscriptionFilter {
    mutation_in: [_ModelMutationType!]
  }

  type LinkSubscriptionPayload {
    mutation: _ModelMutationType!
    node: Link
  }

  input VoteSubscriptionFilter {
    mutation_in: [_ModelMutationType!]
  }

  type VoteSubscriptionPayload {
    mutation: _ModelMutationType!
    node: Vote
  }

  enum _ModelMutationType {
    CREATED
    UPDATED
    DELETED
  }

  type Link {
    id: ID!
    url: String!
    description: String!
    postedBy: User
    votes: [Vote!]!
  }

  type Query {
    allVotes: [Vote!]!
    allLinks: [Link!]!
    allUsers: [User!]!
  }

  type User {
      id: ID!
      name: String!
      email: String!
      votes: [Vote!]!
  }

  type SigninPayload {
    token: String
    user: User
  }

  type Vote {
    id: ID!
    user: User!
    link: Link!
  }

  type Mutation {
    createLink(url: String!, description: String!): Link
    createVote(linkId: ID!): Vote
    createUser(name: String!, authProvider: AuthProviderSignupData!): User
    signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
  }

  input AuthProviderSignupData {
      email: AUTH_PROVIDER_EMAIL
  }

  input AUTH_PROVIDER_EMAIL {
      email: String!
      password: String!
  }
`;

// Generate the schema object from your types definition.
module.exports = makeExecutableSchema({typeDefs, resolvers});