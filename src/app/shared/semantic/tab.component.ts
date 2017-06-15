import { Component, HostBinding, Input } from "@angular/core";

import "semantic-ui/semantic";

@Component( {
	selector: "sui-tab",
	template: `<ng-content></ng-content>`,
	styles: [ ":host { display:block; } " ],
	host: {
		class: "ui bottom attached tab segment"
	}
} )
export class TabComponent {
	@HostBinding( "class.active" ) active:boolean = false;
	@Input( "title" ) title:string = "";
}