import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";


// Components
import { MessageComponent } from "./messages-area/message.component";
import { MessagesAreaComponent } from "./messages-area/messages-area.component";
import { ErrorLabelComponent } from "./messages-area/error/error-label.component";
import { PaginatorComponent } from "./paginator/paginator.component";
import { VersionsPresenterComponent } from "./versions-presenter/versions-presenter.component";
import * as CodeMirrorComponent from "./code-mirror/code-mirror.component";
import { CodeMirrorErrorAreaComponent } from "./code-mirror/code-mirror-error-area.component";

// Pipes

// Modules
import { PipesModule } from "./pipes/pipes.module";
import { DirectivesModule } from "./directives/directives.module";
import { SemanticModule } from "./semantic/semantic.module";

// Services
import { RouterService } from "./router.service";
import { MessagesAreaService } from "./messages-area/messages-area.service";
import { CodeMirrorErrorAreaService } from "./code-mirror/code-mirror-error-area.service";

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
		VersionsPresenterComponent,
		CodeMirrorErrorAreaComponent
	],
	providers: [ CodeMirrorErrorAreaService ],
	exports: [
		MessageComponent,
		MessagesAreaComponent,
		CodeMirrorComponent.Class,
		ErrorLabelComponent,
		PaginatorComponent,
		VersionsPresenterComponent,
		CodeMirrorErrorAreaComponent,
		
		PipesModule,
		DirectivesModule,
		SemanticModule
	]
} )

export class SharedModule {

	static forRoot():ModuleWithProviders {
		return {
			ngModule: SharedModule,
			providers: [ MessagesAreaService, RouterService, CodeMirrorErrorAreaService ]
		};
	}

}