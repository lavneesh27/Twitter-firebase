import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../shared/data.service';
import { ChatService } from '../shared/chat.service';
import { Location } from '@angular/common';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit {
  @ViewChild('chatBody') myDiv: ElementRef | undefined;
  user: any;
  users: User[] = [];

  constructor(
    private data: DataService,
    private chat: ChatService,
    private _location: Location,
    private router: Router
  ) {}
  async ngOnInit() {
    const userToken = sessionStorage.getItem('token');

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
            (err: any) => {
              alert('Error while fetching users');
            }
          )
          .filter((people: User) => people.userName !== this.user.userName);
      });
    }
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
          (err: any) => {
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
