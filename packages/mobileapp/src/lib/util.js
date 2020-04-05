import {
  CUSTOMER_KEY,
  ITEM_KEY,
  ME_KEY,
  PACKAGE_KEY,
} from './storage/storage.keys';
import {save} from './storage/storage';
import {makeJsonRequest} from './request';

export const fetchInitialData = async (role, setData) => {
  const requests = [
    {endpoint: '/package', key: PACKAGE_KEY, name: 'packages'},
    {endpoint: '/item', key: ITEM_KEY, name: 'items'},
    {endpoint: '/customer', key: CUSTOMER_KEY, name: 'customers'},
    {endpoint: `/${role.toLowerCase()}/me`, key: ME_KEY, name: 'me'},
  ];
  const stateObject = {};
  setData(prev => ({
    ...prev,
    loading: {isLoading: true, current: 1, total: requests.length},
  }));

  for (let i = 0; i < requests.length; i++) {
    setData(prev => ({
      ...prev,
      loading: {isLoading: true, current: i + 1, total: requests.length},
    }));
    const {endpoint, key} = requests[i];
    const data = await makeJsonRequest(endpoint, {}, true);
    await save(key, data);
    stateObject[requests[i].name] = data;
  }

  console.log(stateObject);

  setData(prev => ({
    ...prev,
    ...stateObject,
    loading: {isLoading: false, current: 1, total: 1},
  }));
};

export const formatSignature = signature => {
  const formatted = `data:image/png;base64,${signature}`;
  return formatted;
};

export const formatItems = items => {
  let categories = {};
  for (const item of items) {
    item.qty = '0';
    item.price = item.unitPrice;
    const {category} = item;
    categories[category] = categories[category]
      ? [...categories[category], item]
      : [item];
  }
  let formattedItems = [];
  for (const category in categories) {
    formattedItems.push({
      name: category,
      items: categories[category],
    });
  }
  return formattedItems;
};
