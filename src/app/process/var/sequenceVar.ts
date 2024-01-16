import { Variable } from "../../model/assembler/variable";
import { VarImpl } from "./varImpl";
import { KeyValue } from "./keyValue";
import { FuncValue } from "../../process/function/funcValue";
import { FormatUtils } from "../../process/utils/formatUtils";
import { ValueCollection } from "./valueCollection";

export class SequenceVar extends VarImpl {
	
	public key: string;
	public u: number;
	
	public constructor(variable: Variable) {
		super(variable);
		this.main = this.main ? this.main : "1";
		this.key = this.getParamValue("var");
		if( this.key ) {
			// TODO
		} else if (this.value) {
			if( this.value.indexOf(";") > 0) {
				for(let i of this.value.split(";")) {
					this.addResult(i);
				}
			} else {
				var values = this.value.split("-");
				var begin: number = FormatUtils.toInt(values[0]);
				var end: number = FormatUtils.toInt(values[1]);
				for(let i = begin; i <= end; i++) {
					this.addResultInt(i);
				}
			}
		} else {
			var begin: number = this.getParamValueInt("begin");
			var end: number = this.getParamValueInt("end");
			if( begin && end ) {
				for(let i = begin; i <= end; i++) {
					this.addResultInt(i);
				}
			} else {
				for(let param of this.Param) {
					if( param.name == null || param.name === "value") {
						this.addResult(param.value);
					}
				}
			}
		}
	}
	
	public getResult(u: number): FuncValue {
		var v: number = u - this.getCount() * (u / this.getCount());
		return this.resultList[v];
	}
	
	public getSndValue(valueCollection: ValueCollection): KeyValue {
		var result: string = null;
		if( this.key == null ) {
			result = this.getResult(this.u++).toString();
		} else {
			var index: number = valueCollection.getKeyValue(this.key).result.integer;
			result = this.getResult(index).toString();
		}
		return new KeyValue(this, FuncValue.createFromString(result));
	}
	
	
}