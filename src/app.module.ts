import { Module } from '@nestjs/common';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { Neo4jGraphQL } from '@neo4j/graphql';
import * as neo4j from 'neo4j-driver';
import { gql } from 'apollo-server-express';

const conf = {
  neo4j: {
    host: 'localhost',
    password: '123',
  },
};

const typeDefs = gql`
  type Item {
    id: String
    tags: [Tag!]! @relationship(type: "HAS_TAG", direction: OUT)
  }

  type Tag {
    name: String
    items: [Item!]! @relationship(type: "HAS_TAG", direction: IN)
  }
`;

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: async () => {
        const driver = neo4j.driver(
          'neo4j://' + conf.neo4j.host,
          neo4j.auth.basic('neo4j', conf.neo4j.password),
        );
        const schema = await new Neo4jGraphQL({ typeDefs, driver }).getSchema();

        return {
          debug: true,
          playground: true,
          schema: schema,
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
