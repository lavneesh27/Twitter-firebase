import { Component, OnInit } from '@angular/core';
import { MainService } from '../shared/main.service';
import { User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  constructor(
    private router: Router,
    private data: DataService
  ) {}
  peoples: User[] = [];
  inputUser: string = '';
  user: any;
  async ngOnInit() {
    const userToken =
      sessionStorage.getItem('token');

    if (userToken) {
      this.user = await this.data.getUser(userToken);

      if (this.user.id) {
        this.data.getAllUsers().subscribe((res: any) => {
          this.peoples = res
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
  }

  filter(searchText: string) {
    this.data.getAllUsers().subscribe((res: any) => {
      this.peoples = res
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
  NavigateToProfile(data: any) {
    this.router.navigateByUrl('/profile', { state: { people: data } });
  }
}
