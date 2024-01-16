import { Func } from '../../model/assembler/func';
import { Param } from '../../model/assembler/param';
import { FuncValue } from '../../process/function/funcValue';

export class FuncDefinition extends Func {
	
	public result: string;
		
	public constructor(type: string, result: string) {
		super(type);
		this.result = result;
	}

	public addDefParam(name: string, mandatory: boolean, format: string): void {
		this.Param.push(new Param(name, (mandatory ? "1" : "0") + ";" + format, "true"));
	}
	
	public isParamMandatory(param: Param): boolean {
		return param.value ? "1" === param.value.substring(0, 1) : false;
	}
	
	public isMandatory(name: string): boolean  {
		return this.isParamMandatory(this.getParam(name));
	}
		
	public isParamExists(param: Param): boolean {
		return this.getParam(param.name) != null;
	}

	public mandatoryCount(): number {
		var result: number = 0;
		for (let param of this.Param) {
			if (this.isParamMandatory(param)) {
				result++;
			}
		}
		return result;
	}

	public argumentCount(): number {
		return this.Param == null ? 0 : this.Param.length;
	}

	public createFuncParam(list: FuncValue[]): Func {
		var result: Func = new Func(this.type);
		if (list) {
			for (let u = 0; u < list.length; u++) {
				result.addParam(this.Param[u].name, list[u].toString(), "true");
			}
		}
		return result;
	}

}
