import React, { Component } from 'react';
import styled from 'styled-components/native';
import { graphql, compose, withApollo } from 'react-apollo';
import { ActivityIndicator, FlatList } from 'react-native';
import { connect } from 'react-redux';

import FeedCard from '../components/FeedCard/FeedCard';
import { colors } from '../utils/constants';

import {getUserInfo} from '../actions/user'

import GET_TWEETS_QUERY from '../graphql/queries/getTweets';
import ME_QUERY from '../graphql/queries/me';
import TWEET_ADDED_SUBSCRIPTION from '../graphql/subscriptions/tweetAdded';
import TWEET_FAVORITED_SUBSCRIPTION from '../graphql/subscriptions/tweetFavorited';


const Root = styled.View`
  flex: 1;
  paddingTop: 5
`;

const List = styled.ScrollView`

`;

const T = styled.Text``;

class HomeScreen extends Component {

  componentWillMount() {
    this.props.data.subscribeToMore({  // build into data from GET_TWEETS_QUERY
      document: TWEET_ADDED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newTweet = subscriptionData.data.tweetAdded;

        if (!prev.getTweets.find(t => t._id === newTweet._id)) {
          return {
            ...prev,
            getTweets: [{ ...newTweet }, ...prev.getTweets]
          }
        }

        return prev;
      }
    });

    this.props.data.subscribeToMore({
      document: TWEET_FAVORITED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if(!subscriptionData.data) {
          return prev;
        }

        const newTweet = subscriptionData.data.tweetFavorited;
        return {
          ...prev,
          getTweets: prev.getTweets.map(tweet =>
            tweet._id === newTweet._id ? {
              // keep tweet the same when you find the one with the corresponding ID, but just change the favorite count
              ...tweet,
              favoriteCount: newTweet.favoriteCount
            }
            : tweet
          )
        };
      }
    })
  }

  componentDidMount() {
    this._getUserInfo();
  }

  _getUserInfo = async () => {
    const { data: { me } } = await this.props.client.query({ query: ME_QUERY });
    this.props.getUserInfo(me);
  }

  _renderItem = ({ item }) => <FeedCard {...item} />

  _renderPlaceholder = () => <FeedCard placeholder isLoaded={this.props.data.loading} />  // render the placeholder when loading

  state = { }
  render() {
    const { data } = this.props;
    if (data.loading) {
      return (
        <Root>
          <FlatList
            contentContainerStyle={{ alignSelf: 'stretch' }}
            data={[1, 2, 3]}
            renderItem={this._renderPlaceholder}
            keyExtractor={item => item}
          />
        </Root>
      );
    }
    return (
      <Root>
        <FlatList
          contentContainerStyle={{ alignSelf: 'stretch' }}
          data={data.getTweets}
          keyExtractor={item => item._id}
          renderItem={this._renderItem}
        />
      </Root>
    );
  }
}

export default withApollo(compose(  // withApollo allows you to access your Apollo client
  connect(undefined, { getUserInfo }),
  graphql(GET_TWEETS_QUERY)
)(HomeScreen));
