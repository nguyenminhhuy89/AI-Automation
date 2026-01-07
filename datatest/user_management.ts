export interface UserData {
  gender: 'male' | 'female';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
const time_random:number = Date.now()
export class UserFactory {
      
  static createValidUser(overrides?: Partial<UserData>): UserData {
    return {
      gender: 'male',
      firstName: 'Test',
      lastName: 'User',
      email: `testuser_${time_random}@example.com`,
      password: `Test@${time_random}`,
      ...overrides
    };
  };
  static createInValidUser01(): UserData {
    return {
      gender: 'male',
      firstName: 'Test',
      lastName: 'User',
      email: `testuser_${Date.now()}@example.com`,
      password: '',
    };
  };
  static createInValidUser02(): UserData {
    return {
      gender: 'male',
      firstName: 'Test',
      lastName: 'User',
      email: '',
      password: `Abcd@${time_random}`,
    }
  };
  static createInValidUser03(): UserData {
    return {
      gender: 'female',
      firstName: '',
      lastName: 'User',
      email: `testuser_${Date.now()}@example.com`,
      password: `Abcd@${time_random}`,
    }
  };
  static createInValidUser04(): UserData {
    return {
      gender: 'female',
      firstName: 'Test',
      lastName: '',
      email: `testuser_${Date.now()}@example.com`,
      password: `Abcd@${time_random}`,
    }
  };
}