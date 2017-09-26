import { gql } from 'react-apollo';

// signup query
// 1. first part is how the inputted data will be structured
// 2. second part is creating the variables
// 3. what will be returned (token)

export default gql`
  mutation signup(
    $fullName: String!,
    $email: String!,
    $password: String!,
    $username: String!,
    $avatar: String
  ) {
    signup(
      fullName: $fullName,
      email: $email,
      password: $password,
      username: $username,
      avatar: $avatar
    ) {
      token
    }
  }
`;
