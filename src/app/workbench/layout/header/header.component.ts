import { Component, ElementRef, AfterContentInit } from "@angular/core";

import { HeaderService } from "./header.service";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-header",
	templateUrl: "./header.component.html",
	styleUrls: [ "./header.component.scss" ],
	host: {
		class: "ui navigation inverted menu"
	}
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
		this.createCollapsableMenus();
	}

	createCollapsableMenus():void {
		let verticalMenu:JQuery = this.$element.find( ".ui.vertical.menu" );
		this.$element.find( ".item.open" ).on( "click", function( e ) {
			e.preventDefault();
			verticalMenu.toggle();
		} );
		verticalMenu.toggle();
	}
}

