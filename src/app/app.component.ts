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
	route:ActivatedRoute

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

	defineTitle() {
		let title:string = "",
			activatedRoutes:ActivatedRouteSnapshot[] = [],
			currentRoute:ActivatedRoute = this.route.root;

		do {
			if( ! ! currentRoute.snapshot && ! ! currentRoute.snapshot.data[ "title" ] )
				activatedRoutes.push( currentRoute.snapshot );
			currentRoute = currentRoute.children[ 0 ];
		} while( currentRoute );

		activatedRoutes.forEach( ( snapshot:ActivatedRouteSnapshot, idx:number )=> {
			if( typeof snapshot.data[ "title" ] === "undefined" ) return;
			title += snapshot.data[ "param" ] ? snapshot.params[ snapshot.data[ "param" ] ] : snapshot.data[ "title" ];
			if( idx === 0 && activatedRoutes.length > 1 )  title += " | ";
			else if( idx < activatedRoutes.length - 1 ) title += " > "
		} );
		this.title.setTitle( title );
	}

}

export default AppComponent;
