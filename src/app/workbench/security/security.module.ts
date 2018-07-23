import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

//Providers
import { routing } from "./security.routing";

// Components
import { SecurityView } from "./security.view";

import { UsersView } from "./users/users.view";
import { UsersComponent } from "./users/users.component";
import { UsersListView } from "./users/users-list/users-list.view";
import { UsersListComponent } from "./users/users-list/users-list.component";
import { UserDetailsView } from "./users/user-details/user-details.view";
import { UserDetailsComponent } from "./users/user-details/user-details.component";
import { UsersChooserComponent } from "./users/users-chooser/users-chooser.component";
import { UserDeleterComponent } from "./users/user-deleter/user-deleter.component";
import { UserCreatorView } from "./users/user-creator/user-creator.view";
import { UserNotFoundView } from "./users/user-not-found/user-not-found.view";

import { RolesView } from "./roles/roles.view";
import { RolesBrowserView } from "./roles/roles-browser/roles-browser.view";
import { RolesBrowserComponent } from "./roles/roles-browser/roles-browser.component";
import { RolesTreeViewComponent } from "./roles/roles-tree-view/roles-tree-view.component";
import { RoleDetailsComponent } from "./roles/role-details/role-details.component";
import { RoleDeleterComponent } from "./roles/role-deleter/role-deleter.component";
import { RolesChooserComponent } from "./roles/roles-chooser/roles-chooser.component";

import { BasicCredentialsComponent } from "./credentials/basic-credentials.component";

// Modules
import { SharedModule } from "app/shared/shared.module";

// Services
import { UsersService } from "./users/users.service";
import { RolesService } from "./roles/roles.service";
import { UserResolver } from "./users/user.resolver";
import { RoleResolver } from "./roles/role.resolver";
import { CredentialsService } from "./credentials/credentials.service";


@NgModule( {
	imports: [
		CommonModule,
		FormsModule,
		routing,
		SharedModule,
	],
	declarations: [
		SecurityView,

		UsersView,
		UsersComponent,
		UsersListView,
		UsersListComponent,
		UserDetailsView,
		UserDetailsComponent,
		UsersChooserComponent,
		UserDeleterComponent,
		UserCreatorView,
		UserNotFoundView,

		RolesView,
		RolesBrowserView,
		RolesBrowserComponent,
		RolesTreeViewComponent,
		RoleDetailsComponent,
		RoleDeleterComponent,
		RolesChooserComponent,

		BasicCredentialsComponent,
	],
	providers: [
		UsersService,
		RolesService,
		UserResolver,
		RoleResolver,
		CredentialsService,
	],
} )
export class SecurityModule {
}
