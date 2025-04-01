import { Component, OnInit, TemplateRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../shared/data.service';
import { ChatService } from '../shared/chat.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  user?: any;
  imgUrl: any;
  private modalService = inject(NgbModal);

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private data: DataService,
    private chat:ChatService
  ) {}
  async ngOnInit() {
    let uid = sessionStorage.getItem('token') ?? localStorage.getItem('token');
    if (uid) {
      this.user = await this.data.getUser(uid);
    }
  }
  
  logout() {
    sessionStorage.clear();
    localStorage.clear();
    this.modalService.dismissAll();
    this.router.navigate(['/login']).then(() => {
      setTimeout(() => {
        window.location.reload();
      }, 300);
      this.toastr.success('Logout Successful');
    });
  }

  login() {
    this.router.navigate(['/login']);
  }
  open(content: TemplateRef<any>) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
      windowClass: 'dark-modal',
    });
  }
  toggle() {
    let ele = document.querySelector('.dropdown-menu') as HTMLElement;
    if (ele) {
      const isVisible = ele.classList.toggle('show');
      Object.assign(ele.style, {
        opacity: isVisible ? '1' : '0',
        visibility: isVisible ? 'visible' : 'hidden',
        transform: isVisible ? 'translateY(0)' : 'translateY(-10px)'
      });
    }  
  }
}
