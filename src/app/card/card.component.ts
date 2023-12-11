import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Tweet } from '../models/tweet.model';
import { User } from '../models/user.model';
import { MainService } from '../shared/main.service';
import { Bookmark } from '../models/bookmark.model';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../shared/data.service';

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
  @Output() likeEvent = new EventEmitter<string>();

  constructor(
    private service: MainService,
    private toastr: ToastrService,
    private afs: DataService,
    private data: DataService
  ) {}
  async ngOnInit() {
    // const userToken = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    // if (userToken) {
    //   this.loginUser = this.data.getUser(userToken)
    // }
    this.loginUser = await this.data.getUser(this.tweet.userId);
    this.user = await this.data.getUser(this.tweet.userId);
    if (this.user?.image) {
      this.userURL = 'data:image/jpeg;base64,' + this.user.image;
    }

    if (this.tweet.image) {
      this.dataURL = 'data:image/jpeg;base64,' + this.tweet.image;
    }

  }

  // plusLike(tweet: Tweet) {
  //   this.like = !this.like;
  //   if (!this.like) {
  //     this.service.likeTweet(tweet.id, false).subscribe((res) => {
  //       this.tweet.likes! += 1;
  //     });
  //   } else {
  //     this.service.likeTweet(tweet.id, true).subscribe((res) => {
  //       this.tweet.likes! -= 1;
  //     });
  //   }
  // }

  plusLike(tweet: Tweet) {
    let val = (tweet.likes! += 1);
    this.afs.likeTweet(tweet.id, val);
    // this.tweet.likes!++;

    this.likeEvent.emit(this.like ? 'like' : 'unlike');
  }
  copy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.toastr.success('Copied to Clipboard');
    });
  }
  bookmark() {
    let bookmark: Bookmark = {
      id: "",
      userId: this.loginUser!.id,
      tweetId: this.tweet.id,
    };
    this.data.addBookmark(bookmark).then(()=>{
      this.toastr.success('Bookmark Added');
    });
  }

  onClick(event: any) {
    var target = event.target || event.srcElement || event.currentTarget;
    var srcAttr = target.attributes.src;
    this.imgSrc = srcAttr.nodeValue;
  }
}
