import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css'],
})
export class StartComponent {
  loginForm!: FormGroup;
  remember: boolean = false;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pwd: ['', Validators.required],
      rem: [false],
    });
  }
  onImport(vitalSignsDataModal: any) {
    this.modalService.dismissAll();
    this.modalService.open(vitalSignsDataModal, { size: 'lg', centered: true });
  }
  login() {
    // this.service.loginUser(this.loginForm.get('email')!.value, this.loginForm.get('pwd')!.value).subscribe(
    //   (res: any) => {
    //     this.remember
    //       ? localStorage.setItem('user', res.toString())
    //       : sessionStorage.setItem('user', res.toString());

    //     this.router.navigate(['home']);
    //     this.toastr.success('Login Successful!');
    //   },
    //   () => {
    //     this.toastr.warning('Invalid Credentials');
    //   }
    // );
  }

  get Email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }
  get PWD(): FormControl {
    return this.loginForm.get('pwd') as FormControl;
  }
}
