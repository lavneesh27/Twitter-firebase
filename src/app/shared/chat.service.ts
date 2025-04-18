import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Chat } from '../models/chat.model';
import { combineLatest, distinctUntilChanged, map, Observable, of } from 'rxjs';

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
    attachment: '',
  };
  sendMessage(chat: Chat, reciever: string) {
    this.chat.text = chat.text;
    this.chat.id = this.db.createId();
    this.chat.senderId =
      sessionStorage.getItem('token') ?? localStorage.getItem('token')!;
    this.chat.recieverId = reciever;
    this.chat.createdAt = new Date().toString();
    this.chat.attachment = chat.attachment;
    this.db.collection('/messages').doc(this.chat.id).set(this.chat);
  }
  getMessages() {
    return this.db.collection('/messages').valueChanges();
  }
  getDisplayMessage(receiverId: string, senderId: string): Observable<unknown[]> {
    const query1 = this.db
      .collection('/messages', (ref) =>
        ref
          .where('recieverId', '==', receiverId)
          .where('senderId', '==', senderId)
          .orderBy('createdAt', 'desc')
          .limit(1)
      )
      .valueChanges();

    const query2 = this.db
      .collection('/messages', (ref) =>
        ref
          .where('recieverId', '==', senderId)
          .where('senderId', '==', receiverId)
          .orderBy('createdAt', 'desc')
          .limit(1)
      )
      .valueChanges();
    return combineLatest([query1, query2]).pipe(
      map(([result1, result2]) => {
        return [...result1, ...result2];
      })
    );
  }

  clearMessages(chatArray: any) {
    chatArray.forEach((element: any) => {
      this.db
        .collection('/messages')
        .doc(element.id)
        .delete()
        .then(() => {
          console.log('cleared');
        })
        .catch((error) => {
          console.error('Error deleting message: ', error);
        });
    });
  }
}
