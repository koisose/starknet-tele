export const superfluidtools = [
    {
        type: "function",
        function: {
            name: "check_balance",
            description: "Get balance of user address",
            parameters: {
                type: "object",
                properties: {
                    address: {
                        type: "string",
                        description: "User address",
                    },
                },
                required: ["address"],
                additionalProperties: false,
            },
        }
    },
    {
        type: "function",
        function: {
            name: "check_address",
            description: "Get address of a user",
            parameters: {
                type: "object",
                properties: {
                    address: {
                        type: "string",
                        description: "User address",
                    },
                },
                required: ["address"],
                additionalProperties: false,
            },
        }
    },
    {
        type: "function",
        function: {
            name: "faucet",
            description: "Everytime user ask for faucet",
            
        }
    }
];