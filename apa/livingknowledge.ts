export const LivingKnowledgeTools = [
    {
        type: "function",
        function: {
            name: "search",
            description: "search everything",
            parameters: {
                type: "object",
                properties: {
                    sentence: {
                        type: "string",
                        description: "Read the user question",
                    },
                },
                required: ["sentence"],
                additionalProperties: false,
            },
        }
    }
];