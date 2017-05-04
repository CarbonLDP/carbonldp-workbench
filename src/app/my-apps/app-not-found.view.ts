import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component( {
	selector: "cw-app-content",
	templateUrl: "./app-not-found.view.html",
	styleUrls: [ "./app-not-found.view.scss" ],
} )
export class AppNotFoundView implements OnInit {
	private router:Router;
	public timer:number;

	constructor( router:Router ) {
		this.router = router;
	}

	ngOnInit():void {
		this.timer = 5;
		let countDown:any = setInterval( ():boolean => {
			this.timer --;
			if( this.timer === 0 ) {
				this.router.navigate( [ "/my-apps" ] );
				clearInterval( countDown );
				return false;
			}
		}, 1000 );
	}
}