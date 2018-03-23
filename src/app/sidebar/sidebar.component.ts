import { Component, ElementRef } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";

import * as $ from "jquery";
import "semantic-ui/semantic";

import { SidebarService } from "./sidebar.service"

@Component( {
	selector: "cw-sidebar",
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
		this.sidebarService.toggleEmitter.subscribe( ( event:any ) => {
			this.toggle();
		} );
		this.sidebarService.toggledEmitter.emit( true );
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.refreshAccordion();
	}

	toggle():void {
		if( this.$element.is( ":visible" ) ) {
			this.$element.animate( {
				"width": "0",
				"opacity": 0.25,
			}, {
				duration: 400,
				specialEasing: {
					width: "linear",
					height: "easeOutBounce"
				},
				complete: () => {
					this.$element.hide();
					this.sidebarService.toggledEmitter.emit( false );
				}
			} );
		} else {
			this.$element.show();
			this.$element.animate( {
				"width": "182px",
				"opacity": 1,
			}, 400 );
			this.sidebarService.toggledEmitter.emit( true );
		}
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

