import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Chat } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private db: AngularFirestore) {}
  chat: Chat = {
    id: '',
    senderId: '',
    recieverId: '',
    text: '',
    createdAt:''
  };
  sendMessage(text: string, reciever: string) {
    this.chat.text = text;
    this.chat.id = this.db.createId();
    this.chat.senderId = sessionStorage.getItem('token')!;
    this.chat.recieverId = reciever;
    this.chat.createdAt = new Date().toString();
    this.db.collection('/messages').add(this.chat);

    // console.log(this.chat);
  }
  getMessages() {
    return this.db.collection('/messages').valueChanges();
  }
}
