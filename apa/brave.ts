import ky from 'ky';

export const braveSearch = async (query: string) => {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${query}`;
  const headers = {
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip',
    'X-Subscription-Token': process.env.BRAVESEARCH_API,
  };

  try {
    const response = await ky.get(url, { headers }).json();
    // console.log(response)
    return response;
  } catch (error) {
    console.error('Error fetching Brave Search results:', error);
    throw error;
  }
};
// const result=await braveSearch("what+is+a+cat");
// // const a=JSON.stringify(result)
// console.log("d")
