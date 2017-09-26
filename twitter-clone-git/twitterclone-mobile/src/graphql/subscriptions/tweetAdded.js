import { gql } from 'react-apollo';

export default gql`
  subscription {
    tweetAdded {
      text
      _id
      createdAt
      favoriteCount
      author {
        username
        avatar
        firstName
        lastName
      }
    }
  }
`;
