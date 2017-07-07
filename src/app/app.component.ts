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
			currentRoute:ActivatedRouteSnapshot = this.route.snapshot.children[ 0 ];

		do {
			if( ! ! currentRoute
				&& (typeof currentRoute.data[ "title" ] !== "undefined") )
				activatedRoutes.push( currentRoute );
			currentRoute = currentRoute.children[ 0 ];
		} while( currentRoute );


		activatedRoutes.forEach( ( snapshot:ActivatedRouteSnapshot, idx:number ) => {
			if( idx === 0 ) return;
			let titleAux = this.getTitle(snapshot);
			if( activatedRoutes.length > 2 && idx !== activatedRoutes.length - 1 ) {
				title += " > " + titleAux;
				return;
			}
			if( titleAux === "Workbench") return;
			title += titleAux;
			console.log( title );
		} );
		title = title + ((title !== "") ? " | " : "") + this.getTitle( activatedRoutes[ 0 ] );

		this.title.setTitle( title );
	}

	private getTitle( snapShot:ActivatedRouteSnapshot ):string {
		let title:string = "";
		if( typeof snapShot.data[ "title" ] === "string" ) {
			title += snapShot.data[ "title" ]
		}
		return title;
	}

}
