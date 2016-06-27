import {Component} from "@angular/core";

import {NotAuthenticated} from "angular2-carbonldp/decorators";

import { LoginComponent } from "carbon-panel/login.component";

import template from "./login.view.html!";
import style from "./login.view.css!text";

@NotAuthenticated( {redirectTo: [ "/Workbench" ]} )
@Component( {
	selector: "div.ng-view",
	template: template,
	styles: [ style ],
	directives: [ LoginComponent ]
} )
export class LoginView {

}

export default LoginView;
