import { gql } from 'react-apollo';

export default gql`
  {
    getTweets {
      text
     _id
     createdAt
     isFavorited
     favoriteCount
     author {
       username
       avatar
       lastName
       firstName
     }
    }
  }

`;
