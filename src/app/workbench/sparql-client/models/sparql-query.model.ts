import { QueryType, SPARQLFormats, SPARQLType } from "app/workbench/sparql-client/models/index";

export interface SPARQLQuery {
	id?:string;
	name?:string;

	endpoint:string;
	content:string;

	type?:SPARQLType;
	operation?:QueryType;

	format?:SPARQLFormats;
}