import { Component } from "@angular/core";

import { SimpleComponent } from "carbon-panel/simple.component";

import template from "./app.component.html!";

@Component( {
	selector: "app",
	template: template,
	directives: [ SimpleComponent ]
} )
export class AppComponent {

}

export default AppComponent;
