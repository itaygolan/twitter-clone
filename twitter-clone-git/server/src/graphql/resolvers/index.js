import GraphQLDate from 'graphql-date';

import TweetResolvers from './tweet-resolvers';
import UserResolvers from './user-resolvers';
import User from '../../models/User';

export default {
  Date: GraphQLDate,
  Tweet: {
    // parent is the fill Tweet
    author: (parent) => User.findById(parent.author)
  },
  Query: {
    getTweet: TweetResolvers.getTweet,
    getTweets: TweetResolvers.getTweets,
    getUserTweets: TweetResolvers.getUserTweets,
    me: UserResolvers.me
  },
  Mutation: {
    createTweet: TweetResolvers.createTweet,
    updateTweet: TweetResolvers.updateTweet,
    deleteTweet: TweetResolvers.deleteTweet,
    favoriteTweet: TweetResolvers.favoriteTweet,
    signup: UserResolvers.signup,
    login: UserResolvers.login
  },
  Subscription: {
    tweetAdded: TweetResolvers.tweetAdded,
    tweetFavorited: TweetResolvers.tweetFavorited
  }
};
