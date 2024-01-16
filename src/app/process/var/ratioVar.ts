import { Variable } from "../../model/assembler/variable";
import { VarImpl } from "./varImpl";
import { KeyValue } from "./keyValue";
import { FuncValue } from "../../process/function/funcValue";
import { ValueCollection } from "./valueCollection";

export class RatioVar extends VarImpl {
	
	public ratioType: string;
	public random: number;
	public begin: number;
	public end: number;
	
	public constructor(variable: Variable) {
		super(variable);
		this.ratioType = this.getParamValue("ratio.type");
		this.random = this.getParamValueFloat("random");
		this.begin = this.getParamValueFloat("begin");
		this.end = this.getParamValueFloat("end");
	}
	
	public getSndValue(valueCollection: ValueCollection): KeyValue {
		var keyValue: KeyValue = valueCollection.getKeyValue(this.value ? this.value : this.getParamValue("var"));
		var source: VarImpl = keyValue.source;
		var index: number = keyValue.index;
		var count: number = source.getCount();
		var result: number = 0;
		if (this.ratioType == null || "left" === this.ratioType) {
			result = index / (count - 1);
		} else if ("right" === this.ratioType) {
			result = (index + 1) / count;
		} else if ("middle" === this.ratioType) {
			result = (index + 0.5) / count;
		}
		if (this.random != null) {
			var unit: number;
			if (this.ratioType == null || "left" === this.ratioType) {
				unit = 1 / (count - 1);
			} else {
				unit = 1 / count;
			}
			result += unit * this.random / 100 * (-0.5 + Math.random());
			result = Math.max(result, 0);
			result = Math.min(result, 1);
		}
		if (this.begin && this.end) {
			result = this.begin * (1 - result) + this.end * result;
		}
		return new KeyValue(this, FuncValue.createFromFloat(result));
	}
	
}