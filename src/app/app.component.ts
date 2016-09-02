import { Component, ViewEncapsulation } from "@angular/core";
import { Router, Event, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { Title } from "@angular/platform-browser";

import template from "./app.component.html!";
import style from "./app.component.css!text";

@Component( {
	selector: "app",
	template: template,
	styles: [ style ],
	encapsulation: ViewEncapsulation.None,
} )
export class AppComponent {
	router:Router;
	title:Title;
	route:ActivatedRoute;

	constructor( title:Title, router:Router, route:ActivatedRoute ) {
		this.router = router;
		this.title = title;
		this.route = route;

		this.router.events.subscribe( ( event:Event ) => {
			if( event instanceof NavigationEnd ) {
				this.defineTitle();
			}
		} );
	}

	private defineTitle() {
		let title:string = "",
			activatedRoutes:ActivatedRouteSnapshot[] = [],
			currentRoute:ActivatedRoute = this.route.root;

		do {
			if( ! ! currentRoute.snapshot && ! ! currentRoute.snapshot.data[ "title" ] )
				activatedRoutes.push( currentRoute.snapshot );
			currentRoute = currentRoute.children[ 0 ];
		} while( currentRoute );

		console.log( activatedRoutes );
		activatedRoutes.forEach( ( snapshot:ActivatedRouteSnapshot, idx:number )=> {
			if( idx === 0 ) return;
			title += this.getTitle( snapshot );
			if( idx < activatedRoutes.length - 1 ) title += " > ";
		} );
		title = title + (activatedRoutes.length > 1 ? " | " : "") + this.getTitle( activatedRoutes[ 0 ] );
		console.log( title );
		this.title.setTitle( title );
	}

	private getTitle( snapShot:ActivatedRouteSnapshot ):string {
		let title:string = "";
		if( typeof snapShot.data[ "param" ] !== "undefined" ) {
			title += snapShot.data[ "displayName" ] + " (" + snapShot.params[ snapShot.data[ "param" ] ] + " )";
		} else if( typeof snapShot.data[ "title" ] === "string" ) {
			title += snapShot.data[ "title" ]
		} else if( typeof snapShot.data[ "title" ] === "boolean" && ! ! snapShot.data[ "title" ] ) {
			title += snapShot.data[ "displayName" ]
		}
		return title;
	}

}

export default AppComponent;
