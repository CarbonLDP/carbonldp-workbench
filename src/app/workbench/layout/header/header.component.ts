import { AfterContentInit, Component, ElementRef } from "@angular/core";

import { HeaderService } from "./header.service";


/*
*   Header of the workbench listing all the items
* */
@Component( {
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrls: [ "./header.component.scss" ],
	host: {
		class: "ui navigation inverted menu"
	},
} )
export class HeaderComponent implements AfterContentInit {
	private element:ElementRef;
	private $element:JQuery;
	public headerService:HeaderService;

	constructor( element:ElementRef, headerService:HeaderService ) {
		this.element = element;
		this.headerService = headerService;
	}

	ngAfterContentInit():void {
		this.$element = $( this.element.nativeElement );
		this.createCollapsibleMenus();
	}

	createCollapsibleMenus():void {
		let verticalMenu:JQuery = this.$element.find( ".ui.vertical.menu" );
		this.$element.find( ".item.open" ).on( "click", function( e ) {
			e.preventDefault();
			verticalMenu.toggle();
		} );
		verticalMenu.toggle();
	}
}

