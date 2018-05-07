import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";


// Components
import { MessageComponent } from "./messages-area/message.component";
import { MessagesAreaComponent } from "./messages-area/messages-area.component";
import { ErrorLabelComponent } from "./messages-area/error/error-label.component";
import { PaginatorComponent } from "./paginator/paginator.component";
import * as CodeMirrorComponent from "./code-mirror/code-mirror.component";

// Pipes
import { URIToSlugPipe } from "./pipes/uri-to-slug.pipe";

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
		CodeMirrorComponent.Class,
		ErrorLabelComponent,
		PaginatorComponent,
		URIToSlugPipe,
	],
	providers: [],
	exports: [
		MessageComponent,
		MessagesAreaComponent,
		CodeMirrorComponent.Class,
		ErrorLabelComponent,
		PaginatorComponent,

		URIToSlugPipe,

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