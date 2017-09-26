import User from '../../models/User';
import { requireAuth } from '../../services/auth';
import FavoriteTweet from '../../models/FavoriteTweet';

export default {
  signup: async (_, { fullName, ...rest }) => {
    try {
      const [firstName, ...lastName] = fullName.split(' ');
      const user = await User.create({ firstName, lastName, ...rest });
      // create the favorite tweet data table upon user signup
      await FavoriteTweet.create({ userId: user._id });

      return {
        token: user._createToken()
      }
    } catch (error) {
      throw error;
    }
  },

  login: async (_, { email, password }) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('User does not exist!')
      }

      if(!user._authenticateUser(password)) {
        throw new Error('The password is incorrect');
      }

      return  {
        token: user._createToken()
      };
    } catch (error) {
      throw error;
    }
  },

  me: async (_, args, ctx) => {
    try {
      const me = await requireAuth(ctx.user); // requireAuth returns me
      return me;
    } catch (error) {
      throw error;
    }
  }
};
