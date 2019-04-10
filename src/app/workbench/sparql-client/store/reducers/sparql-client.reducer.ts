import { SPARQLQuery } from "./../../models/sparql-query.model";
import * as SparqlQueryActions from "./../actions/sparql-client.action";

const initialState:SPARQLQuery = {
	name: "",
	endpoint: "",
	content: ""
};


export function reducer( state:SPARQLQuery = initialState, action:SparqlQueryActions.Actions ) {

	switch( action.type ) {
		case SparqlQueryActions.UPDATE_WIP_SPARQL_QUERY:
			state = Object.assign( {}, action.payload );
			return state;
		default:
			return state;
	}
}
