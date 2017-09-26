import faker from 'faker';

import Tweet from '../models/Tweet';
import User from '../models/User';
import FavoriteTweet from '../models/FavoriteTweet';

const TWEETS_TOTAL = 3;
const USER_TOTAL = 3;

export default async () => {
  try {
    await Tweet.remove();
    await User.remove();
    await FavoriteTweet.remove();

    await Array.from({ length: USER_TOTAL }).forEach(async (_, i) => {
        const user = await User.create({
          username: faker.internet.userName(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          avatar: `http://randomuser.me/api/portraits/women/${i}.jpg`,
          password: 'password123'
        });

        await Array.from({ length: TWEETS_TOTAL }).forEach(async () => {
          return await Tweet.create({ text: faker.lorem.sentence(), author: user._id });
        });
      });
  } catch (error) {
    throw error;
  }
}
