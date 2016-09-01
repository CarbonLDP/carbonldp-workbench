import { Component } from "@angular/core";

import template from "./not-found-error.view.html!";
import style from "./not-found-error.view.css!text";

@Component( {
	selector: "dashboard",
	template: template,
	styles: [ style ],
} )
export class NotFoundErrorView {

	constructor() { }
}

export default NotFoundErrorView;
