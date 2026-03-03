export interface User {
  username: string;
  email: string;
  password: string;
  bio?: string;
  image?: string;
}

export interface TestUser extends User {
  id?: number;
}
