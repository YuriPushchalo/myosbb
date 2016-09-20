import { Component, Output, Input, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {CORE_DIRECTIVES,FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators} from '@angular/common';
import { ITicket, Ticket,TicketState} from '../ticket';
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap/ng2-bootstrap';
import {ModalDirective} from "ng2-bootstrap/ng2-bootstrap";
import {User} from './../../user';
import {CurrentUserService} from "./../../../../shared/services/current.user.service";
import { TicketService } from './../ticket.service';
import { TicketFilter } from './../ticket.filter';
import {TranslatePipe} from "ng2-translate/ng2-translate";
@Component({
    selector: 'ticket-add-form',
    templateUrl: './src/app/user/ticket/ticket_form/ticket-add-form.html',
    providers: [TicketService],
    directives: [MODAL_DIRECTIVES, CORE_DIRECTIVES, FORM_DIRECTIVES],
    viewProviders: [BS_VIEW_PROVIDERS],
    pipes: [TicketFilter, TranslatePipe],
    styleUrls: ['src/app/user/ticket/ticket.css']
})

export class TicketAddFormComponent implements OnInit {
    @Output() created:EventEmitter<Ticket>;
    @Input() ticket:ITicket;
    @ViewChild('addModal')
    addModal:ModalDirective;
    currentUser:User;

    private userAssignArr:User[] = [];
    private assign:User;
    private creatingForm:ControlGroup;
    private nameInput:Control;
    private descriptionInput:Control;
    private assignInput:Control;
    private submitAttempt:boolean;
    private nameTicket:string = '';
    private descriptionTicket:string = '';
    private assignTicket:string = '';
    private submitName = false;
    private submitDescription = false;

    constructor(private ticketService:TicketService,
                private currentUserService:CurrentUserService,
                private builder:FormBuilder) {
        this.created = new EventEmitter<Ticket>();

        this.submitAttempt = false;
        this.nameInput = new Control('', Validators.required);
        this.descriptionInput = new Control('', Validators.required);
        this.assignInput = new Control('', Validators.required);

        this.creatingForm = builder.group({
            nameInput: this.nameInput,
            descriptionInput: this.descriptionInput,
            assignInput: this.assignInput
        });

    }

    ngOnInit() {
        this.getAllUsers()
    }

    openAddModal() {
        this.addModal.show();
    }

    isEmptyName():boolean {
        return this.nameTicket.length >=10 ? false : true;
    }

    isEmptyDescription():boolean {
        return this.descriptionTicket.length >= 20 ? false : true;
    }

    isFindAssign():boolean {
        return this.getAssignedId(this.assignTicket) == null ? false : true;
    }

    getAllUsers() {
        return this.ticketService.getAllUsers()
            .then(userAssignArr => this.userAssignArr = userAssignArr);
    }

    toggleSubmitAttempt() {
        this.submitAttempt = true;
    }

    closeAddModal() {
        this.submitAttempt = false;
        this.clearAddModal();
        this.addModal.hide();
    }

    clearAddModal() {
        this.nameTicket = '';
        this.descriptionTicket = '';
        this.assignTicket = '';

    }

    onCreateTicket() {
        if (this.nameInput.valid && this.descriptionInput.valid && this.assignInput.valid&&
            this.isEmptyDescription()&&this.isEmptyName()&&this.isFindAssign()) {
            this.created.emit(this.createTicket());
            this.closeAddModal();
        }
    }

    createTicket():Ticket {
        let ticket = new Ticket(this.nameTicket, this.descriptionTicket, TicketState.NEW);
        ticket.user = this.currentUserService.getUser();
        ticket.assigned = this.getAssignedId(this.assignTicket);
        return ticket;

    }

    findUsers(name:string) {
        if (name.trim() != '') {
            this.ticketService.findAssignUser(name)
                .then(userAssignArr => this.userAssignArr = userAssignArr)
        }
    }

    getAssignedId(assign:string):User {
        let str = assign.split(' ');
        for (let i = 0; i < this.userAssignArr.length; i++) {
            if (str[0] == this.userAssignArr[i].firstName && str[1] == this.userAssignArr[i].lastName) {
                return this.userAssignArr[i];
            }
        }
    }

}
