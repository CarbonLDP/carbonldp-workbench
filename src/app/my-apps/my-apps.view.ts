import { Component } from "@angular/core";

@Component( {
	selector: "cw-my-apps",
	template: `<router-outlet></router-outlet>`,
	styles: [ ":host { display: block; }" ],
} )

export class MyAppsView {
}

