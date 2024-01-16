import { VarImpl } from "./varImpl";
import { KeyValue } from "./keyValue";
import { FuncValue } from "../../process/function/funcValue";
import { Pivot } from "../../process/utils/pivot";
import { FormatUtils } from "../../process/utils/formatUtils";

export class ValueCollection {
	
	public valueList: KeyValue[] = [];
	public index: number;
	
	constructor() {}
	
	public addValue(variable: VarImpl, value: FuncValue, index?: number): void {
		this.valueList.push(new KeyValue(variable, value, index));
	}
	
	public addValueCollection(valueCollection: ValueCollection): void {
		this.valueList.concat(valueCollection.valueList);
	}
	
	public getKeyValue(key: string): KeyValue {
		for(let keyValue of this.valueList) {
			if( key === keyValue.getKey()) {
				return keyValue;
			}
		}
		return null;
	}
	
	public getValueByKey(key: string): FuncValue {
		var keyValue: KeyValue = this.getKeyValue(key);
		return keyValue ? keyValue.result : null;
	} 
	
	public getValueByRange(u: number): FuncValue {
		return this.valueList[u].result;
	}
	
	public toString(): string {
		var result: string = "";
		for(let keyValue of this.valueList) {
			result += keyValue.getKey() + ": " + (keyValue.result ? keyValue.result : "null") + "; ";
		}
		return result;
	}
	
	public replace(value): string {
		var result: string = value;
		result = result.split("$index").join(this.index.toString());
		for(let keyValue of this.valueList) {
			if( keyValue.result.isPivot() ) {
				var pivot: Pivot = keyValue.result.pivot;
				result = result.split("$" + keyValue.getKey() + ".pos").join(FormatUtils.vectorToString(pivot.o));
				result = result.split("$" + keyValue.getKey() + ".rot").join(FormatUtils.vectorToString(pivot.getEulerAnglesDeg()));
			} else {
				result = result.split("$" + keyValue.getKey()).join(keyValue.result.toString());
			}
		}
		return result;
	}
	
	public clone(): ValueCollection {
		var result: ValueCollection = new ValueCollection();
		result.index = this.index;
		result.valueList.concat(this.valueList);
		return result;
	}
}