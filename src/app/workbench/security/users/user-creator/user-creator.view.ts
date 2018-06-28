import { Component } from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";

import { PersistedUser } from "carbonldp/Auth";

import { Modes } from "../user-details/user-details.component";

@Component( {
	selector: "cw-user-creator-view",
	templateUrl: "./user-creator.view.html",
	styles: [ ":host { display: block; }" ]
} )
export class UserCreatorView {

	private router:Router;
	private activatedRoute:ActivatedRoute;

	private user:PersistedUser.Class;
	
	public Modes:typeof Modes = Modes;
	public canDisplay:boolean = true;

	constructor( router:Router, route:ActivatedRoute, private location:Location ) {
		this.router = router;
		this.activatedRoute = route;
	}

	// TODO: Change the use of location to the righ way of navigate with an activatedRoute, check if this 'bug' has been resolved on further angular versions
	goToUsers():void {
		let url:string = this.location.path(),
			lastSlashIdx:number = url.lastIndexOf( "/" ),
			finalURL:string = url.substr( 0, lastSlashIdx );
		this.router.navigate( [ finalURL ] );
	}

}

