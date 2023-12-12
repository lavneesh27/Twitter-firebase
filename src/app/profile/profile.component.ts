import { Component, Input } from '@angular/core';
import { User } from '../models/user.model';
import { MainService } from '../shared/main.service';
import { jwtDecode } from 'jwt-decode';
import { Tweet } from '../models/tweet.model';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../shared/data.service';
import { NgxUiLoaderService } from "ngx-ui-loader"; 

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  user!: any;
  tweets: Tweet[] = [];
  updateForm!: FormGroup;
  isAdmin: boolean = false;
  isLoading: boolean = true;
  constructor(
    private service: MainService,
    private _location: Location,
    private router: Router,
    private fb: FormBuilder,
    private data: DataService,
    private toastr: ToastrService,
    private ngxService: NgxUiLoaderService
  ) {}
  async ngOnInit() {
    this.ngxService.start();
    if (history?.state?.people) {
      this.user = history?.state?.people;
      return;
    } else {
      this.isAdmin = true;
      const uid =
        sessionStorage.getItem('token') ?? sessionStorage.getItem('token');
      if (uid) {
        this.user = await this.data.getUser(uid);
      } else {
        this.router.navigate(['login']);
        return;
      }
    }
    if (this.user && this.user.image.length) {
      const base64String = btoa(
        String.fromCharCode.apply(null, Array.from(this.user.image))
      );
      this.user.image = 'data:image/jpeg;base64,' + base64String;
    }

    this.updateForm = this.fb.group({
      firstName: [
        this.user.firstName,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern('[a-zA-Z].*'),
        ],
      ],
      lastName: [
        this.user.lastName,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern('[a-zA-Z].*'),
        ],
      ],
      email: [this.user.email, [Validators.required, Validators.email]],
      dob: [this.user.dob],
      userName: [
        this.user.userName,
        [Validators.required, Validators.minLength(2)],
      ],
      // image: [this.user.image],
    });

    this.data.getAllTweets().subscribe((res: any) => {
      this.tweets = res
        .map(
          (e: any) => {
            const data = e.payload.doc.data();
            data.id = e.payload.doc.id;
            return data;
          },
          (err: any) => {
            alert('Error while fetching tweets');
          }
        )
        .filter((tweet: Tweet) => {
          return tweet.userId == this.user.id;
        });
        this.tweets.sort((a, b) => ( new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1));
    });
    this.ngxService.stop();
    setTimeout(() => {
      this.isLoading=false;
    }, 500);
  }
  goBack() {
    this._location.back();
  }
  update() {
    this.user.firstName = this.updateForm.get('firstName')?.value;
    this.user.lastName = this.updateForm.get('lastName')?.value;
    this.user.dob = this.updateForm.get('dob')?.value;
    this.user.userName = this.updateForm.get('userName')?.value;
    this.user.email = this.updateForm.get('email')?.value;

    console.log(this.user.image)

    try {
      this.data.updateUser(this.user);
      this.toastr.success('Profile Updated');
    } catch (err) {
      this.toastr.error('Some error occurred');
    }
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
    reader.onload = () => {
      const base64 = reader.result as string;
      console.log("before", this.user.image)
      // this.user.image = this.base64ToBytes(base64);
      this.user.image = base64;
      console.log("after", this.user.image)

    };
    reader.readAsDataURL(file);
  }

  base64ToBytes(base64: string): Uint8Array {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers);
  }
}
