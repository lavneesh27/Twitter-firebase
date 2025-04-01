import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ChatService } from '../shared/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../shared/data.service';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Chat } from '../models/chat.model';
import { MainService } from '../shared/main.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  private modalService = inject(NgbModal);
  @ViewChild('chatBody') myDiv: ElementRef | undefined;
  @ViewChild('myInput') myInput: ElementRef | undefined;

  subscription: any;
  gifs: any[] = [];
  message: Chat = {
    id: '',
    senderId: '',
    recieverId: '',
    text: '',
    createdAt: '',
    attachment: '',
  };
  messages: any[] = [];
  reciever: any;
  user: any;
  showButton: boolean = false;
  isChatsLoading = true;
  isRecieverLoading = true;

  constructor(
    private chatService: ChatService,
    private aRoute: ActivatedRoute,
    private data: DataService,
    private _location: Location,
    private route: Router,
    private service: MainService,
    private toastr: ToastrService
  ) {}
  async ngOnInit() {
    this.isRecieverLoading = true;
    this.messages = [];
    this.aRoute.params.subscribe(async (params) => {
      this.reciever = await this.data.getUser(params['uuid']);
      this.isRecieverLoading = false;
    });

    this.user = await this.data.getUser(
      sessionStorage.getItem('token') || localStorage.getItem('token')!
    );

    if (!this.user) {
      this.route.navigate(['login']);
    }
    this.isChatsLoading = true;
    this.chatService.getMessages().subscribe((res) => {
      this.messages = res
      .filter((msg: any) => 
        (msg.recieverId === this.reciever.id && msg.senderId === this.user.id) ||
        (msg.recieverId === this.user.id && msg.senderId === this.reciever.id)
      )
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      this.isChatsLoading = false;
      if(this.messages.length){
        setTimeout(() => {
          if (this.myDiv) {
            this.scrollToBottom();
          }
        }, 300);
      }
    });
    if (this.myInput) {
      this.myInput.nativeElement.focus();
    }

  }

  sendMessage() {
    if (this.message!.text == '' && this.message!.attachment == '') {
      alert('Please enter some message');
      return;
    }
    this.chatService.sendMessage(this.message, this.reciever.id);
    this.message = {
      id: '',
      senderId: '',
      recieverId: '',
      text: '',
      createdAt: '',
      attachment: '',
    };
  }
  goBack() {
    this._location.back();
  }
  navigateToProfile(userId: string): void {
    this.route.navigate(['/profile', userId]);
  }
  clear() {
    this.chatService.clearMessages(this.messages);
    this.toastr.success('Chats Cleared!');
    this.modalService.dismissAll();
  }
  open(content: TemplateRef<any>) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
      windowClass: 'dark-modal',
    });
  }
  onImport(vitalSignsDataModal: any) {
    this.modalService.dismissAll();
    this.modalService.open(vitalSignsDataModal, { size: 'lg', centered: true });
    this.service.getTrendingGifs();
    this.subscription = this.service.getGifs().subscribe((res) => {
      this.gifs = res;
    });
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select only image files.');
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, 'images/' + file.name);

    uploadBytes(storageRef, file)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then((downloadURL) => {
        this.message!.attachment = downloadURL;
        this.sendMessage();
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
      });
  }

  searchGif(searchTerm: any) {
    if (searchTerm !== '') {
      this.service.searchGifs(searchTerm);
      this.subscription = this.service.getGifs().subscribe((res) => {
        this.gifs = res;
      });
    }
  }
  selectGif(gif: any) {
    this.message.attachment = gif.images.original.url;
    this.sendMessage();
    this.modalService.dismissAll();
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY;

    if (scrollPosition + windowHeight >= documentHeight) {
      this.showButton = false;
    } else {
      this.showButton = true;
    }
  }

  scrollToBottom() {
    window.scrollTo({ top: this.myDiv!.nativeElement.scrollHeight, behavior: 'smooth' });
  }
}
