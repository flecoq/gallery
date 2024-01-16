import { Variable } from "../../model/assembler/variable";
import { VarImpl } from "./varImpl";
import { Logger } from "../../process/utils/logger";
import { ValueCollection } from "./valueCollection";
import { SequenceVar } from "../../process/var/sequenceVar";
import { RatioVar } from "../../process/var/ratioVar";
import { RandomVar } from "../../process/var/randomVar";

export class VarManager {
	
	public mainVarList: VarImpl[] = [];
	public sndVarList: VarImpl[] = [];
	public valueCollectionList: ValueCollection[] = [];
	
	constructor(variables: Variable[]) {
		for(let variable of variables) {
			var varImpl: VarImpl  = this.getVarImpl(variable);
			if( varImpl.isMain() ) {
				this.mainVarList.push(varImpl);
			} else {
				this.sndVarList.push(varImpl);
			}
		}
		this.calculateValueCollectionList();
	}
	
	public calculateMainValues(index: number, valueCollection: ValueCollection ): void {
		if (this.mainVarList.length == 0) {
			valueCollection.index = 1;
			this.valueCollectionList.push(valueCollection);
		} else {
			var varImpl:VarImpl = this.mainVarList[index];
			for (let u = 0; u < varImpl.getCount(); u++) {
				var valueCopy: ValueCollection = valueCollection.clone();
				valueCopy.addValue(varImpl, varImpl.getValue(u).result, u);
				if (index < this.mainVarList.length - 1) {
					this.calculateMainValues(index + 1, valueCopy);
				} else {
					valueCopy.index = this.valueCollectionList.length + 1;
					this.valueCollectionList.push(valueCopy);
				}
			}
		}
	}

	public calculateValueCollectionList(): void {
		this.calculateMainValues(0, new ValueCollection());
		Logger.info("VarManager", "var values");
		for(let valueCollection of this.valueCollectionList) {
			for(let secondVar of this.sndVarList) {
				valueCollection.addValue(secondVar, secondVar.getSndValue(valueCollection).result);
			}
			Logger.info("VarManager", "  " + valueCollection.toString());
		}
	}
	
	public  getVarImpl(variable: Variable):  VarImpl {
		if( variable.type === "sequence") {
			return new SequenceVar(variable);
		} else if( variable.type === "ratio") {
			return new RatioVar(variable);
		} else if( variable.type === "random") {
			return new RandomVar(variable);
		}
		return new VarImpl(variable);
	}
	
}