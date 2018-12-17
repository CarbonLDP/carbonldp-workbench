import { Component, ElementRef } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";


import { SidebarService } from "./sidebar.service"


/*
*   Sidebar of the Workbench listing all the sidebar items
* */
@Component( {
	selector: "app-sidebar",
	templateUrl: "./sidebar.component.html",
	styleUrls: [ "./sidebar.component.scss" ],
	host: {
		class: "ui inverted vertical labeled icon menu accordion"
	}
} )
export class SidebarComponent {
	private element:ElementRef;
	private $element:JQuery;
	private router:Router;
	private location:Location;
	public sidebarService:SidebarService;

	constructor( router:Router, element:ElementRef, location:Location, sidebarService:SidebarService ) {
		this.element = element;
		this.router = router;
		this.location = location;
		this.sidebarService = sidebarService;
		this.sidebarService.toggledEmitter.emit( true );
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.refreshAccordion();
	}

	refreshAccordion():void {
		this.$element.accordion( {
			selector: {
				trigger: ".item.app, .item.app .title",
				title: ".title",
			},
			exclusive: false
		} );
	}
}

