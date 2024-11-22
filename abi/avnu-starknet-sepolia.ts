export const ABI = [
  {
    "type": "impl",
    "name": "ExchangeLocker",
    "interface_name": "avnu::interfaces::locker::ILocker"
  },
  {
    "type": "interface",
    "name": "avnu::interfaces::locker::ILocker",
    "items": [
      {
        "type": "function",
        "name": "locked",
        "inputs": [
          {
            "name": "id",
            "type": "core::integer::u32"
          },
          {
            "name": "data",
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "Exchange",
    "interface_name": "avnu::exchange::IExchange"
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "struct",
    "name": "avnu::models::Route",
    "members": [
      {
        "name": "token_from",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "token_to",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "exchange_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "percent",
        "type": "core::integer::u128"
      },
      {
        "name": "additional_swap_params",
        "type": "core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    "type": "interface",
    "name": "avnu::exchange::IExchange",
    "items": [
      {
        "type": "function",
        "name": "get_owner",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "transfer_ownership",
        "inputs": [
          {
            "name": "new_owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "upgrade_class",
        "inputs": [
          {
            "name": "new_class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_adapter_class_hash",
        "inputs": [
          {
            "name": "exchange_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_adapter_class_hash",
        "inputs": [
          {
            "name": "exchange_address",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "adapter_class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_fees_active",
        "inputs": [],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_fees_active",
        "inputs": [
          {
            "name": "active",
            "type": "core::bool"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_fees_recipient",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_fees_recipient",
        "inputs": [
          {
            "name": "recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_fees_bps_0",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u128"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_fees_bps_0",
        "inputs": [
          {
            "name": "bps",
            "type": "core::integer::u128"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_fees_bps_1",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u128"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_fees_bps_1",
        "inputs": [
          {
            "name": "bps",
            "type": "core::integer::u128"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_swap_exact_token_to_fees_bps",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u128"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_swap_exact_token_to_fees_bps",
        "inputs": [
          {
            "name": "bps",
            "type": "core::integer::u128"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "multi_route_swap",
        "inputs": [
          {
            "name": "token_from_address",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_from_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "token_to_address",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_to_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "token_to_min_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "beneficiary",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "integrator_fee_amount_bps",
            "type": "core::integer::u128"
          },
          {
            "name": "integrator_fee_recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "routes",
            "type": "core::array::Array::<avnu::models::Route>"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "swap_exact_token_to",
        "inputs": [
          {
            "name": "token_from_address",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_from_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "token_from_max_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "token_to_address",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_to_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "beneficiary",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "routes",
            "type": "core::array::Array::<avnu::models::Route>"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "fee_recipient",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "avnu::exchange::Exchange::Swap",
    "kind": "struct",
    "members": [
      {
        "name": "taker_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "sell_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "sell_amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "buy_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "buy_amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "beneficiary",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "avnu::exchange::Exchange::OwnershipTransferred",
    "kind": "struct",
    "members": [
      {
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "avnu::exchange::Exchange::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "Swap",
        "type": "avnu::exchange::Exchange::Swap",
        "kind": "nested"
      },
      {
        "name": "OwnershipTransferred",
        "type": "avnu::exchange::Exchange::OwnershipTransferred",
        "kind": "nested"
      }
    ]
  }
] as const;
