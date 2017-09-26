import { createStore, applyMiddleware } from 'redux';
import { AsyncStorage } from 'react-native';
import { composeWithDevTools } from 'redux-devtools-extension';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import thunk from 'redux-thunk';
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';

import reducers from './reducers';

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3000/graphql',
});

const wsClient = new SubscriptionClient('ws://localhost:3000/subscriptions', {
  reconnect: true,
  connectionParams: {}
})

networkInterface.use([{
  // gives user authorization if logged in
  async applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {}; // create a headers object if there isn't one at the moment
    }
    try {
      const token = await AsyncStorage.getItem('@twitterclone'); // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTlkNTQzMTA5MmY0MmZlMWM1M2NhMmYiLCJpYXQiOjE1MDQ1NjA5MzB9.35M02jy62e2kldZ60ubh6Q4QoltOAMB4-GvNJZ99bEI"  
      if (token != null) {
        req.options.headers.authorization = `Bearer ${token}` || null;
      }
    } catch (error) {
      throw error
    }

    return next();
  }
}])

// managage network interface w/ subscriptions
const networkInterfaceWithSubs = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

export const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubs
});

const middlewares = [client.middleware(), thunk];

export const store = createStore(
  reducers(client),
  undefined,
  composeWithDevTools(applyMiddleware(...middlewares)),
);
