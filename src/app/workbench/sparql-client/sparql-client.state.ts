import {SPARQLQuery} from './models/sparql-query.model';

export interface SparqlClientState {
  readonly SPARQLQuery: SPARQLQuery;
}
