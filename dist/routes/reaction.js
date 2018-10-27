"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

class Reaction{
	constructor(reactant, reagent, product, active, solved){
		this.reactant = reactant;
		this.reagent = reagent;
		this.product = product;
		this.active = active;
		this.solved = solved;
	}
}

exports.Reaction = Reaction;