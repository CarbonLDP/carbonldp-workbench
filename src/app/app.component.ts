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
			currentRoute:ActivatedRoute = this.route.root;

		do {
			if( ! ! currentRoute.snapshot && (typeof currentRoute.snapshot.data[ "title" ] !== "undefined" || typeof currentRoute.snapshot.data[ "displayName" ] !== "undefined" ) )
				activatedRoutes.push( currentRoute.snapshot );
			currentRoute = currentRoute.children[ 0 ];
		} while( currentRoute );


		activatedRoutes.forEach( ( snapshot:ActivatedRouteSnapshot, idx:number ) => {
			if( idx === 0 ) return;
			if( activatedRoutes.length === 2 && idx === 1 && ! snapshot.data[ "title" ] ) return;
			if( idx !== (activatedRoutes.length - 1) && typeof snapshot.data[ "title" ] === "undefined" ) return;
			title += this.getTitle( snapshot );
			if( idx < activatedRoutes.length - 1 ) title += " > ";
		} );
		title = title + (activatedRoutes.length > 2 ? " | " : "") + this.getTitle( activatedRoutes[ 0 ] );
		this.title.setTitle( title );
	}

	private getTitle( snapShot:ActivatedRouteSnapshot ):string {
		let title:string = "";
		if( typeof snapShot.data[ "param" ] !== "undefined" ) {
			title += snapShot.data[ "displayName" ] + " (" + snapShot.params[ snapShot.data[ "param" ] ] + " )";
		} else if( typeof snapShot.data[ "title" ] === "string" ) {
			title += snapShot.data[ "title" ]
		} else title += snapShot.data[ "displayName" ];
		return title;
	}

}

export default AppComponent;
