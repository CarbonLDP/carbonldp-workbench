import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
// Components
import { MessageComponent } from "./messages-area/message.component";
import { MessagesAreaComponent } from "./messages-area/messages-area.component";
import { ErrorLabelComponent } from "./messages-area/error/error-label.component";
import { PaginatorComponent } from "./paginator/paginator.component";
import { VersionsPresenterComponent } from "./versions-presenter/versions-presenter.component";
import * as CodeMirrorComponent from "./code-mirror/code-mirror.component";
import { ResizeBarComponent } from "./code-mirror/resize-bar/resize-bar.component";
// Modules
import { PipesModule } from "./pipes/pipes.module";
import { DirectivesModule } from "./directives/directives.module";
import { SemanticModule } from "./semantic/semantic.module";
// Services
import { RouterService } from "./router.service";
import { MessagesAreaService } from "./messages-area/messages-area.service";
import { ResizeBarService } from "./code-mirror/resize-bar/resize-bar.service";

// Pipes

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
		ResizeBarComponent,
	],
	providers: [
		ResizeBarService
	],
	exports: [
		MessageComponent,
		MessagesAreaComponent,
		CodeMirrorComponent.Class,
		ErrorLabelComponent,
		PaginatorComponent,
		VersionsPresenterComponent,
		ResizeBarComponent,

		PipesModule,
		DirectivesModule,
		SemanticModule
	]
} )

export class SharedModule {

	static forRoot():ModuleWithProviders {
		return {
			ngModule: SharedModule,
			providers: [ MessagesAreaService, RouterService, ResizeBarService ]
		};
	}

}
