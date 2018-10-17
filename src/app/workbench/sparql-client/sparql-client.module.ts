import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { SPARQLClientComponent } from "./sparql-client.component";
import { QueryBuilderComponent } from "./query-builder/query-builder.component";

import { ResponseComponent } from "./response/response.component";

import { RelativePipe } from "./resultset-table/relative.pipe";
import { PrefixPipe } from "./resultset-table/prefix.pipe";
import { URIPipe } from "./resultset-table/uri.pipe";

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
		QueryBuilderComponent,
		ResponseComponent,
		ResultsetTableComponent,
		RelativePipe,
		PrefixPipe,
		PrefixPipe,
		URIPipe,
	],
	exports: [
		SPARQLClientComponent,
	],
} )

export class SPARQLClientModule {

}