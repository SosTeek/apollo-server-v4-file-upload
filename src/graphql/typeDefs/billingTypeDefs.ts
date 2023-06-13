import gql from "graphql-tag";
import { DocumentNode } from "graphql";

export const billingTypeDefs: DocumentNode = gql`#graphql
    extend type Query {
        hello: String!
    }
`;
