import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";

import { Class as Carbon } from "carbonldp/Carbon";
import { activeContext } from "angular-carbonldp/boot";


@Component( {
	selector: "div.cw-error-view",
	templateUrl: "./error.view.html",
	styleUrls: [ "./error.view.scss" ],
} )
export class ErrorView implements OnInit, AfterViewInit {
	error:any;
	errorType:string;
	carbon:Carbon;

	constructor( private router:Router, carbon:Carbon ) {
		this.carbon = carbon;
	}

	ngOnInit():void {
		activeContext.promise.then( () => {
			// The active context was successfully loaded, the user must have landed here by visiting the direct URL
			// Let's redirect him to the home page
			this.router.navigate( [ "/" ] );
		} );
	}

	ngAfterViewInit():void {
		activeContext.promise.catch( ( error ) => {
			this.error = error;
			this.errorType = "requestID" in this.error ? this.error.name : null;

			if( this.errorType === null ) console.error( this.error );
		} );
	}
}
