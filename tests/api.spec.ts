import { test, expect } from '@fixtures/test.fixture';

test.describe('API Tests', () => {
  test('login and create article via GraphQL API', async ({ request, user }) => {
    // Step 1: Login via GraphQL using the user from fixture
    const loginResponse = await request.post('/api/graphql', {
      data: {
        query: `
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              token
              user {
                id
                email
              }
            }
          }
        `,
        variables: {
          email: user.email,
          password: user.password
        }
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.data.login.token).toBeTruthy();
    const token = loginData.data.login.token;

    // Step 2: Use token to create an article
    const articleResponse = await request.post('/api/graphql', {
      data: {
        query: `
          mutation CreateArticle($title: String!, $description: String!, $body: String!, $tagList: [String!]) {
            createArticle(input: {
              title: $title
              description: $description
              body: $body
              tagList: $tagList
            }) {
              article {
                id
                title
                description
                body
                tagList
                createdAt
                updatedAt
                author {
                  id
                  username
                }
              }
            }
          }
        `,
        variables: {
          title: 'Test Article from API',
          description: 'This is a test article created via API test',
          body: 'This is the body of the test article.',
          tagList: ['test', 'api']
        }
      },
      headers: {
        Authorization: `Token ${token}`
      }
    });

    expect(articleResponse.ok()).toBeTruthy();
    const articleData = await articleResponse.json();
    expect(articleData.data.createArticle.article).toBeTruthy();
    expect(articleData.data.createArticle.article.title).toBe('Test Article from API');

    // The dbCleaner fixture (part of test.fixture) will reset the database after the test.
  });
});
