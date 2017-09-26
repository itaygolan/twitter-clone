import Tweet from '../../models/Tweet';
import { requireAuth } from '../../services/auth';
import { pubsub } from '../../config/pubsub';
import FavoriteTweet from '../../models/FavoriteTweet';

const TWEET_ADDED = 'tweetAdded';
export const TWEET_FAVORITED = 'tweetFavorited';

export default {
  getTweet: async (_, args, ctx) => { // args are the parameters for getTeet on schema.js
    try {
      await requireAuth(ctx.user);
      return Tweet.findById(args._id)
    } catch (error) {
      throw error;
    }
  },

  getTweets: async (_, args, ctx) => {
    try {
      await requireAuth(ctx.user);
      const p1 = Tweet.find({}).sort({ createdAt: -1 });
      const p2 = FavoriteTweet.findOne({ userId: ctx.user._id });
      const [tweets, favorites] = await Promise.all([p1, p2])

      // iterate over each of the tweets to check if they are favorited or not
      const tweetsToSend = tweets.reduce((arr, tweet) => {
        const tw = tweet.toJSON();

        // favorites is the favorites array of the user in quesiton (me)
        if (favorites.tweets.some(t => t.equals(tweet._id))) { // find first t that is eqaul to the tweet_id (item in original 'tweets')
            // if a tweet in favorites is in the tweets array (ALL tweets), then isFavorited is true because you've already favorited it
          arr.push({
            ...tw,
            isFavorited: true
          })
        } else {
          // if it's not in the user's favorite tweets, then isFavorited is false because you haven't liked it
          arr.push({
            ...tw,
            isFavorited: false
          })
        }

        return arr;
      }, []);

      return tweetsToSend;
    } catch (error) {
      throw error;
    }
  },

  getUserTweets: async (_, args, ctx) => {
    try {
      await requireAuth(ctx.user);
      return Tweet.find({ author: ctx.user._id }).sort({ createdAt: -1 });
    } catch (error) {
      throw error
    }
  },

  createTweet: async (_, args, ctx) => { // you can pass in ctx becaue we made it a parameter in the GraphQl in  middleware.js
    try {
      await requireAuth(ctx.user);
      const tweet = await Tweet.create({ ...args, author: ctx.user._id });

      pubsub.publish(TWEET_ADDED, { [TWEET_ADDED]: tweet });

      return tweet;
    } catch (error) {
      throw error
    }
  },

  updateTweet: async (_, { _id, ...rest }, ctx) =>  {
    try {
      await requireAuth(ctx.user);
      const tweet = await Tweet.findOne({_id, author: ctx.user._id});
      if (!tweet) {
        throw new Error('Not found');
      }
      Object.entries(rest).forEach(([key, value]) => {
        tweet[key] = value;
      });

      return tweet.save();

    } catch (error) {
      throw error
    }
  },
  deleteTweet: async (_, { _id }, ctx) => {
    try {
      await requireAuth(ctx.user);
      const tweet = await Tweet.findOne({_id, author: ctx.user._id })
      if (!tweet) {
        throw new Error('Not found');
      }
      await tweet.remove();
      return {
        message: 'Delete Success!'
      }
    } catch (error) {
      throw error;
    }
  },
  favoriteTweet: async (_, { _id }, { user }) => {
    try {
      await requireAuth(user);
      const favorites = await FavoriteTweet.findOne({ userId: user._id }); // get all favorite tweets under the current user

      return favorites.userFavoritedTweet(_id);

    } catch (error) {
      throw error;
    }
  },
  tweetAdded: {
    subscribe: () => pubsub.asyncIterator(TWEET_ADDED)
  },
  tweetFavorited: {
    subscribe: () => pubsub.asyncIterator(TWEET_FAVORITED)
  }

}
