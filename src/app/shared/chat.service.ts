import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Chat } from '../models/chat.model';
import { map } from 'rxjs';

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
    createdAt: '',
    attachment: ''
  };
  sendMessage(chat: Chat, reciever: string) {
    this.chat.text =chat.text;
    this.chat.id = this.db.createId();
    this.chat.senderId = sessionStorage.getItem('token')!;
    this.chat.recieverId = reciever;
    this.chat.createdAt = new Date().toString();
    this.chat.attachment = chat.attachment;
    this.db.collection('/messages').doc(this.chat.id).set(this.chat);
  }
  getMessages() {
    return this.db.collection('/messages').valueChanges();
  }

  deleteMessage(chatId: string) {
    this.db.collection('/messages').doc(chatId).delete()
      .then(() => {
        console.log('Message deleted successfully.');
      })
      .catch((error) => {
        console.error('Error deleting message: ', error);
      });
  }

  clearMessages(chatArray:any) {
    chatArray.forEach((element:any) => {
      this.db.collection('/messages').doc(element.id).delete()
      .then(() => {
        console.log('Message deleted successfully.');
      })
      .catch((error) => {
        console.error('Error deleting message: ', error);
      });
    });
   
  }
  
}
