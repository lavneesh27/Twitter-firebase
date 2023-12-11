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
    let uid = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if(uid){
      this.user = await  this.data.getUser(uid);
    }

    if (this.user) {
      // this.user = jwtDecode(userToken);
      // this.imgUrl += this.user.image;
      // Assuming `this.user.image` is your Uint8Array containing image data
      const base64String = btoa(
        String.fromCharCode.apply(null, Array.from(this.user.image))
      );
      this.imgUrl = 'data:image/jpeg;base64,' + base64String;
    }
  }
  
  bytesToBase64(bytes: any) {
    const byteArray = new Uint8Array(bytes);
    let binary = '';
    for (let i = 0; i < byteArray.byteLength; i++) {
      binary += String.fromCharCode(byteArray[i]);
    }
    return window.btoa(binary);
  }

  logout() {
    sessionStorage.clear();
    localStorage.clear();
    this.modalService.dismissAll();
    this.router.navigate(['/login']).then(() => {
      setTimeout(() => {
        window.location.reload();
      }, 500);
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
