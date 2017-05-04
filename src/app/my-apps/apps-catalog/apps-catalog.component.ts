import { Component, ElementRef, Input, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Rx";

import { Class as Carbon } from "carbonldp/Carbon";
import * as CarbonApp from "carbonldp/App";
import * as HTTP from "carbonldp/HTTP";

import { MyAppsSidebarService } from "./../my-apps-sidebar.service";

import * as App from "./../app-content/app";

import { Message } from "app/shared/messages-area/message.component";
import { AppContextService } from "./../app-context.service";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-apps-catalog",
	templateUrl: "./apps-catalog.component.html",
	styles: [ ":host { display: block; }" ],
} )
export class AppsCatalogComponent implements OnInit {
	@Input() apps:App.Class[] = [];
	results:App.Class[] = [];

	loading:boolean = false;
	tileView:boolean = false;
	searchBox:JQuery;
	errorMessage:string = "";
	warningMessage:string = "";
	askingApp:App.Class;

	deleteAppConfirmationModal:JQuery;
	deleting:boolean = false;
	deleteError:Message;

	private element:ElementRef;
	private $element:JQuery;
	private router:Router;
	private route:ActivatedRoute;
	private carbon:Carbon;
	private appContextService:AppContextService;
	private myAppsSidebarService:MyAppsSidebarService;

	constructor( element:ElementRef, router:Router, route:ActivatedRoute, appContextService:AppContextService, carbon:Carbon, myAppsSidebarService:MyAppsSidebarService ) {
		this.element = element;
		this.appContextService = appContextService;
		this.router = router;
		this.route = route;
		this.carbon = carbon;
		this.myAppsSidebarService = myAppsSidebarService;
	}

	ngOnInit():void {
		this.$element = $( this.element.nativeElement );
		this.deleteAppConfirmationModal = this.$element.find( ".delete-app-confirmation.modal" );
		this.searchBox = this.$element.find( "input.search" );
		let terms:any = Observable.fromEvent( this.searchBox, "input" );
		terms
			.debounceTime( 200 )
			.map( ( evt ) => {
				return evt.target.value;
			} )
			.distinctUntilChanged()
			.subscribe(
				( args ):void => {
					this.searchApp( args );
				}
			);
		this.fetchApps();
		this.initializeModal();
		this.myAppsSidebarService.init();
	}

	activateGridView():void {
		this.tileView = true;
	}

	activateListView():void {
		this.tileView = false;
	}

	searchApp( term:string ):void {
		this.results = this.apps.filter( ( app ) => {
			return app.name.toLowerCase().search( term.toLowerCase() ) > - 1 || app.slug.toLowerCase().search( term.toLowerCase() ) > - 1
		} );
		this.errorMessage = "";
		if( this.results.length === 0 && term.length > 0 ) {
			this.errorMessage = "No apps found.";
		}
	}

	askConfirmationToDeleteApp( selectedApp:App.Class ):void {
		this.askingApp = selectedApp;
		this.toggleDeleteConfirmationModal();
	}

	toggleDeleteConfirmationModal():void {
		this.deleteAppConfirmationModal.modal( "toggle" );
		this.deleteError = null;
	}

	onApproveAppDeletion( approvedApp:App.Class ):void {
		if( this.deleting ) return;
		this.deleting = true;
		this.deleteError = null;
		this.deleteApp( approvedApp ).then( ( response:HTTP.Response.Class ):void => {
			this.toggleDeleteConfirmationModal();
			this.apps.splice( this.apps.indexOf( approvedApp ), 1 );
			this.loadApps();
		} ).catch( ( error:HTTP.Errors.Error ):void => {
			this.deleteError = this.getErrorMessage( error );
		} ).then( ():void => {
			this.deleting = false;
			this.searchApp( this.searchBox.val() );
		} );
	}

	openApp( app:App.Class ):void {
		this.myAppsSidebarService.addApp( app );
		this.myAppsSidebarService.openApp( app );
		this.router.navigate( [ app.slug ], { relativeTo: this.route } );
	}

	deleteApp( app:App.Class ):Promise<HTTP.Response.Class> {
		return app.delete();
	}

	getErrorMessage( error:HTTP.Errors.Error ):Message {
		let content:string = "";
		switch( true ) {
			case error instanceof HTTP.Errors.ForbiddenError:
				content = "Denied Access.";
				break;
			case error instanceof HTTP.Errors.UnauthorizedError:
				content = "No access to the requested resource(s).";
				break;
			case error instanceof HTTP.Errors.BadGatewayError:
				content = "An error occurred while trying to fetch apps. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.GatewayTimeoutError:
				content = "An error occurred while trying to fetch apps. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.InternalServerErrorError:
				content = "An error occurred while trying to fetch apps. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.UnknownError:
				content = "An error occurred while trying to fetch apps. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.ServiceUnavailableError:
				content = "Service currently unavailable.";
				break;
			default:
				content = "There was a problem processing the request. Error: " + error.response.status;
				break;
		}

		return {
			title: error.name,
			content: ! ! error.message ? error.message : content,
			statusCode: "" + error.response.status,
			statusMessage: (<XMLHttpRequest>error.response.request).statusText,
			endpoint: "",
		};
	}

	closeErrorMessage( evt:any ):void {
		$( evt.srcElement ).closest( ".ui.message" ).transition( "fade" );
		this.deleteError = null;
	}

	initializeModal():void {
		this.deleteAppConfirmationModal.modal( {
			closable: false,
			blurring: true,
			onApprove: ():boolean => { return false; },
		} );
	}

	refreshApps():void {
		this.fetchApps();
	}

	fetchApps():void {
		this.loading = true;
		this.loadApps().then( ( apps:App.Class[] ):void => {
			this.results = apps;
			this.loading = false;
			if( this.apps.length === 0 ) this.warningMessage = "There are currently no apps to show."
		} ).catch( ( error:any ):void => {
			this.errorMessage = this.getErrorMessage( error ).content;
			this.loading = false;
		} );
	}

	private loadApps():Promise< App.Class[] > {
		return this.appContextService.getAll().then( ( appContexts:CarbonApp.Context[] ) => {
			this.apps = appContexts.map( App.Factory.createFrom );
			return this.apps;
		} );
	}
}

