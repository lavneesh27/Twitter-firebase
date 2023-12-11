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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  user!: any;
  tweets: Tweet[] = [];
  updateForm!: FormGroup;
  @Input() userNav: any;

  constructor(
    private service: MainService,
    private _location: Location,
    private router: Router,
    private fb: FormBuilder,
    private data: DataService,
    private toastr: ToastrService
  ) {}
  async ngOnInit() {
    const uid =
      localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (uid) {
      this.user = await this.data.getUser(uid);
    } else {
      this.router.navigate(['login']);
      return;
    }
    if (history?.state?.people) {
      this.user = history?.state?.people;
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
    });
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

    try {
      this.data.updateUser(this.user);
      this.toastr.success('Profile Updated');
      
    } catch (err) {
      this.toastr.error('Some error occurred');
    }
  }
}
