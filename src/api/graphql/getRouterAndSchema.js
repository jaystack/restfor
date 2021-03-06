const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress } = require('apollo-server-express');
const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const { graphql, buildASTSchema } = require('graphql');
const { parse } = require('graphql/language');
const { introspectionQuery } = require('graphql/utilities');
const { readFileSync, writeFileSync } = require('fs');
const createRestforSchema = require('./createRestforSchema');
const createDefaultSchema = require('./createDefaultSchema');
const getSchemas = require('./getSchemas');
const getResolvers = require('./getResolvers');

module.exports = async (context, collections = [], schmemasPath, resolversPath) => {
  if (!schmemasPath) return { schema: {}, router: express.Router() };
  const resolvers = getResolvers(resolversPath);
  const schemas = getSchemas(schmemasPath);
  const ast = parse(schemas, { noLocation: true });
  const thirdPartySchema = buildASTSchema(ast);
  const restforSchema = createRestforSchema(collections, ast);
  const defaultSchema = createDefaultSchema({ ast, restforSchema, schema: thirdPartySchema });
  const router = graphqlExpress({
    schema: mergeSchemas({ schemas: [defaultSchema, schemas], resolvers }),
    context
  });
  return { schema: restforSchema, router };
};
