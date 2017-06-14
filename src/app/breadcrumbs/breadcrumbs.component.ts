import { Component } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";

import { RouterService } from "app/router.service";
import { SidebarService } from "app/sidebar/sidebar.service";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-breadcrumbs",
	templateUrl: "./breadcrumbs.component.html",
	styleUrls: [ "./breadcrumbs.component.scss" ],
} )
export class BreadcrumbsComponent {
	breadCrumbs:Array<any> = [];

	private router:Router;
	private routerService:RouterService;
	sidebarService:SidebarService;
	private route:ActivatedRoute;
	base:string;

	constructor( router:Router, routerService:RouterService, sidebarService:SidebarService, route:ActivatedRoute ) {
		this.route = route;
		this.router = router;
		this.routerService = routerService;
		this.sidebarService = sidebarService;
		this.base = this.sidebarService.base;
	}

	ngOnInit():void {
		this.router.events.subscribe( ( event ) => {
			if( ! (event instanceof NavigationEnd ) ) return;
			this.breadCrumbs = [];
			let url:string = "",
				currentRoute = this.route.root;
			do {
				let childrenRoutes = currentRoute.children;
				currentRoute = null;
				childrenRoutes.forEach( ( route:ActivatedRoute ) => {
					if( route.outlet !== "primary" ) return;
					if( route.snapshot === void 0 ) return;
					let routeSnapshot:ActivatedRouteSnapshot = route.snapshot;
					url += this.getURL( routeSnapshot );
					if( ! ! routeSnapshot.data[ "displayName" ] && ! routeSnapshot.data[ "hide" ] ) {
						this.breadCrumbs.push( {
							url: url,
							displayName: routeSnapshot.data[ "displayName" ],
						} );
					}
					currentRoute = route;
				} )
			} while( currentRoute );
		} )
	}

	private getURL( routeSnapshot:ActivatedRouteSnapshot ):string {
		let url:string = "";
		if( routeSnapshot.data[ "param" ] )
			url += "/" + routeSnapshot.params[ routeSnapshot.data[ "param" ] ];
		else if( routeSnapshot.data[ "alias" ] )
			url += "/" + routeSnapshot.data[ "alias" ];
		return url;
	}

	toggleSidebar():void {
		this.sidebarService.toggle();
	}
}

