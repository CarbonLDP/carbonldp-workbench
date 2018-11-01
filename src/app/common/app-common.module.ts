import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
// Components
import { SparqlEditorComponent } from './components/sparql-editor/sparql-editor.component';
import { MessageComponent } from "./components/messages-area/message.component";
import { MessagesAreaComponent } from "./components/messages-area/messages-area.component";
import { ErrorLabelComponent } from "./components/messages-area/error/error-label.component";
import { PaginatorComponent } from "./components/paginator/paginator.component";
import { VersionsPresenterComponent } from "./components/versions-presenter/versions-presenter.component";
import * as CodeMirrorComponent from "./components/code-mirror/code-mirror.component";
import { SparqlErrorMessageAreaComponent } from './components/sparql-editor/sparql-error-message-area/sparql-error-message-area.component';

// Modules
import { PipesModule } from "./pipes/pipes.module";
import { DirectivesModule } from "./directives/directives.module";
import { SemanticModule } from "./components/semantic/semantic.module";
// Services
import { RouterService } from "./router.service";
import { MessagesAreaService } from "./components/messages-area/messages-area.service";
import { SparqlEditorToolBarComponent } from './components/sparql-editor/sparql-editor-tool-bar/sparql-editor-tool-bar.component';

// Pipes

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
		SparqlEditorComponent,
		SparqlErrorMessageAreaComponent,
		SparqlEditorToolBarComponent,
	],
	providers: [],
	exports: [
		ErrorLabelComponent,
		CodeMirrorComponent.Class,
		MessageComponent,
		MessagesAreaComponent,
		PaginatorComponent,
		VersionsPresenterComponent,
		SparqlEditorComponent,

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
