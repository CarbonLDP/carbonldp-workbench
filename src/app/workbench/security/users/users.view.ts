import { Component } from "@angular/core";

@Component( {
	selector: "cw-users-view",
	template: "<router-outlet></router-outlet>",
	styles: [ ":host { display: block; }" ]
} )
export class UsersView {

	constructor() {}

}

