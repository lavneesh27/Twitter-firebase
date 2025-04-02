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
    tweet.createdAt = new Date().toDateString();
    tweet.id = this.afs.createId();
    return this.afs.collection('/Tweets').doc(tweet.id).set(tweet);
  }
  removeTweet(tweetId: string) {
    return this.afs.collection('/Tweets').doc(tweetId).delete();
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
        return null; 
      }
    } catch (error) {
      console.error('There was an error getting your document:', error);
      throw error; 
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
      banner:user.banner,
      defaultPrimaryColor: user.defaultPrimaryColor
    })
  }

  //user1 if following user2
  follow(user1:string, user2:string){
    const postRef = this.afs.collection('/Users').doc(user2).ref;
    const postRef2 = this.afs.collection('/Users').doc(user1).ref;

    return this.afs.firestore.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      const postDoc2 = await transaction.get(postRef2);

      if (!postDoc.exists) {
        throw new Error('Post does not exist!');
      }

      const followers = postDoc.get('followers') || [];
      const following = postDoc2.get('following') || [];
      followers.push(user1);
      following.push(user2);

      transaction.update(postRef, { followers });
      transaction.update(postRef2, { following });
    });
  }

  unFollow(user1:string, user2:string) {
    const postRef = this.afs.collection('/Users').doc(user2).ref;
    const postRef2 = this.afs.collection('/Users').doc(user1).ref;

    return this.afs.firestore.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      const postDoc2 = await transaction.get(postRef2);

      if (!postDoc.exists) {
        throw new Error('Post does not exist!');
      }

      const followers = postDoc.get('followers') || [];
      const following = postDoc2.get('following') || [];
      const updatedFollowers = followers.filter((id: string) => id !== user1);
      const updatedFollowings = following.filter((id: string) => id !== user2);

      transaction.update(postRef, { followers: updatedFollowers });
      transaction.update(postRef2, { following: updatedFollowings });
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

  clearBookmarks(userId: string) {
    const bookmarksRef = this.afs.collection('/Bookmarks', ref => ref.where('userId', '==', userId));

    return bookmarksRef.get().toPromise().then(snapshot => {
      if (!snapshot || snapshot.empty) return;

      const batch = this.afs.firestore.batch();

      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      return batch.commit();
    }).catch(error => {
      console.error("Error deleting bookmarks:", error);
    });
  }
  isBookmark(tweetId: string, userId: string): Promise<boolean> {
    return this.afs
      .collection('/Bookmarks', (ref) => ref.where('userId', '==', userId).where('tweetId', '==', tweetId))
      .get()
      .toPromise()
      .then((snapshot) => {
        return !snapshot?.empty; // Returns true if the bookmark exists, otherwise false
      })
      .catch((error) => {
        console.error("Error checking bookmark:", error);
        return false;
      });
  }
  removeBookmark(tweetId: string, userId: string): Promise<void> {
    return this.afs.collection('/Bookmarks', ref => ref.where('tweetId', '==', tweetId).where('userId', '==', userId))
      .get().toPromise().then(snapshot => !snapshot?.empty ? this.afs.collection('/Bookmarks').doc(snapshot?.docs[0]?.id).delete() : Promise.resolve());
  }
}
