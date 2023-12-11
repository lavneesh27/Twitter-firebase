import { Component, OnInit } from '@angular/core';
import { Tweet } from '../models/tweet.model';
import { MainService } from '../shared/main.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';
import { Location } from '@angular/common';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.css'],
})
export class BookmarkComponent implements OnInit {
  tweets: Tweet[] = [];
  user!: any;
  constructor(
    private service: MainService,
    private router: Router,
    private _location: Location,
    private data:DataService
  ) {}
  async ngOnInit() {
    const userToken = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (userToken) {
      this.user = await this.data.getUser(userToken)
    }else{
      this.router.navigate(['login']);
      return;
    }

   
    this.data.getAllBookmarks(this.user.id).subscribe((res: any) => {
      res.map(
        (e: any) => {
          const data = e.payload.doc.data();
          data.id = e.payload.doc.id;
          return data;
        },
        (err: any) => {
          alert('Error while fetching tweets');
        }
      ).forEach(async (element: any) => {
        let tweet = await this.data.getTweet(element.tweetId);
        console.log(tweet)
        this.tweets.push(tweet);
      });
    });
  }
  goBack() {
    this._location.back();
  }
}
