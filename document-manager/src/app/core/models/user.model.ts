export enum EUserType {
  User = 'USER',
  Reviewer = 'REVIEWER',
}

export interface IUser {
  id: 'string',
  email: 'string',
  fullName: 'string',
  role: EUserType
}

export interface IUsersResponse {
  results: IUser[],
  count: number;
}