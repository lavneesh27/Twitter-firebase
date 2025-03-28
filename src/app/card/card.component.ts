import { Component, Input, OnInit } from '@angular/core';
import { Tweet } from '../models/tweet.model';
import { Bookmark } from '../models/bookmark.model';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../shared/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit {
  @Input() tweet!: Tweet;
  user?: any;
  loginUser?: any;
  dataURL?: string;
  imgSrc: string = '';
  userURL?: string;
  like: boolean = false;

  constructor(
    private toastr: ToastrService,
    private afs: DataService,
    private data: DataService,
    private router: Router
  ) {}
  async ngOnInit() {
    const userToken =
      sessionStorage.getItem('token') ?? localStorage.getItem('token');
    if (userToken) {
      this.loginUser = await this.data.getUser(userToken);
    }
    this.user = await this.data.getUser(this.tweet.userId);
    if (this.tweet.image?.length) {
      this.dataURL = this.tweet.image;
    }
    this.like = this.isLiked();
  }
  isLiked(): boolean {
    const likes = this.tweet.likes;
    const loginUser = this.loginUser;

    return (
      !!likes && !!likes.length && !!loginUser && likes.includes(loginUser.id)
    );
  }

  likesCount(): number {
    const likes = this.tweet.likes;
    return likes ? likes.length : 0;
  }

  plusLike() {
    if (this.isLiked()) {
      this.afs.unlikeTweet(this.tweet, this.loginUser.id);
    } else {
      this.afs.likeTweet(this.tweet, this.loginUser.id);
    }
  }
  copy() {
    navigator.clipboard
      .writeText('http://localhost:4200/post/' + this.tweet.id)
      .then(() => {
        this.toastr.success('Copied to Clipboard');
      });
  }
  bookmark() {
    let bookmark: Bookmark = {
      id: '',
      userId: this.loginUser.id,
      tweetId: this.tweet.id,
    };
    this.data.addBookmark(bookmark).then(() => {
      this.toastr.success('Bookmark Added');
    });
  }

  onClick(event: any) {
    let target = event.target || event.srcElement || event.currentTarget;
    let srcAttr = target.attributes.src;
    this.imgSrc = srcAttr.nodeValue;
  }

  navigateToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
  }
  redirect(id: string) {
    this.router.navigate(['post', id]);
  }
}
