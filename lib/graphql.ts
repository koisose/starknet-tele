import ky from 'ky';

export const postCheckETHxBalance = async (account:string) => {
  const url = "https://optimism-sepolia.subgraph.x.superfluid.dev/";
  const payload = {
    "query": `query accountTokenSnapshots($first: Int = 10, $skip: Int = 0, $orderBy: AccountTokenSnapshot_orderBy = id, $orderDirection: OrderDirection = asc, $where: AccountTokenSnapshot_filter = {}, $block: Block_height) {
  accountTokenSnapshots(
    first: $first
    skip: $skip
    orderBy: $orderBy
    orderDirection: $orderDirection
    where: $where
    block: $block
  ) {
    account {
      id
    }
    balanceUntilUpdatedAt
    id
    token {
      id
      symbol
    }
  }
}`,
    "variables": {
      "where": { "account": account.toLowerCase() },
      "orderBy": "balanceUntilUpdatedAt",
      "orderDirection": "desc",
      "first": 11,
      "skip": 0
    },
    "operationName": "accountTokenSnapshots"
  };

  try {
    const response = await ky.post(url, { json: payload }).json();
    
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error:", error);
  }
};

// console.log(await postCheckETHxBalance("0xB6bBdd7D3ce7D38243013e887bb756018324feC3".toLowerCase()))