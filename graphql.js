const puppeteer = require('puppeteer');
const { microGraphql } = require('apollo-server-micro');
const { makeExecutableSchema } = require('graphql-tools');

const setupGetAllMatches = require('./getters/getAllMatches');
const setupGetMatchDetails = require('./getters/getMatchDetails');

const { PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = false } = process.env;
const options = {
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};
if (PUPPETEER_SKIP_CHROMIUM_DOWNLOAD) {
  options['executablePath'] = '/usr/bin/chromium-browser';
}
const launch = () => puppeteer.launch(options);

const typeDefs = `
   type Match {
     home: String
     away: String
     href: String
     min: String
     score: String
     date: String
     name: String
     info: Info 
   }

   type Info {
     matchdetails: [Detail]
     venue: String
     referee: String
   }

   type Detail {
     min: String
     event: String
     player: String
   }

   type Query {
     matches(resource: String, filter: String): [Match]
   }
`;

const resolvers = {
  Query: {
    matches(_, { resource = '/soccer/', filter = null }) {
      return launch()
        .then(setupGetAllMatches)
        .then(fn => fn(resource))
        .then(
          x =>
            filter ? x.filter(y => `${y.home}-${y.away}`.includes(filter)) : x
        );
    }
  },
  Match: {
    info: match => {
      return launch()
        .then(setupGetMatchDetails)
        .then(fn => fn(match));
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports = microGraphql({ schema });
