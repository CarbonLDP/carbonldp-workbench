import { Component, ViewEncapsulation } from "@angular/core";
import { Router, Event, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { Title } from "@angular/platform-browser";


@Component( {
	selector: "app",
	templateUrl: "./app.component.html",
	styleUrls: [ "./app.component.scss" ],
	encapsulation: ViewEncapsulation.None,
} )
export class AppComponent {
	router:Router;
	title:Title;
	route:ActivatedRoute;
	pathFromRoot;

	constructor( title:Title, router:Router, route:ActivatedRoute ) {
		this.router = router;
		this.title = title;
		this.route = route;
		this.pathFromRoot =this.route.pathFromRoot

		this.router.events.subscribe( ( event:Event ) => {
			if( event instanceof NavigationEnd ) {
				this.defineTitle();
			}
		} );
	}

	private defineTitle() {
		let title:string = "",
			activatedRoutes:ActivatedRouteSnapshot[] = [],
			currentRoute:ActivatedRouteSnapshot = this.route.snapshot.children[0];

		do {
			if( ! ! currentRoute
				&& (typeof currentRoute.data[ "title" ] !== "undefined" || typeof currentRoute.data[ "displayName" ] !== "undefined" )
				&& (typeof currentRoute.data[ "hide"] === "undefined" || ! currentRoute.data["hide"] )
				&& !( currentRoute.data[ "displayName" ] === "Dashboard"))
				activatedRoutes.push( currentRoute );
			currentRoute = currentRoute.children[ 0 ];
		} while( currentRoute );


		activatedRoutes.forEach( ( snapshot:ActivatedRouteSnapshot, idx:number ) => {
			console.log(idx, snapshot)
			if( idx === 0 ) return;
			title = this.getTitle( snapshot ) + title;
			title = ((activatedRoutes.length > 2 && idx === 1) ? " | ":"")+title;

		} );

		console.log(title);
		this.title.setTitle( title );
	}

	private getTitle( snapShot:ActivatedRouteSnapshot ):string {
		let title:string = "";
		if( typeof snapShot.data[ "title" ] === "string" ) {
			title += snapShot.data[ "title" ]
		} else title += snapShot.data[ "displayName" ];
		return title;
	}

}
