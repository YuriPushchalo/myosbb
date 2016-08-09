import {Component, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from "@angular/common";
import {Report} from "./report.interface";
import {ReportService} from "./report.service";
import {PageCreator} from "../../../shared/services/page.creator.interface";
import "rxjs/Rx";
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS, ModalDirective, BUTTON_DIRECTIVES} from "ng2-bootstrap/ng2-bootstrap";
import {ReportFilter} from "./report.filter";
import {DomSanitizationService} from "@angular/platform-browser";
import {SELECT_DIRECTIVES} from "ng2-select";
import {TranslatePipe} from "ng2-translate";
import {CapitalizeFirstLetterPipe} from "../../../shared/pipes/capitalize-first-letter";


@Component({
    selector: 'my-report',
    templateUrl: 'src/app/user/report/report.html',
    providers: [ReportService],
    directives: [MODAL_DIRECTIVES, CORE_DIRECTIVES, SELECT_DIRECTIVES, FORM_DIRECTIVES, BUTTON_DIRECTIVES],
    viewProviders: [BS_VIEW_PROVIDERS],
    styleUrls: ['src/app/user/report/report.css'],
    pipes: [ReportFilter, TranslatePipe, CapitalizeFirstLetterPipe]
})
export class UserReportComponent implements OnInit, OnDestroy {

    private reports: Report[] = [];
    private selectedReport: Report = {reportId: null, name: '', description: '', creationDate: '', filePath: ''};
    private pageCreator: PageCreator<Report>;
    private pageNumber: number = 1;
    private pageList: Array<number> = [];
    private totalPages: number;
    private dates: string[] = [];
    private dateFrom: string;
    private dateTo: string
    @ViewChild('delModal') public delModal: ModalDirective;
    @ViewChild('editModal') public editModal: ModalDirective;
    active: boolean = true;
    order: boolean = true;
    isShowOptional: boolean = false;
    dateFromActive: boolean = false;
    dateToActive: boolean = false;

    private reportId: number;

    constructor(private _reportService: ReportService, private sanitizer: DomSanitizationService) {

    }

    onClickShowOptional() {
        this.isShowOptional = !this.isShowOptional;
        if (!this.isShowOptional) {
            this.getReportsByPageNum(this.pageNumber);
        }
    }

    openEditModal(report: Report) {
        this.selectedReport = report;
        console.log('selected report: ' + this.selectedReport);
        this.editModal.show();
    }

    isDateValid(date: string): boolean {
        return /\d{4}-\d{2}-\d{2}/.test(date);
    }

    onEditReportSubmit() {
        this.active = false;
        console.log('saving report: ' + this.selectedReport);
        this._reportService.editAndSave(this.selectedReport);
        this.getReportsByPageNum(this.pageNumber);
        this.editModal.hide();
        setTimeout(() => this.active = true, 0);
    }

    closeEditModal() {
        console.log('closing edt modal');
        this.editModal.hide();
    }

    openDelModal(id: number) {
        this.reportId = id;
        console.log('show', this.reportId);
        this.delModal.show();
    }

    closeDelModal() {
        console.log('delete', this.reportId);
        this._reportService.deleteReportById(this.reportId);
        this.getReportsByPageNum(this.pageNumber);
        this.delModal.hide();
    }

    ngOnInit(): any {
        this.getReportsByPageNum(this.pageNumber);
    }

    getReportsByPageNum(pageNumber: number) {
        this.pageNumber = +pageNumber;
        return this._reportService.getAllReports(this.pageNumber)
            .subscribe((data) => {
                    this.pageCreator = data;
                    this.reports = data.rows;
                    this.preparePageList(+this.pageCreator.beginPage,
                        +this.pageCreator.endPage);
                    this.totalPages = +data.totalPages;
                    this.dates = data.dates;
                },
                (error) => {
                    console.error(error)
                });
    };


    sanitizeUrlData(reports: Report[]): Report[] {
        let safeUrlReports = [];

        for (var report of reports) {
            report.filePath = this.sanitizer.bypassSecurityTrustUrl(report.filePath).toString();
            safeUrlReports.push(report);
        }

        return safeUrlReports;
    }


    prevPage() {
        this.pageNumber = this.pageNumber - 1;
        this.getReportsByPageNum(this.pageNumber)
    }

    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.getReportsByPageNum(this.pageNumber)
    }

    emptyArray() {
        while (this.pageList.length) {
            this.pageList.pop();
        }
    }

    preparePageList(start: number, end: number) {
        this.emptyArray();
        for (let i = start; i <= end; i++) {
            this.pageList.push(i);
        }
    }


    sortBy(name: string) {
        console.log('sorted by ', name);
        this.order = !this.order;
        console.log('order by asc', this.order);
        this._reportService.getAllReportsSorted(this.pageNumber, name, this.order)
            .subscribe((data) => {
                    this.pageCreator = data;
                    this.reports = data.rows;
                    this.preparePageList(+this.pageCreator.beginPage,
                        +this.pageCreator.endPage);
                    this.totalPages = +data.totalPages;
                },
                (error) => {
                    console.error(error)
                });
    }


    ngOnDestroy(): any {
        //this.subscriber.unsubscribe();
    }

    private getDistinctDates(): string[] {
        let distinctDates = [];
        for (let report of this.reports) {
            if (distinctDates.indexOf(report.creationDate) < 0)
                distinctDates.push(report.creationDate);
        }
        return distinctDates;

    }


    refreshDateFrom(value: any) {
        console.log('date from', value);
        this.dateFrom = value.text;
        this.dateFromActive = true;
    }

    selectedDateFrom(value: any) {
        console.log('selected date from', value);
    }

    refreshDateTo(value: any) {
        console.log('date to', value);
        this.dateTo = value.text;
        this.dateToActive = true;
    }

    selectedDateTo(value: any) {
        console.log('selected date to', value);
    }

    onClickSearchByDates() {
        this._reportService.searchByDates(this.dateFrom, this.dateTo)
            .subscribe((data)=> {
                    this.reports = data;
                    this.preparePageList(this.pageNumber, this.pageNumber);
                },
                (error)=> {
                    console.log(error)
                })
    }

    onClickSearchByParam(value: string) {
        if (value.trim().length) {
            console.log('search by ', value);
            this._reportService.searchByInputParam(value)
                .subscribe((data)=> {
                        this.reports = data;
                        this.preparePageList(this.pageNumber, this.pageNumber);
                    },
                    (error)=> {
                        console.error(error)
                    });
        }
    }
}