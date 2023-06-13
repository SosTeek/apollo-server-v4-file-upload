import { buildSubgraphSchema } from "@apollo/subgraph";
import {
    billingResolvers,
    fileUploadResolvers
} from "../resolvers";
import {
    billingTypeDefs,
    fileUploadTypeDefs
} from "../typeDefs";

export const schema = buildSubgraphSchema([
    { typeDefs: billingTypeDefs, resolvers: billingResolvers },
    { typeDefs: fileUploadTypeDefs, resolvers: fileUploadResolvers },
]);
