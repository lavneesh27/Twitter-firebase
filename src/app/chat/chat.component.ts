import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { ChatService } from '../shared/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../shared/data.service';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  private modalService = inject(NgbModal);
  @ViewChild('chatBody') myDiv: ElementRef | undefined;
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
    this.messages = [];
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
      setTimeout(() => {
        if (this.myDiv) {
          this.myDiv!.nativeElement.scrollTop =
            this.myDiv!.nativeElement.scrollHeight;
        }
      }, 50);
    });
  }

  sendMessage() {
    if (this.message == '') {
      alert('Please enter some message');
      return;
    }
    this.chatService.sendMessage(this.message, this.reciever.id);
    this.message = '';
  }
  goBack() {
    this._location.back();
  }
  navigateToProfile(userId: string): void {
    this.route.navigate(['/profile', userId]);
  }
  clear(){
    this.chatService.clearMessages(this.messages);
    this.modalService.dismissAll();
  }

  deleteMsg(chatId:string){
    this.chatService.deleteMessage(chatId);
  }
  open(content: TemplateRef<any>) {
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',centered: true, size:'sm',windowClass: 'dark-modal'})
	}
}
