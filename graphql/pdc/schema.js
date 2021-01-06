//@@@PDC-2192 apollo server 2.0
import { gql } from 'apollo-server-express';
import * as fs from 'fs';
import { resolvers as queryResolvers } from './resolvers/queries';
import { resolvers as subResolvers } from './resolvers/subqueries';
import _ from 'lodash';
import { ApolloServer } from 'apollo-server-express';
import {glob} from 'glob';

const resolvers = _.merge(queryResolvers, subResolvers);
const TYPEDEFS = gql`${glob.sync("./pdc/types/*.gql")
  .map(filename => fs.readFileSync(filename, 'utf8'))
  .reduce((typeDefs, typeDef) => `${typeDefs}\n${typeDef}`, '# My Awesome SDL')}`
//@@@PDC-2485 point to dev graghql playground
let currentEnd = "http://localhost:3000/graphql"
if (typeof process.env.PDC_GQ_PLAYGROUND != "undefined") {
	currentEnd = process.env.PDC_GQ_PLAYGROUND;
}

//@@@PDC-3050 google analytics tracking
const SERVER = new ApolloServer({
  typeDefs: TYPEDEFS,
  resolvers: resolvers,
  context:({ req }) => ({
	isUI: false,  
    visitor: req.visitor
  }),
  playground: {
    endpoint: currentEnd,
    settings: {
      'editor.theme': 'light'
    }
  }
});
// Exports
export default SERVER;

