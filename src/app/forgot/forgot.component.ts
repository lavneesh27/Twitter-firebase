import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css'],
})
export class ForgotComponent {
  constructor(private auth: AuthService) {}
  email: string = '';

  forgot() {
    this.auth.forgotPassword(this.email);
  }
}
