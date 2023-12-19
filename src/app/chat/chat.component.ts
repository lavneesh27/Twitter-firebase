import { Component } from '@angular/core';
import { ChatService } from '../shared/chat.service';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../shared/data.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: false ,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  message = '';
  messages: any[] = [];
  reciever:any;
  
  constructor(private chatService: ChatService, private aRoute: ActivatedRoute, private data:DataService,  private _location: Location,) {}
  ngOnInit() {
    this.aRoute.params.subscribe(async (params) => {
      this.reciever = await this.data.getUser(params['uuid']);
      console.log(this.reciever)
    });
  }
  
  sendMessage() {
    this.chatService.sendMessage(this.message,this.reciever.id);
    this.message = '';
  }
  goBack(){
    this._location.back();
  }
}
