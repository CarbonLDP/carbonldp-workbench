import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from "@angular/core";

@Component( {
	selector: "cw-paginator",
	templateUrl: "./paginator.component.html",
	styles: [ ":host{ display:block; }" ],
} )

export class PaginatorComponent implements OnChanges {

	public pages:number[] = [];

	private _activePage:number = 0;
	@Input() set activePage( value:number ) {
		this._activePage = value;
		this.onPageChange.emit( this.activePage );
	};

	get activePage():number {
		return this._activePage;
	}

	@Input() elementsPerPage:number = 5;
	@Input() totalElements:number = 0;

	@Output() onPageChange:EventEmitter<number> = new EventEmitter<number>();


	constructor() {}

	ngOnChanges( changes:{ [propName:string]:SimpleChange } ):void {
		if( ( ! ! changes[ "totalElements" ] && changes[ "totalElements" ].currentValue !== changes[ "totalElements" ].previousValue ) ||
			( ! ! changes[ "elementsPerPage" ] && changes[ "elementsPerPage" ].currentValue !== changes[ "elementsPerPage" ].previousValue ) ) {
			this.updatePages();
		}
	}

	private pageClick( index:number ):void {
		this.activePage = index;
	}

	private previous():void {
		this.activePage > 0 ? this.activePage -- : this.activePage;
	}

	private next():void {
		this.activePage + 1 < this.pages.length ? this.activePage ++ : this.activePage;
	}

	private updatePages():void {
		this.pages = this.getPages();
		if( this.activePage >= this.pages.length && this.pages.length > 0 ) {
			this.activePage = this.pages[ this.pages.length - 1 ];
		}
	}

	private getPages():number[] {
		let pages:number[] = [];
		let totalPages = this.totalElements === 0 ? 0 : Math.ceil( this.totalElements / this.elementsPerPage );
		for( let i = 0; i < totalPages; i ++ ) {
			pages.push( i );
		}
		return pages;
	}
}

