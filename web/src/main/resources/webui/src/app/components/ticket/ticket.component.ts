import {
  Component,
  OnInit,
  Input,
  NgModule
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { TicketService } from './ticket.service';
import { LoginService } from '../../shared/login/login.service';
import { PageRequest } from '../../models/pageRequest.model';
import {TicketAddFormComponent} from './components/ticketAddFormComponent/ticket-add-form.component'
import {User} from '../../models/user.model';
import {Ticket, TicketState, ITicket} from "../../models/ticket.model";
@Component({
    selector: 'ticket',
    styleUrls: [
      '../../../assets/css/page.layout.scss',
      './ticket.page.scss'
    ],
    templateUrl: 'tickets.component.html',
    providers: [
      TicketService
    ]
})

export class TicketComponent implements OnInit {
 @Input() ticket:Ticket;
  private ticketArr:ITicket[] = [];
  private updatedTicket:ITicket;
  public resData: any;
  public pageRequest = new PageRequest(1, 10, 'time', false);
  public title: string = 'Tickets';
  private str:string;
  private user: User;

  constructor(
    public ticketService: TicketService,
    public router: Router,
    public loginService:LoginService
  ) {
     this.user=loginService.currentUser;
   }

  public ngOnInit() {
    this.ticketService.getTicketData()
      .subscribe((response) => {
        this.resData = response.rows;
      });
  };

  createTicket(ticket:ITicket):void{
    console.log('ticket component')
    this.ticketService.addTicket(ticket).
    then(ticket=>this.addTicket(ticket));
  }
private addTicket(ticket:ITicket):void{
  this.resData.unshift(ticket)
}

  deleteTicket(ticket:ITicket):void {
        this.ticketService.deleteTicket(ticket).then(ticket => this.deleteTicketFromArr(ticket));
    }

    editTicket(ticket:ITicket):void{
      this.ticketService.editTicket(ticket);
      let index=this.resData.indexOf(ticket);
      if(index>1){
        this.resData[index]=ticket;
      }
    }


    private deleteTicketFromArr(ticket:ITicket):void {
        let index = this.resData.indexOf(ticket);
        if (index > -1) {
            this.resData.splice(index, 1);
        }
    }

  public findTicketByState(state: string) {
    this.ticketService.findByState(state)
      .subscribe((response) => {
        this.resData = response.rows;
      });
  };

  public subTicketNavigation(ticket: any) {
    console.log("subTicketNavigation start");
    switch (this.loginService.getRole()) {
      case 'ROLE_USER':
        this.router.navigate([`./user/ticket/`, ticket]);
        break;
      case 'ROLE_ADMIN':
       this.router.navigate([`./admin/ticket/`, ticket]);
        break;
       case 'ROLE_MANAGER':
        this.router.navigate([`./manager/ticket/`, ticket]);
         break;
      default :
        console.log(this.loginService.getRole.arguments);
         break;
     }
     console.log("subTicketNavigation end");
  };

  public findMyAssigned() {
    this.ticketService.findByAssigned(this.pageRequest,
      localStorage.getItem('email'), status)
      .subscribe((response) => {
        this.resData = response.rows;
      });
  };

  public findMyTickets() {
    this.ticketService.getTicketData()
      .subscribe((response) => {
        this.resData = response.rows;
      });
  };

  public getTicketsByPageNum() {
    this.ticketService.getTicketData()
      .subscribe((response) => {
        this.resData = response.rows;
      });
  };
}
