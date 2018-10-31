import { AfterViewInit, Component, ElementRef, Input } from "@angular/core";

import { RouterService } from "app/common/router.service";
import { HeaderItem } from "./header.service";


/*
*   Item to be displayed int the header of the Workbench
* */
@Component( {
	selector: "app-header-item",
	templateUrl: "./header-item.component.html",
	styleUrls: [ "./header-item.component.scss" ],
} )
export class HeaderItemComponent implements AfterViewInit {
	@Input( "item" ) item:HeaderItem;

	private element:ElementRef;
	private $element:JQuery;
	private routerService:RouterService;

	constructor( element:ElementRef, routerService:RouterService ) {
		this.element = element;
		this.routerService = routerService;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.createDropdownMenus();
	}

	createDropdownMenus():void {
		if( ! this.item.children ) return;
		this.$element.find( ".ui.dropdown" ).dropdown( {
			on: "hover",
		} );
	}
}

