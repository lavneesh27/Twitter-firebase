
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  email: string;
  password: string;
  userName: string;
  image?:any;
  banner?:any;
  bio?:string;
  location?:string;
  website?:string;
  createdAt?:string;
  followers:any;
  following:any;
}
