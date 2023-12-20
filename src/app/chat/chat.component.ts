import { Component } from '@angular/core';
import { ChatService } from '../shared/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../shared/data.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  message = '';
  messages: any[] = [];
  reciever: any;
  user: any;

  constructor(
    private chatService: ChatService,
    private aRoute: ActivatedRoute,
    private data: DataService,
    private _location: Location,
    private route: Router
  ) {}
  async ngOnInit() {
    this.messages=[]
    this.aRoute.params.subscribe(async (params) => {
      this.reciever = await this.data.getUser(params['uuid']);
    });

    this.user = await this.data.getUser(sessionStorage.getItem('token')!);

    if (!this.user) {
      this.route.navigate(['login']);
    }

    this.chatService.getMessages().subscribe((res) => {
      this.messages = res;
      this.messages.sort((a, b) =>
        new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1
      );

      this.messages = this.messages.filter((msg) => {
        return (
          (msg.recieverId === this.reciever.id &&
            msg.senderId === this.user.id) ||
          (msg.recieverId === this.user.id && msg.senderId === this.reciever.id)
        );
      });
    });
  }

  sendMessage() {
    this.chatService.sendMessage(this.message, this.reciever.id);
    this.message = '';
  }
  goBack() {
    this._location.back();
  }
}
