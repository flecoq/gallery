import { VarImpl } from "./varImpl";
import { FuncValue } from "../../process/function/funcValue";

export class KeyValue {
	
	public source: VarImpl;
	public result: FuncValue;
	public index: number;
	
	constructor(source: VarImpl, result: FuncValue, index? : number) {
		this.source = source;
		this.result = result;
		this.index = index;
	}
	
	public getKey(): string {
		return this.source.name;
	}
}