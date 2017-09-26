import mongoose, { Schema } from 'mongoose';

const TweetSchema = new Schema({
  text: {
    type: String,
    minlength: [5, 'Text needs to be longer'],
    maxlength: [100, 'Text is too long'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  favoriteCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

TweetSchema.statics = {
  incFavoriteCount(tweetId) { // increment
    return this.findByIdAndUpdate(tweetId, { $inc: { favoriteCount: 1 } }, { new: true }); // this is the tweet in question
  },
  decFavoriteCount(tweetId) { // decrement
    return this.findByIdAndUpdate(tweetId, { $inc: { favoriteCount: -1 } }, { new: true });
  }
};

export default mongoose.model('Tweet', TweetSchema);
