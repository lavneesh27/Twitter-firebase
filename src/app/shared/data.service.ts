import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Tweet } from '../models/tweet.model';
import { User } from '../models/user.model';
import { Bookmark } from '../models/bookmark.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private afs: AngularFirestore) {}

  //tweet
  addTweet(tweet: Tweet) {
    tweet.createdAt = new Date().toLocaleString();
    tweet.id = this.afs.createId();
    return this.afs.collection('/Tweets').doc(tweet.id).set(tweet);
  }
  getAllTweets() {
    return this.afs.collection('/Tweets').snapshotChanges();
  }
  likeTweet(id: string, value: number) {
    this.afs.collection('/Tweets').doc(id).update({ likes: value });
  }

  async getTweet(id: string): Promise<any> {
    try {
      const doc = await this.afs.collection('/Tweets').doc(id).ref.get();

      if (doc.exists) {
        return doc.data();
      } else {
        return null; // or handle the absence of the document as needed
      }
    } catch (error) {
      console.error('There was an error getting your document:', error);
      throw error; // or handle the error as needed
    }
  }

  //user
  addUser(user: User) {
    return this.afs.collection('/Users').doc(user.id).set(user);
  }
  getAllUsers() {
    return this.afs.collection('/Users').snapshotChanges();
  }
  async getUser(id: string): Promise<any> {
    try {
      const doc = await this.afs.collection('/Users').doc(id).ref.get();

      if (doc.exists) {
        return doc.data();
      } else {
        return null; // or handle the absence of the document as needed
      }
    } catch (error) {
      console.error('There was an error getting your document:', error);
      throw error; // or handle the error as needed
    }
  }
  updateUser(user: User) {
    this.afs.collection('/Users').doc(user.id).update({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      dob: user.dob,
    });
  }

  //bookmarks

  addBookmark(bookmark: Bookmark) {
    bookmark.id = this.afs.createId();
    return this.afs.collection('/Bookmarks').add(bookmark);
  }
  getAllBookmarks(id: number) {
    return this.afs
      .collection('/Bookmarks', (ref) => ref.where('userId', '==', id))
      .snapshotChanges();
  }
}
