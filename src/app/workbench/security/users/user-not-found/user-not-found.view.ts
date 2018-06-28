import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";


@Component( {
	selector: "cw-user-not-found",
	templateUrl: "./user-not-found.view.html",
	styleUrls: [ "./user-not-found.view.scss" ],
} )
export class UserNotFoundView implements OnInit {
	public timer:number;
	private router:Router;

	constructor( router:Router, private location:Location ) {
		this.router = router;
	}

	// TODO: Change the use of location to the righ way of navigate with an activatedRoute, check if this 'bug' has been resolved on further angular versions
	ngOnInit():void {
		this.timer = 5;
		let countDown:any = setInterval( ():boolean => {
			this.timer --;
			if( this.timer === 0 ) {
				let url:string = this.location.path(),
					lastSlashIdx:number = url.lastIndexOf( "/" ),
					finalURL:string = url.substr( 0, lastSlashIdx );
				this.router.navigate( [ finalURL ] );
				clearInterval( countDown );
				return false;
			}
		}, 1000 );
	}
}