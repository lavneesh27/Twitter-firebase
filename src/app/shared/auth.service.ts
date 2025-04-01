import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { DataService } from './data.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private fireAuth: AngularFireAuth,
    private router: Router,
    private data: DataService,
    private toastr: ToastrService
  ) {}
  login(email: string, password: string, remember: boolean): Promise<string | null> {
    return this.fireAuth.signInWithEmailAndPassword(email, password)
      .then((res) => {
        const userId = res.user?.uid || null;
        if (userId) {
          this.router.navigate(['home']);
          remember
            ? localStorage.setItem('token', userId)
            : sessionStorage.setItem('token', userId);

          setTimeout(() => {
            window.location.reload();
          }, 80);
        }
        return userId;
      })
      .catch((err) => {
        alert(err.message);
        return null;
      });
  }
  
  register(user: User) {
    this.fireAuth
      .createUserWithEmailAndPassword(user.email, user.password)
      .then(
        (res) => {
          this.toastr.success('Registration Successful');
          user.id = res.user!.uid;
          user.createdAt = new Date().toDateString();
          this.data.addUser(user);
          this.router.navigate(['login']);
        },
        (err) => {
          alert(err.message);
          this.router.navigate(['/register']);
        }
      );
  }

  logout() {
    this.fireAuth.signOut().then(
      () => {
        localStorage.removeItem('token');
        this.router.navigate(['login']);
      },
      (err) => {
        alert(err.message);
      }
    );
  }

  googleSignIn() {
    return this.fireAuth.signInWithRedirect(new GoogleAuthProvider());
  }

  forgotPassword(email: string) {
    this.fireAuth.sendPasswordResetEmail(email).then(
      () => {
        alert('Password reset link is sent to your email');
        this.router.navigate(['login'])
      },
      (_err) => {
        alert('Something went wrong');
      }
    );
  }
}
