const { microGraphiql } = require('apollo-server-micro');

module.exports = microGraphiql({ endpointURL: '/graphql' });
