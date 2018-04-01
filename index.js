const puppeteer = require('puppeteer');
const setupGetAllMatches = require('./getAllMatches');
const setupGetMatchDetails = require('./getMatchDetails');

const [, , resource = '/soccer/', filterText] = process.argv;

const fn = filterText
  ? ({ home, away }) => [home, away].some(x => x.includes(filterText))
  : _ => true;

//(async () => {
//  const browser = await puppeteer.launch({
//    args: ['--no-sandbox', '--disable-setuid-sandbox']
//  });
//
//  const getAllMatches = setupGetAllMatches(browser);
//  const getMatchDetails = setupGetMatchDetails(browser);
//
//  const matches = await getAllMatches(resource);
//  const details = await Promise.all(matches.filter(fn).map(getMatchDetails));
//
//  await browser.close();
//  console.log(JSON.stringify(details, null, 2));
//  return details;
//})();
//
//
//
const { microGraphql } = require('apollo-server-micro');
const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
   type Match {
     home: String
     away: String
     href: String
     min: String
     score: String
   }

   type Query {
     matches(resource: String): [Match]
     match(href: String!): Match
   }
`;

const resolvers = {
  Query: {
    matches(obj, args, context, info) {
      console.log(JSON.stringify(args, null, 2));
      return puppeteer
        .launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        .then(setupGetAllMatches)
        .then(fn => fn(args.resource || '/soccer/'));
    },
    match(obj, args, context, info) {
      return puppeteer
        .launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        .then(setupGetMatchDetails)
        .then(fn => fn(href));
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports = microGraphql({ schema });
