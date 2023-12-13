import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Tweet } from '../models/tweet.model';
import { Bookmark } from '../models/bookmark.model';
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

  constructor(
    private toastr: ToastrService,
    private afs: DataService,
    private data: DataService
  ) {}
  async ngOnInit() {
    const userToken = sessionStorage.getItem('token');
    if (userToken) {
      this.loginUser = await this.data.getUser(userToken)
    }
    this.user = await this.data.getUser(this.tweet.userId);
    if (this.tweet.image?.length) {
      this.dataURL = this.tweet.image;
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
    tweet.likes = (tweet.likes || 0) + 1;

    this.afs.likeTweet(tweet.id, tweet.likes);
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
