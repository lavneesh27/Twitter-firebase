import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  remember: boolean = false;
  email: string = '';
  password: string = '';
  constructor(private _location: Location, private auth: AuthService) {}

  login() {
    if (this.email == '') {
      alert('Please enter email');
      return;
    }

    if (this.password == '') {
      alert('Please enter password');
      return;
    }

    this.auth.login(this.email, this.password, this.remember);
    this.email = '';
    this.password = '';
  }

  goBack() {
    this._location.back();
  }
}
