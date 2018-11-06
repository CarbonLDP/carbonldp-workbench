import { Component } from "@angular/core";

/**
 * Header of the workbench listing all the items
 */
@Component( {
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrls: [ "./header.component.scss" ],
	host: {
		class: "ui navigation inverted menu"
	},
	providers: [
		{ provide: "block", useValue: "app-header" }
	]
} )
export class HeaderComponent {
}

