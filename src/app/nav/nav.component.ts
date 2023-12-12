import { Component, OnInit, TemplateRef, inject } from '@angular/core';
import { MainService } from '../shared/main.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  user?: any;
  imgUrl: any;
  private modalService = inject(NgbModal);


  constructor(private router: Router, private toastr:ToastrService,private data:DataService) {}
  async ngOnInit()  {
    let uid = sessionStorage.getItem('token') ?? sessionStorage.getItem('token');
    if(uid){
      this.user = await  this.data.getUser(uid);
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
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',centered: true, size:'sm',windowClass: 'dark-modal'})
	}
  
}
