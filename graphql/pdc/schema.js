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
let currentEnd = "https://pdc-dev.esacinc.com/graphql"
if (typeof process.env.PDC_GQ_PLAYGROUND != "undefined") {
	currentEnd = process.env.PDC_GQ_PLAYGROUND;
}

const SERVER = new ApolloServer({
  typeDefs: TYPEDEFS,
  resolvers: resolvers,
  playground: {
    endpoint: currentEnd,
    settings: {
      'editor.theme': 'light'
    }
  }
});
// Exports
export default SERVER;

