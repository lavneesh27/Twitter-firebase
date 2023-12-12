
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  email: string;
  password: string;
  userName: string;
  image?:any;
  createdAt?:string;
}
