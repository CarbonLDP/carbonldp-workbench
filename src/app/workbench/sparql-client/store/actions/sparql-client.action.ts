import { Action } from "@ngrx/store";
import { SPARQLQuery } from "./../../models/sparql-query.model";

// define the types of the actions
export const UPDATE_WIP_SPARQL_QUERY = "UPDATE-WIP-SPARQL-QUERY";
export const GET_WIP_SPARQL_QUERY = "GET-WIP-SPARQL-QUERY";

//define actions to dispatch
export class AddWIPQuery implements Action {
	readonly type = UPDATE_WIP_SPARQL_QUERY;

	constructor( public payload:SPARQLQuery ) {}
}

export class GetWIPQuery implements Action {
	readonly type = GET_WIP_SPARQL_QUERY;

	constructor() {}
}

export type Actions = AddWIPQuery | GetWIPQuery;
