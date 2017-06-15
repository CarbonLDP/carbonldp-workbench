import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";


import { SecurityView } from "./security.view";
import { UsersView } from "./users/users.view";
import { UserResolver } from "./users/user.resolver";
import { UsersListView } from "./users/users-list/users-list.view";
import { UserDetailsView } from "./users/user-details/user-details.view";
import { UserCreatorView } from "./users/user-creator/user-creator.view";
import { UserNotFoundView } from "./users/user-not-found/user-not-found.view";
import { RolesView } from "./roles/roles.view";
import { RoleResolver } from "./roles/role.resolver";
import { RolesBrowserView } from "./roles/roles-browser/roles-browser.view";

export const SecurityRoutes:Routes = [
	{
		path: "",
		data: {
			alias: "security",
			displayName: "Security",
		},
		component: SecurityView,
		children: [
			{
				path: "",
				redirectTo: "users",
				pathMatch: "full",
			},
			{
				path: "users",
				data: {
					alias: "users",
					displayName: "Users",
				},
				component: UsersView,
				children: [
					{
						path: "",
						data: {
							// TODO: Remove hide property when Angular's Router bug is fixed
							hide: true
						},
						component: UsersListView,
					},
					{
						path: "list",
						component: UsersListView,
					},
					{
						path: "create",
						data: {
							alias: "create",
							displayName: "Create User",
						},
						component: UserCreatorView,
					},
					{
						path: "user-not-found",
						component: UserNotFoundView,
						data: {
							alias: "user-not-found",
							displayName: "No User"
						}
					},
					{
						path: ":user-slug",
						resolve: {
							user: UserResolver,
						},
						data: {
							param: "user-slug",
							displayName: "User",
							title: "User",
						},
						component: UserDetailsView,
					}
				]
			},
			{
				path: "roles",
				data: {
					alias: "roles",
					displayName: "Roles",
				},
				component: RolesView,
				children: [
					{
						path: "",
						data: {
							// TODO: Remove hide property when Angular's Router bug is fixed
							hide: true
						},
						component: RolesBrowserView,
					},
					{
						path: ":role-slug",
						resolve: {
							role: RoleResolver,
						},
						data: {
							param: "role-slug",
							displayName: "Role",
							title: "Role",
						},
						component: RolesBrowserView,
					},
				]
			}
		]
	}
];

export const routing:ModuleWithProviders = RouterModule.forChild( SecurityRoutes );