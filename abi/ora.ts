export const oraPromptAbi=[
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_aiOracle",
          "type": "address",
          "internalType": "contract IAIOracle"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "aiOracle",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract IAIOracle"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "aiOracleCallback",
      "inputs": [
        {
          "name": "requestId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "output",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "callbackData",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "calculateAIResult",
      "inputs": [
        {
          "name": "modelId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "prompt",
          "type": "string",
          "internalType": "string"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "callbackGasLimit",
      "inputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint64",
          "internalType": "uint64"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "estimateFee",
      "inputs": [
        {
          "name": "modelId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAIResult",
      "inputs": [
        {
          "name": "modelId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "prompt",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isFinalized",
      "inputs": [
        {
          "name": "requestId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "prompts",
      "inputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "requests",
      "inputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "sender",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "modelId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "input",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "output",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "setCallbackGasLimit",
      "inputs": [
        {
          "name": "modelId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "gasLimit",
          "type": "uint64",
          "internalType": "uint64"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "promptRequest",
      "inputs": [
        {
          "name": "requestId",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "sender",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "modelId",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "prompt",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "promptsUpdated",
      "inputs": [
        {
          "name": "requestId",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "modelId",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "input",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "output",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "callbackData",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "UnauthorizedCallbackSource",
      "inputs": [
        {
          "name": "expected",
          "type": "address",
          "internalType": "contract IAIOracle"
        },
        {
          "name": "found",
          "type": "address",
          "internalType": "contract IAIOracle"
        }
      ]
    }
  ]