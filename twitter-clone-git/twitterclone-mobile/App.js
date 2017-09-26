import React from 'react';
import { UIManager, AsyncStorage } from 'react-native';
import { AppLoading } from 'expo';
import { ApolloProvider } from 'react-apollo';
import { ThemeProvider } from 'styled-components';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { store, client } from './src/store';
import { colors } from './src/utils/constants';
import { login } from './src/actions/user'

import AppNavigation from './src/navigations';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default class App extends React.Component {
  // check if user is logged in upon refreshing
  state = {
    appIsReady: false,
  }

  componentWillMount() {
    this._checkIfToken();
  }

  _checkIfToken = async () => {
    try {
      const token = await AsyncStorage.getItem('@twitterclone'); // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTlkNTQzMTA5MmY0MmZlMWM1M2NhMmYiLCJpYXQiOjE1MDQ1NjA5MzB9.35M02jy62e2kldZ60ubh6Q4QoltOAMB4-GvNJZ99bEI"  //check if there is a token
      if (token !== null) { // if there is one, login upon refresh
        store.dispatch(login())
      }
    } catch (error) {
      throw error
    }
    // when the store dispatch is done
    this.setState({ appIsReady: true });
  }

  render() {
    if (!this.state.appIsReady) {
      return <AppLoading />
    }
    return (
      <ApolloProvider store={store} client={client}>
        <ActionSheetProvider>
          <ThemeProvider theme={colors}>
            <AppNavigation />
          </ThemeProvider>
        </ActionSheetProvider>
      </ApolloProvider>
    );
  }
}
