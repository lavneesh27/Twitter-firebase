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
  likeTweet(tweet: Tweet, userId: string) {
    const postRef = this.afs.collection('/Tweets').doc(tweet.id).ref;

    return this.afs.firestore.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists) {
        throw new Error('Post does not exist!');
      }

      const likes = postDoc.get('likes') || [];
      likes.push(userId);

      transaction.update(postRef, { likes });
    });
  }
  unlikeTweet(tweet: Tweet, userId: string) {
    const postRef = this.afs.collection('/Tweets').doc(tweet.id).ref;

    return this.afs.firestore.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists) {
        throw new Error('Post does not exist!');
      }

      const likes = postDoc.get('likes') || [];
      const updatedLikes = likes.filter((id: string) => id !== userId);

      transaction.update(postRef, { likes: updatedLikes });
    });
  }

  async getTweet(id: string): Promise<any> {
    try {
      const doc = await this.afs.collection('/Tweets').doc(id).ref.get();

      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('There was an error getting your document:', error);
      throw error; 
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
      bio:user.bio,
      location:user.location,
      website:user.website,
      userName: user.userName,
      dob: user.dob,
      image:user.image,
      banner:user.banner
    })
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
