import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
// Components
import { MessageComponent } from "./components/messages-area/message.component";
import { MessagesAreaComponent } from "./components/messages-area/messages-area.component";
import { ErrorLabelComponent } from "./components/messages-area/error/error-label.component";
import { PaginatorComponent } from "./components/paginator/paginator.component";
import { VersionsPresenterComponent } from "./components/versions-presenter/versions-presenter.component";
import * as CodeMirrorComponent from "./components/code-mirror/code-mirror.component";
import { GridColumnComponent, HorizontalResizableGrid, VerticalGridDividerComponent } from "./components/horizontal-resizable-grid/horizontal-resizable-grid.component";
// Modules
import { PipesModule } from "./pipes/pipes.module";
import { DirectivesModule } from "./directives/directives.module";
import { SemanticModule } from "./components/semantic/semantic.module";
// Services
import { RouterService } from "./router.service";
import { MessagesAreaService } from "./components/messages-area/messages-area.service";

@NgModule( {
	imports: [
		CommonModule,
	],
	declarations: [
		ErrorLabelComponent,
		CodeMirrorComponent.Class,
		MessageComponent,
		MessagesAreaComponent,
		PaginatorComponent,
		VersionsPresenterComponent,

		HorizontalResizableGrid,
		GridColumnComponent,
		VerticalGridDividerComponent,
	],
	providers: [],
	exports: [
		ErrorLabelComponent,
		CodeMirrorComponent.Class,
		MessageComponent,
		MessagesAreaComponent,
		PaginatorComponent,
		VersionsPresenterComponent,
		HorizontalResizableGrid,
		GridColumnComponent,
		VerticalGridDividerComponent,

		PipesModule,
		DirectivesModule,
		SemanticModule
	]
} )

export class AppCommonModule {

	static forRoot():ModuleWithProviders {
		return {
			ngModule: AppCommonModule,
			providers: [ MessagesAreaService, RouterService ]
		};
	}

}
