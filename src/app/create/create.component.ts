import { Component, OnInit } from '@angular/core';
import { MainService } from '../shared/main.service';
import { Router } from '@angular/router';
import { Tweet } from '../models/tweet.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.model';
import {Location} from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../shared/data.service';
import { getStorage, ref, uploadBytes, getDownloadURL  } from 'firebase/storage';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
})
export class CreateComponent implements OnInit {
  image: Uint8Array | null = null;
  dataURL: string = '';
  tweet: Tweet = {
    id: '',
    content: '',
    likes: 0,
    userId: '',
    createdAt: '',
    image: []
  };
  uploadForm!: FormGroup;
  user!: any;

  constructor(
    private service: MainService,
    private route: Router,
    private fb: FormBuilder,
    private _location: Location,
    private toastr: ToastrService,
    private data:DataService
  ) {}
  ngOnInit(): void {
    if(!sessionStorage.getItem('token')){
      this.route.navigate(['login']);
      return;
    }

    this.uploadForm = this.fb.group({
      content: ['', [Validators.required]],
      image: [''],
    });
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
      .then(snapshot => {
        // Get the download URL after the file is uploaded
        return getDownloadURL(snapshot.ref);
      })
      .then(downloadURL => {
        // Store the download URL in your Firestore document
        this.tweet.image = downloadURL;
        this.dataURL=downloadURL
      })
      .catch(error => {
        console.error('Error uploading image:', error);
      });

  }

  upload() {
    this.tweet.content = this.uploadForm.get('content')?.value.toString();
    this.tweet.userId = sessionStorage.getItem('token')!;
    this.data.addTweet(this.tweet).then(()=>{
      this.route.navigate(["home"]);
      this.toastr.success('uploaded');
    })
  }
  goBack(){
    this._location.back();
  }
}
