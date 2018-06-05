import { Component, Input } from "@angular/core";
import { NgForm, ControlContainer } from "@angular/forms";
import { Modes } from "app/root-content/security/users/user-details/user-details.component";

@Component( {
	selector: "basic-credentials",
	templateUrl: "./basic-credentials.component.html",
	viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ],
} )
export class BasicCredentialsComponent {

	public Modes:typeof Modes = Modes;

	@Input() mode:string = Modes.EDIT;
	@Input() basicCredentialsFormModel:BasicCredentialsFormModel;
}

export interface BasicCredentialsFormModel {
	username:string;
	password:string;
	repeatPassword:string;
}