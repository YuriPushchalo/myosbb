import {Component, OnInit} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap/ng2-bootstrap';
import {ModalDirective} from "ng2-bootstrap/ng2-bootstrap";
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import { OsbbDTO } from './osbb';
import { OsbbService } from './osbb.service';
import { OsbbModalComponent } from './osbb_form/osbb-modal.component';
import { OsbbDelFormComponent } from './osbb_form/osbb-del-form.component';
import {CurrentUserService} from "../../../../shared/services/current.user.service";
import {UrlParserService} from "../../../../shared/services/url.parser.service";
import {TranslatePipe} from "ng2-translate";
import {CapitalizeFirstLetterPipe} from "../../../../shared/pipes/capitalize-first-letter";
import ApiService = require("../../../../shared/services/api.service");
import {FILE_UPLOAD_DIRECTIVES, FileSelectDirective, FileDropDirective, FileUploader} from "ng2-file-upload/ng2-file-upload";

import {IOsbb, Osbb} from "../../../../shared/models/osbb";
import fileDownloadPath = require("../../../../shared/services/file.location.path");

const attachmentUploadUrl = ApiService.serverUrl + '/restful/osbb';
const logoPath = fileDownloadPath.fileDownloadPath;

@Component({
    selector: 'osbb',
    templateUrl: './src/app/admin/components/osbb/osbb.component.html',
    styleUrls: ['./src/app/admin/components/osbb/osbb.component.css', './src/shared/css/general.css'],
    providers: [OsbbService, UrlParserService],
    directives: [MODAL_DIRECTIVES, CORE_DIRECTIVES, OsbbModalComponent, OsbbDelFormComponent],
    viewProviders: [BS_VIEW_PROVIDERS],
    pipes: [TranslatePipe, CapitalizeFirstLetterPipe]
})
export class OsbbComponent implements OnInit { 
    
    osbbArr:IOsbb[];
    updatedOsbb:IOsbb;
    order: boolean;

    constructor( private osbbService: OsbbService, private urlParser:UrlParserService, private userService:CurrentUserService) { 
        this.osbbArr = [];
    }

    ngOnInit() {
        this.initOsbbArr("All");
    }

    private initUpdatedOsbb(osbb:IOsbb): void {
        this.updatedOsbb = osbb;
    }

    initOsbbArr(available: string) {
        if(available === "All") {
            this.osbbService.getAllOsbb().then(osbbArr => this.osbbArr = osbbArr);
        }
        else if(available === "Available"){
            this.osbbService.getByAvailable(true).then(osbbArr => this.osbbArr = osbbArr);
        } else {
            this.osbbService.getByAvailable(false).then(osbbArr => this.osbbArr = osbbArr);
        }
    }

    createOsbb(osbbDTO:OsbbDTO): void {
        //this.osbbService.upload(osbbDTO.file); //addOsbb(osbbDTO.osbb)
       // let osbb = osbbDTO.osbb;
      //  osbb.file = osbbDTO.file;
         //this.osbbService.addOsbb(osbbDTO);

        this.osbbService.upload(osbbDTO.file)         
        .then((attachment)=> {
            let osbb = osbbDTO.osbb;
            osbb.logo = attachment;
            this.osbbService.addOsbb(osbb).then((osbb)=> this.osbbArr.unshift(osbb));
        });
        /* this.osbbService.upload(osbbDTO.file)         // IT`S WORK!!!!!!!!!!!!
        .then((attachment)=> console.log("response: " + attachment.attachmentId));*/
      
    }

    private addOsbb(osbb: IOsbb): void {
        this.osbbArr.unshift(osbb);
    }

    editOsbb(osbb:IOsbb): void {
        this.osbbService.editOsbb(osbb);
    }

    deleteOsbb(osbb:IOsbb): void {
        this.osbbService.deleteOsbb(osbb).then(osbb => this.deleteOsbbFromArr(osbb));
    }

     private deleteOsbbFromArr(osbb: IOsbb): void {
         let index = this.osbbArr.indexOf(osbb);
         if(index > -1) {
            this.osbbArr.splice(index, 1);
         }
    }

    getCreationDate(date:Date):string {
        return new Date(date).toLocaleString();
    }

     parseUrl(path: string): string {
        return this.urlParser.parseUrl(path);
    }

    searchByNameOsbb(osbbName: string) {
        if(osbbName.trim()!=='') {
            this.osbbService.getAllOsbbByNameContaining(osbbName).then(osbbArr => this.osbbArr = osbbArr);
        } else {
             this.osbbService.getAllOsbb().then(osbbArr => this.osbbArr = osbbArr);
        }
    }

    toggleOrder() {
        if(this.order === false) {
            this.order = true;
        } else {
            this.order = false;
        }
    }

    sortBy(field:string): void {
        this.toggleOrder();
        this.osbbService.getAllOsbbByOrder(field, this.order).then(osbbArr => this.osbbArr = osbbArr);
    }

    clearSearch(searchInput) {
        if(searchInput.value === '') {
            this.initOsbbArr("All");
        }
    }
}