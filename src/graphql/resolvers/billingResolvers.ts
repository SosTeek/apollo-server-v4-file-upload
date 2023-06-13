export const billingResolvers = {
    Query: {
        hello: async (
            parent: any,
            args: any,
            contextValue: any,
            info: any
        ) => {
            return "test query"
        }
    }
};
