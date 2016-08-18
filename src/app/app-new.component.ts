import { Component, ViewEncapsulation } from "@angular/core";

@Component( {
	selector: "app",
	template: `<router-outlet></router-outlet>`,
	encapsulation: ViewEncapsulation.None,
	directives: []
} )
export class AppComponent {
	constructor() {}
}

export default AppComponent;