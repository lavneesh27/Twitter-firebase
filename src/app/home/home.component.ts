import { Component, OnDestroy, OnInit } from '@angular/core';
import { MainService } from '../shared/main.service';
import { Tweet } from '../models/tweet.model';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { User } from '../models/user.model';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  tweets: Tweet[] = [];
  imgUrl: any;
  dataURL: string = '';
  isLoading: boolean = false;
  tweet: Tweet = {
    id: '',
    content: '',
    likes: 0,
    userId: '',
    createdAt: '',
    image: [],
  };
  uploadForm: any = {
    content: '',
    image: '',
  };
  user: any;
  gifs: any[] = [];
  subscription: any;
  constructor(
    private service: MainService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private dataService: DataService
  ) {}
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  async ngOnInit() {
    if (!localStorage.getItem('token') && !sessionStorage.getItem('token')) {
      this.router.navigate(['login']);
      return;
    }
    let userToken =
      localStorage.getItem('token') ?? sessionStorage.getItem('token');
    this.user = await this.dataService.getUser(userToken!);

    this.isLoading = true;
    this.dataService.getAllTweets().subscribe((res: any) => {
      this.isLoading = false;
      this.tweets = res.map(
        (e: any) => {
          const data = e.payload.doc.data();
          data.id = e.payload.doc.id;
          return data;
        },
        (err: any) => {
          alert('Error while fetching tweets');
        }
      );
    });
    this.tweets.sort((a, b) => ( new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select only image files.');
      return;
    }
    const reader = new FileReader();
    let image: Uint8Array | null;
    reader.onload = () => {
      const base64 = reader.result as string;
      image = this.base64ToBytes(base64);
      this.tweet.image = Array.from(image);
    };
    reader.readAsDataURL(file);

    setTimeout(() => {
      if (image) {
        const base64String = btoa(
          String.fromCharCode.apply(null, Array.from(image))
        );
        this.dataURL = 'data:image/jpeg;base64,' + base64String;
      }
    }, 300);
  }
  base64ToBytes(base64: string): Uint8Array {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers);
  }

  upload() {
    this.tweet.content = this.uploadForm.content.toString();
    this.uploadForm.image = '';
    this.uploadForm.content = '';
    this.tweet.userId = this.user.id;
    this.dataService.addTweet(this.tweet);
    this.toastr.success('uploaded');
    this.dataURL = '';
    this.imgUrl = '';
    this.tweet.image = [];
    this.ngOnInit();
  }
  clearImage() {
    this.dataURL = '';
  }

  onImport(vitalSignsDataModal: any) {
    this.modalService.dismissAll();
    this.modalService.open(vitalSignsDataModal, { size: 'lg', centered: true });
    this.service.getTrendingGifs();
    this.subscription = this.service.getGifs().subscribe((res) => {
      this.gifs = res;
    });
  }
  searchGif(searchTerm: any) {
    if (searchTerm !== '') {
      this.service.searchGifs(searchTerm);
      this.subscription = this.service.getGifs().subscribe((res) => {
        this.gifs = res;
      });
    }
  }
  selectGif(gif: any) {
    this.service
      .getGifByteArray(gif.images.fixed_width_small.url)
      .subscribe((res) => {
        this.tweet.image = res;
        this.modalService.dismissAll();
        setTimeout(() => {
          if (res) {
            const base64String = btoa(
              String.fromCharCode.apply(null, Array.from(res))
            );
            this.dataURL = 'data:image/jpeg;base64,' + base64String;
          }
        }, 600);
      });
  }
}
