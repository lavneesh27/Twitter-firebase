
export interface Tweet {
  id:string;
  content: string;
  likes?: number;
  userId: string;
  createdAt: string;
  image?:Uint8Array | number[];
}
