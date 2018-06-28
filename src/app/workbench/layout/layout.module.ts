import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";


// Components

// Modules
import { SharedModule } from "app/shared/shared.module";

// Services


@NgModule( {
	imports: [
		CommonModule,
		FormsModule,

		SharedModule,
	],
	declarations: [],
	exports: [],
	providers: [],
} )
export class LayoutModule {}