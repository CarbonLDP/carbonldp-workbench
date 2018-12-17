import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { CdkTreeModule } from "@angular/cdk/tree";
import { MatBadgeModule, MatButtonModule, MatCardModule, MatIconModule, MatMenuModule, MatRippleModule, MatTabsModule, MatTreeModule } from "@angular/material";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
// Components
import { LiteralComponent } from "./literals/literal.component";
import { LiteralsComponent } from "./literals/literals.component";
import { PointerComponent } from "./pointers/pointer.component";
import { PointersComponent } from "./pointers/pointers.component";
import { ListComponent } from "./lists/list.component";
import { ListsComponent } from "./lists/lists.component";
import { PropertyComponent } from "./property/property.component";
import { PropertyIDComponent } from "./property/property-id/property-id.component";
import { PropertyTypeComponent } from "./property/property-type/property-type.component";
import { PropertyContentComponent } from "./property/property-content/property-content.component";
import { DocumentResourceComponent } from "./document-resource/document-resource.component";
import { BlankNodeComponent } from "./blank-nodes/blank-node.component";
import { BlankNodesComponent } from "./blank-nodes/blank-nodes.component";
import { NamedFragmentComponent } from "./named-fragments/named-fragment.component";
import { NamedFragmentsComponent } from "./named-fragments/named-fragments.component";
import { DocumentViewerComponent } from "./document-viewer/document-viewer.component";
import { DocumentExplorerComponent } from "./document-explorer.component";
import { AccessPointCreatorComponent } from "./access-point-creator/access-point-creator.component";
import { DocumentCreatorComponent } from "./document-creator/document-creator.component";
import { DocumentDeleterComponent } from "./document-deleter/document-deleter.component";

import { DocumentTreeComponent } from "./document-tree/document-tree.component";
import { GetTypeIconPipe } from "./document-tree/get-type-icon.pipe";
// Modules
import { AppCommonModule } from "app/common/app-common.module";
// Services
import { DocumentsResolverService } from "./documents-resolver.service";
// Directives
import { IdValidator, LiteralValueValidator, PointerValidator, PropertyNameValidator } from "./document-explorer-validators";
import { CreateDocumentDialogComponent } from "./create-document-dialog/create-document-dialog.component";

@NgModule( {
	imports: [
		CommonModule,
		FormsModule,

		// Material UI
		CdkTreeModule,

		MatBadgeModule,
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		MatMenuModule,
		MatRippleModule,
		MatTabsModule,
		MatTreeModule,

		// FontAwesome icons
		FontAwesomeModule,

		AppCommonModule,
	],
	declarations: [
		DocumentTreeComponent,
		GetTypeIconPipe,

		LiteralComponent,
		LiteralsComponent,

		PointerComponent,
		PointersComponent,

		ListComponent,
		ListsComponent,

		PropertyComponent,
		PropertyIDComponent,
		PropertyTypeComponent,
		PropertyContentComponent,

		BlankNodeComponent,
		BlankNodesComponent,
		NamedFragmentComponent,
		NamedFragmentsComponent,

		DocumentViewerComponent,
		DocumentResourceComponent,
		DocumentExplorerComponent,
		AccessPointCreatorComponent,
		DocumentCreatorComponent,
		DocumentDeleterComponent,

		IdValidator,
		PropertyNameValidator,
		LiteralValueValidator,
		PointerValidator,
		CreateDocumentDialogComponent,
	],
	exports: [
		DocumentExplorerComponent,
	],
	providers: [],
} )
export class DocumentExplorerModule {

	static forChild():ModuleWithProviders {
		return {
			ngModule: DocumentExplorerModule,
			providers: [ DocumentsResolverService ]
		};
	}

}
