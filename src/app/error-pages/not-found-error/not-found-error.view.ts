import { Component } from "@angular/core";
import { ROUTER_DIRECTIVES } from "@angular/router-deprecated";

import template from "./not-found-error.view.html!";
import style from "./not-found-error.view.css!text";

@Component( {
	selector: "dashboard",
	template: template,
	styles: [ style ],
	directives: [ ROUTER_DIRECTIVES ],
} )
export class NotFoundErrorView {

	constructor() { }
}

export default NotFoundErrorView;
