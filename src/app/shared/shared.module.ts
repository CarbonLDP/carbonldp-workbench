import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";


// Components
import { MessageComponent } from "./messages-area/message.component";
import { MessagesAreaComponent } from "./messages-area/messages-area.component";
import { ErrorLabelComponent } from "./messages-area/error/error-label.component";


// Modules
import { DirectivesModule } from "./directives/directives.module";
import { SemanticModule } from "./semantic/semantic.module";

// Services
import { MessagesAreaService } from "./messages-area/messages-area.service";

@NgModule( {
	imports: [
		CommonModule,
	],
	declarations: [
		MessageComponent,
		MessagesAreaComponent,
		ErrorLabelComponent
	],
	providers: [],
	exports: [
		MessageComponent,
		MessagesAreaComponent,
		ErrorLabelComponent,

		DirectivesModule,
		SemanticModule
	]
} )

export class SharedModule {

	static forRoot():ModuleWithProviders {
		return {
			ngModule: SharedModule,
			providers: [ MessagesAreaService ]
		};
	}

}