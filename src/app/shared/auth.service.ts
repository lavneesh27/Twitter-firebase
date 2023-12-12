import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DataService } from './data.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private fireAuth: AngularFireAuth,
    private router: Router,
    private afs: AngularFirestore,
    private data: DataService,
    private toastr:ToastrService
  ) {}
  login(email: string, password: string) {
    this.fireAuth.signInWithEmailAndPassword(email, password).then(
      (res) => {
        const userDoc = this.afs.collection('/Users').doc(res.user!.uid).get();
        sessionStorage.setItem('token', String(res.user?.uid));

        // if(res.user?.emailVerified==true){
        //   this.router.navigate(['dashboard']);
        // }else{
        //   this.router.navigate(['/verify']);
        // }
        this.router.navigate(['/home']);
        setTimeout(() => {
          window.location.reload();
        }, 80);
      },
      (err) => {
        alert(err.message);
      }
    );
  }
  register(user: User) {
    this.fireAuth
      .createUserWithEmailAndPassword(user.email, user.password)
      .then(
        (res) => {
          alert('Registration Successful');
          this.router.navigate(['login']);
          this.sendEmailVerification(res.user);
          user.id = res.user!.uid;
          user.createdAt =  new Date().toLocaleDateString();
          this.data.addUser(user);
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

  sendEmailVerification(user: any) {
    user.sendEmailVerification().then(
      () => {
        this.router.navigate(['/verify']);
      },
      (err: any) => {
        alert('Something went wrong');
      }
    );
  }

  forgotPassword(email: string) {
    this.fireAuth.sendPasswordResetEmail(email).then(
      () => {
        this.router.navigate(['/verify']);
      },
      (err) => {
        alert('Something went wrong');
      }
    );
  }

  googleSignIn() {
    return this.fireAuth.signInWithPopup(new GoogleAuthProvider()).then(
      (res) => {
        this.router.navigate(['/home']);
        localStorage.setItem('token', JSON.stringify(res.user?.uid));
      },
      (err) => {
        alert(err.message);
      }
    );
  }
}
