import { Component, OnDestroy, OnInit } from '@angular/core';
import { MainService } from '../shared/main.service';
import { Tweet } from '../models/tweet.model';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../shared/data.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  tweets: Tweet[] = [];
  dataURL: string = '';
  isLoading: boolean = true;
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
    private dataService: DataService,
    private ngxService: NgxUiLoaderService
  ) {}
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  async ngOnInit() {
    this.ngxService.start();
    if (!sessionStorage.getItem('token')) {
      this.router.navigate(['login']);
      return;
    }
    let userToken =
      sessionStorage.getItem('token') ?? sessionStorage.getItem('token');
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
      // this.tweets.reverse();
      this.tweets.sort((a, b) =>
        new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1
      );
    });
    this.ngxService.stop();
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
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

    const storage = getStorage();
    const storageRef = ref(storage, 'images/' + file.name);

    uploadBytes(storageRef, file)
      .then((snapshot) => {
        // Get the download URL after the file is uploaded
        return getDownloadURL(snapshot.ref);
      })
      .then((downloadURL) => {
        // Store the download URL in your Firestore document
        this.tweet.image = downloadURL;
        this.dataURL = downloadURL;
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
      });
  }

  upload() {
    this.tweet.content = this.uploadForm.content.toString();
    this.tweet.userId = this.user.id;
    this.uploadForm.image = '';
    this.uploadForm.content = '';
    this.dataService.addTweet(this.tweet);
    this.toastr.success('uploaded');
    this.clearImage();
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
        }, 300);
      });
  }
}
