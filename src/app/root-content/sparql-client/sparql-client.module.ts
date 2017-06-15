import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { ResponseComponent } from "./response/response.component";
import { SPARQLClientComponent } from "./sparql-client.component";

import { RelativizeURIPipe } from "./resultset-table/relativize-uri.pipe";
import { PrefixURIPipe } from "./resultset-table/prefix-uri.pipe";

import { ResultsetTableComponent } from "./resultset-table/resultset-table.component";

// Modules
import { SharedModule } from "app/shared/shared.module";

@NgModule( {
	imports: [
		CommonModule,
		RouterModule,
		SharedModule,
		FormsModule
	],
	declarations: [
		SPARQLClientComponent,
		ResponseComponent,
		ResultsetTableComponent,
		RelativizeURIPipe,
		PrefixURIPipe,
		PrefixURIPipe,
	],
	exports: [
		SPARQLClientComponent,
	],
} )

export class SPARQLClientModule {

}