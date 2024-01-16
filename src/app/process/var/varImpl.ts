import { Variable } from "../../model/assembler/variable";
import { KeyValue } from "./keyValue";
import { ValueCollection } from "./valueCollection";
import { FuncValue } from '../function/funcValue';
import { Vector3 } from "@babylonjs/core";

export class VarImpl extends Variable {
	
	public resultList: FuncValue[] = [];
	public generated: boolean;
	
	public constructor(variable: Variable) {
		super();
		variable.copy(this);
	}
	
	public getCount(): number {
		return this.resultList.length;
	}
	
	public generate(): void {
		this.generated = true;
	}
	
	public getResult(u: number): FuncValue {
		return null;
	}
	
	public getValue(u: number): KeyValue {
		return new KeyValue(this, this.resultList[u], u);
	}
	
	public getSndValue(valueCollection: ValueCollection): KeyValue {
		this.generate();
		return new KeyValue(this, this.getSndResult(valueCollection));
	}
	
	public addResult(value: string): void {
		this.resultList.push(new FuncValue(value));
	}
	
	public addResultInt(value: number) {
		this.resultList.push(FuncValue.createFromInt(value));
	}
	
	public addResultFloat(value: number) {
		this.resultList.push(FuncValue.createFromFloat(value));
	}
		
	public addResultVector(value: Vector3) {
		this.resultList.push(FuncValue.createFromVector(value));
	}

	public getFirstResult(): FuncValue {
		return this.resultList.length > 0 ? this.resultList[0] : null; 
	}

	public getLastResult(): FuncValue {
		return this.resultList.length > 0 ? this.resultList[this.resultList.length-1] : null; 
	}
	
	public getSndResult(valueCollection: ValueCollection): FuncValue {
		// TODO
		return null;
	}

	public getSndResultString(valueCollection: ValueCollection): string {
		var result: FuncValue = this.getSndResult(valueCollection);
		return result == null ? null : result.toString();
	}

}