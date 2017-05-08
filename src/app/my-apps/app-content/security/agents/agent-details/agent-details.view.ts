import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { PersistedAgent } from "carbonldp/Auth";

import { AppContentService } from "app/my-apps/app-content/app-content.service";
import { Modes } from "./agent-details.component";

@Component( {
	selector: "cw-agent-details-view",
	templateUrl: "./agent-details.view.html",
	styles: [ ":host { display: block; }" ]
} )
export class AgentDetailsView {

	private router:Router;
	private activatedRoute:ActivatedRoute;

	private app:any;
	private agent:PersistedAgent.Class;
	private mode:string = Modes.READ;
	
	public canDisplay:boolean = true;

	constructor( router:Router, route:ActivatedRoute, appContentService:AppContentService ) {
		this.router = router;
		this.activatedRoute = route;

		this.app = appContentService.activeApp;
		appContentService.onAppHasChanged.subscribe( ( app:any ) => {
			this.app = app;
			this.canDisplay = false;
			setTimeout( () => { this.canDisplay = true;}, 0 );
		} );
	}

	ngOnInit() {
		this.activatedRoute.data.forEach( ( data:{ agent:PersistedAgent.Class } ) => {
			this.agent = data.agent;
		} );
		this.activatedRoute.queryParams.subscribe( ( params ) => {
			this.mode = params[ "mode" ] ? params[ "mode" ] : Modes.READ;
		} );
	}

	private goToAgent():void {
		this.router.navigate( [ "../" ] )
	}

}

