import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";

import { CarbonLDP } from "carbonldp";
import { carbonldpProvider } from "app/providers";


@Component( {
	selector: "div.cw-error-view",
	templateUrl: "./error.view.html",
	styleUrls: [ "./error.view.scss" ],
} )
export class ErrorView implements OnInit, AfterViewInit {
	error:any;
	errorType:string;
	carbonldp:CarbonLDP;
	sslEnabled:boolean = false;

	constructor( private router:Router, carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
		this.sslEnabled = this.carbonldp.baseURI.indexOf( "https" ) !== - 1;
	}

	ngOnInit():void {
		carbonldpProvider.promise.then( () => {
			// The active context was successfully loaded, the user must have landed here by visiting the direct URL
			// Let's redirect him to the home page
			this.router.navigate( [ "/" ] );
		} );
	}

	ngAfterViewInit():void {
		carbonldpProvider.promise.catch( ( error ) => {
			this.error = error;
			this.errorType = "requestID" in this.error ? this.error.name : null;

			if( this.errorType === null ) console.error( this.error );
		} );
	}
}
