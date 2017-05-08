import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

//Providers
import { routing } from "./security.routing";

// Components
import { SecurityView } from "./security.view";

import { AgentsView } from "./agents/agents.view";
import { AgentsComponent } from "./agents/agents.component";
import { AgentsListView } from "./agents/agents-list/agents-list.view";
import { AgentsListComponent } from "./agents/agents-list/agents-list.component";
import { AgentDetailsView } from "./agents/agent-details/agent-details.view";
import { AgentDetailsComponent } from "./agents/agent-details/agent-details.component";
import { AgentsChooserComponent } from "./agents/agents-chooser/agents-chooser.component";
import { AgentDeleterComponent } from "./agents/agent-deleter/agent-deleter.component";
import { AgentCreatorView } from "./agents/agent-creator/agent-creator.view";
import { AgentNotFoundView } from "./agents/agent-not-found/agent-not-found.view";

import { RolesView } from "./roles/roles.view";
import { RolesBrowserView } from "./roles/roles-browser/roles-browser.view";
import { RolesBrowserComponent } from "./roles/roles-browser/roles-browser.component";
import { RolesTreeViewComponent } from "./roles/roles-tree-view/roles-tree-view.component";
import { RoleDetailsComponent } from "./roles/role-details/role-details.component";
import { RoleDeleterComponent } from "./roles/role-deleter/role-deleter.component";
import { RolesChooserComponent } from "./roles/roles-chooser/roles-chooser.component";


// Modules
import { SharedModule } from "app/shared/shared.module";

// Services
import { AgentsService } from "./agents/agents.service";
import { RolesService } from "./roles/roles.service";
import { AgentResolver } from "./agents/agent.resolver";
import { RoleResolver } from "./roles/role.resolver";


@NgModule( {
	imports: [
		CommonModule,
		FormsModule,
		routing,
		SharedModule,
	],
	declarations: [
		SecurityView,

		AgentsView,
		AgentsComponent,
		AgentsListView,
		AgentsListComponent,
		AgentDetailsView,
		AgentDetailsComponent,
		AgentsChooserComponent,
		AgentDeleterComponent,
		AgentCreatorView,
		AgentNotFoundView,

		RolesView,
		RolesBrowserView,
		RolesBrowserComponent,
		RolesTreeViewComponent,
		RoleDetailsComponent,
		RoleDeleterComponent,
		RolesChooserComponent,
	],
	providers: [
		AgentsService,
		RolesService,
		AgentResolver,
		RoleResolver,
	],
} )
export class SecurityModule {
}
