import gql from "graphql-tag";

import { DocumentNode } from "graphql";

export const fileUploadTypeDefs : DocumentNode = gql`
#graphql
scalar Upload

type File{
  id: Int,
  name: String,
  url: String
}
#  type File {
#   filename: String!
#     mimetype: String!
#     encoding: String!
#  }
extend type Mutation {
  singleFileUpload(file: Upload!): File!
}

`