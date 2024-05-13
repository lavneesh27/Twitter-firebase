import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../shared/data.service';
import { Location } from '@angular/common';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { ChatService } from '../shared/chat.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit {
  @ViewChild('chatBody') myDiv: ElementRef | undefined;
  user: any;
  users: User[] = [];
  displayUsers: User[] = [];

  constructor(
    private data: DataService,
    private _location: Location,
    private router: Router,
    private chat: ChatService
  ) {}
  async ngOnInit() {
    const userToken =
      sessionStorage.getItem('token') || localStorage.getItem('token');

    if (userToken) {
      this.user = await this.data.getUser(userToken);
      this.data.getAllUsers().subscribe((res: any) => {
        this.users = res
          .map(
            (e: any) => {
              const data = e.payload.doc.data();
              data.id = e.payload.doc.id;
              return data;
            },
            () => {
              alert('Error while fetching users');
            }
          )
          .filter((people: User) => people.userName !== this.user.userName);
        });
      }
      // this.users.sort((a, b) =>
      //   new Date(a.recentMessageTime!) < new Date(b.recentMessageTime!) ? 1 : -1
      // );
      setTimeout(() => {
        this.getRecentForAllUsers(this.users);
      }, 140);
      
     
  }
  getRecentForAllUsers(data: any) {
    for (let i = 0; i < data.length; i++) {
      this.getRecentMessage(data[i].id).subscribe((msg: any) => {
        data[i].recentMessage = msg?.text;
        data[i].recentMessageTime = msg?.createdAt;
      });
    }
    setTimeout(() => {
      this.users.sort((a, b) => {
        if (a.recentMessageTime && b.recentMessageTime) {
          return new Date(b.recentMessageTime).getTime() - new Date(a.recentMessageTime).getTime();
        } else if (a.recentMessageTime) {
          return -1; 
        } else if (b.recentMessageTime) {
          return 1; 
        }
        return 0; 
      });
      this.displayUsers = this.users;
    }, 100);
  }
  getRecentMessage(senderId: any): Observable<string> {
    return this.chat.getDisplayMessage(senderId, this.user.id).pipe(
      map((res: any) => {
        let result;
        if (res[0]?.createdAt && res[1]?.createdAt) {
          result = (res[0].createdAt > res[1].createdAt) ? res[0] : res[1];
        } else {
          result = res[0] ? res[0] : res[1];
        }
        return result ? result : null;
      })
    );
}
  filter(searchText: string) {
    this.data.getAllUsers().subscribe((res: any) => {
      this.users = res
        .map(
          (e: any) => {
            const data = e.payload.doc.data();
            data.id = e.payload.doc.id;

            return data;
          },
          () => {
            alert('Error while fetching users');
          }
        )
        .filter((user: User) => {
          return (
            (user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
              user.userName.toLowerCase().includes(searchText.toLowerCase())) &&
            user.userName !== this.user.userName
          );
        });
    });
  }
  goBack() {
    this._location.back();
  }
  navigateToChat(userId: string): void {
    this.router.navigate(['/chat', userId]);
  }
}
