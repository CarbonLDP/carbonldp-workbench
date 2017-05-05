import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { MyAppsSidebarService } from "./../my-apps-sidebar.service";
import { AppContentService } from "./app-content.service";
import * as App from "./app";

@Component( {
	selector: "cw-app-content",
	templateUrl: "./app-content.view.html",
	styleUrls: [  "./app-content.view.scss"  ],
} )
export class AppContentView {

	public app:App.Class;

	private router:Router;
	private activatedRoute:ActivatedRoute;
	private appContentService:AppContentService;
	private myAppsSidebarService:MyAppsSidebarService;


	constructor( router:Router, route:ActivatedRoute, myAppsSidebarService:MyAppsSidebarService, appContentService:AppContentService ) {
		this.router = router;
		this.activatedRoute = route;
		this.myAppsSidebarService = myAppsSidebarService;
		this.appContentService = appContentService;
	}

	ngOnInit() {
		this.activatedRoute.data.forEach( ( data:{ app:App.Class } ) => {
			this.app = data.app;
			this.appContentService.activeApp = this.app;
			this.myAppsSidebarService.addApp( this.app );
			this.myAppsSidebarService.openApp( this.app );
		} );
	}
}

