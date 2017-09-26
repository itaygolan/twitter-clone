import mongoose, { Schema } from 'mongoose';

import Tweet from './Tweet';
import { TWEET_FAVORITED } from '../graphql/resolvers/tweet-resolvers';
import { pubsub } from '../config/pubsub';

const FavoriteTweetSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tweets: [{
    type: Schema.Types.ObjectId,
    ref: 'Tweet'
  }]
});

FavoriteTweetSchema.methods = {
  async userFavoritedTweet(tweetId) {
    // UNFAVORITING - delete tweet if it's in the user's FavoriteTweets
    if (this.tweets.some(t => t.equals(tweetId))) { // tweetId is the tweet in question (passed in as the second parameter)
      this.tweets.pull(tweetId); // remove tweet from this (user's favoritetweets)
      await this.save();

      const tweet = await Tweet.decFavoriteCount(tweetId);
      const t = tweet.toJSON();

      pubsub.publish(TWEET_FAVORITED, { [TWEET_FAVORITED]: { ...t } });

      return {
        isFavorited: false,
        ...t
      }
    }
    // FAVORITING - add tweet if it's not in the user's favorite tweets
    const tweet = await Tweet.incFavoriteCount(tweetId);
    const t = tweet.toJSON(); // convert to string so you can spread it

    this.tweets.push(tweetId);
    await this.save();
    pubsub.publish(TWEET_FAVORITED, { [TWEET_FAVORITED]: { ...t } });

    return {
      isFavorited: true,
      ...t
    }
  }
}

FavoriteTweetSchema.index({ userId: 1 }, { unique: true }); // FavoriteTweetSchema is indexed by userID


export default mongoose.model('FavoriteTweet', FavoriteTweetSchema);
