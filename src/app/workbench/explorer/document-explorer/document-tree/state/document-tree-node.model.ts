import { v4 as uuid } from "uuid";
import random from "lodash/random";

// FIXME: Move to a more appropriate space
export const DUMMY:string = "http://example.org/ns#Dummy";

export interface DocumentTreeNode {
	// FIXME: Abstract to another interface
	isDummy:boolean;

	id:string;
	parent:string | null;
	children:string[];
	types:string[];
	created:Date,
	modified:Date,
}

export const DocumentTreeNode = {
	create(
		{
			id = null,
			parent = null,
			children = [],
			types = [],
			created = null,
			modified = null,
		}:Partial<DocumentTreeNode>
	):DocumentTreeNode {
		return {
			isDummy: false,

			id,
			parent,
			children,
			types,
			created,
			modified,
		};
	},

	createDummy(
		{
			id = uuid(),

			parent = null,
			children = [],
		}:Partial<DocumentTreeNode>
	):DocumentTreeNode {
		return {
			isDummy: true,

			id,
			parent,
			children,
			types: [ DUMMY ],
			created: null,
			modified: null,
		};
	},

	/**
	 * Creates a random number of nodes organized in a tree structure so they can serve as dummy data
	 *
	 * @param maxChildren - Maximum children that each parent node can have
	 * @param descendants - Number of descendant levels to add for the root node
	 */
	createDummyNodes( maxChildren:number = 2, descendants:number = 3 ):DocumentTreeNode[] {
		const node = DocumentTreeNode.createDummy( {} );

		let nodes:DocumentTreeNode[] = [ node ];
		const childrenNodes:DocumentTreeNode[] = [];

		const children = random( 1, maxChildren, false );
		for( let i = 0; i < children; i ++ ) {
			if( descendants > 0 ) {
				const descendantNodes = DocumentTreeNode.createDummyNodes( maxChildren, descendants - 1 );
				descendantNodes[ 0 ].parent = node.id;
				childrenNodes.push( descendantNodes[ 0 ] );
				nodes = nodes.concat( descendantNodes );
			} else {
				const child = DocumentTreeNode.createDummy( {
					parent: node.id,
				} );
				childrenNodes.push( child );
				nodes.push( child );
			}
		}

		node.children = childrenNodes.map( node => node.id );

		return nodes;
	},
};
