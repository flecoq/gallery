import { Param } from "../../model/assembler/param";
import { ExpressionComp } from './expressionComp';
import { CharExpression } from './charExpression';
import { ClassExpression } from './classExpression';
import { FuncValue } from '../function/funcValue';
import { Vector3 } from "@babylonjs/core";
import { FormatUtils } from "../../process/utils/formatUtils";
import { ParamUtils } from "../../process/utils/paramUtils";
import { Logger } from "../../process/utils/logger";

export class Expression {

	public content: string;
	public paramList: Param[];
	public root: ExpressionComp;

	public funcValue: FuncValue;
	public doParse: boolean = true;

	public index: number;
	public end: boolean;

	public parseError: boolean;
	public resultError: boolean;
	
	constructor(content: string, paramList: Param[]) {
		this.content = content.replace(/\s/g, "");
		if( paramList ) {
			this.paramList = paramList;
			for(let param of paramList) {
				var replace = FormatUtils.toVector(param.value) ? "vector(" + param.value.replace(new RegExp(";", 'g'), ",") + ")" : param.value;
				this.content = this.content.split("$" + param.name).join(replace);
			}
		}
		this.index = 0;
		var vector: Vector3 = FormatUtils.toVector(this.content);
		if (vector) {
			this.funcValue = FuncValue.createFromVector(vector);
		} else {
			var integer: number = FormatUtils.toStrictInt(this.content);
			if (!isNaN(integer)) {
				this.funcValue = FuncValue.createFromInt(integer);
			} else {
				var float: number = FormatUtils.toStrictFloat(this.content);
				if (!isNaN(float)) {
					this.funcValue = FuncValue.createFromFloat(float);
				}
			}
		}
	}

	public toParse(): boolean {
		return this.funcValue == null;
	}
	
	public getChar(): string {
		return this.content.substring(this.index, this.index + 1);
	}

	public next(): boolean {
		if (this.index < this.content.length - 1) {
			this.index++;
		} else {
			this.end = true;
		}
		return this.end;
	}


	public foward(value: number): boolean {
		if (this.index + value < this.content.length) {
			this.index += value;
		} else {
			this.end = true;
		}
		return this.end;
	}

	public getCharExpression(): CharExpression {
		var result: CharExpression = CharExpression.find(this.getChar());
		if (result == null) {
			return null;
		} else {
			this.next();
			return result;
		}
	}

	public isBegin(value: string): boolean {
		return this.content.substring(this.index, this.content.length).indexOf(value) == 0;
	}
	
	public getFuncName(): string {
		var result: string = this.content.substring(this.index, this.content.length);
		var index: number = result.indexOf("(");
		if( index < 0) {
			return null;
		}
		result = result.substring(0, index);
		return result.match("[a-zA-Z_]+") ? result : null;
	}

	public toString(): string {
		return this.content.substring(this.index, this.content.length);
	}

	public parse(): ExpressionComp {
		if (this.doParse && this.funcValue == null) {
			this.root = ExpressionComp.createFromExpression(this, null);
			try {
				ClassExpression.init();
				this.root.parse();
				this.doParse = false;
			} catch (e) {
				this.parseError = true;
				// throw e;
				Logger.error("Expression", e);
			}
		}
		return this.root;
	}

	public getClassExpression(): ClassExpression {
		ClassExpression.init();
		if (this.root == null) {
			this.parse();
		}
		if (!this.parseError) {
			try {
				return this.root.getClassExpression();
			} catch (e) {
				Logger.error("Expression", e);
			}
		}
		return null;
	}

	public getResult(): FuncValue {
		ClassExpression.init();
		if( this.funcValue != null ) {
			return this.funcValue;
		}
		if (this.root == null) {
			this.parse();
		}
		if (!this.parseError) {
			try {
				return this.root.getResult();
			} catch (e) {
				this.resultError = true;
				Logger.error("Expression", e);
			}
		}
		return null;
	}

	public trace(): void {
		console.log("expression: " + this.content);
		if (this.root != null) {
			this.root.trace("");
		}
	}
	
	public static getResult(value: string, paramList: Param[]): FuncValue {
		var expression: Expression = new Expression(value, paramList);
		return expression.getResult();
	}

	public static getResultString(value: string, paramList: Param[]): string {
		return this.getResult(value, paramList).toString();
	}
	
	public static getParamResult(param: Param, paramList: Param[]): FuncValue {
		var expression: Expression = new Expression(param.value, paramList);
		expression.parse();
		return expression.getResult();
	}

	public static getParamIntResult(params: Param[], name: string, paramList: Param[]): number {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : Expression.getParamResult(param, paramList).integer;
	}

	public static getParamFloatResult(params: Param[], name: string, paramList: Param[]): number {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : Expression.getParamResult(param, paramList).float;
	}

	public static getParamVectorResult(params: Param[], name: string, paramList: Param[]): Vector3 {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : Expression.getParamResult(param, paramList).vector;
	}
	
	public static test(): void {

		var list: string[] = [];

		/*list.push("12");
		list.push("12.3434");
		list.push("-12");
		list.push("1s");	//error case
		list.push("10+"); //error case
		list.push("5*1.5883211");
		list.push("10/2+6/2");
		list.push("10+1.5");
		list.push("2*(1 + 1)");
		list.push("2*(1 + 1"); // error case 
		list.push("2*(1 +"); // error case
		list.push("(1 + 1)*(1 + 1)");
		list.push("2*(1 + 1) + (3*(1+5)-5)");
		list.push("(1 + 1)(1 + 1)"); // error case
		list.push("random(1,2)");
		list.push("random(1,2+1)");
		list.push("random(1,2*(1 + 3))");
		*/list.push("vector(-0.2+1.0,3/2,7/2)");
		list.push("vector(random(1,0), 2.1, 3.4)");
		list.push("10*vector(1,2,3)");
		list.push("vector(1,2,3)*1.2");
		list.push("vector(1,2,3)-vector(1,-1,1)");
		list.push("vector(1,2,3).length()");
		list.push("vector(1,2,3).z");
		list.push("sin(30)");
		list.push("vector(1,sin(90),sin(90)+0.5)");
		list.push("trunc(31.12)");
		//list.push("closeIndex(1+1, 4, 1)");
		//list.push("$count+1");
		//list.push("equal(toto, toti)");
		//list.push("or(equal(1, 0), equal(1, 2), equal(1, 1))");

		console.log("*** expression test begin ****");
		for (let value of list) {
			var exp: Expression = new Expression(value, null);
			exp.parse();
			exp.trace();
			var result: FuncValue = exp.getResult();
			console.log("result (" + (result == null ? "error" : result.type) + ") = " + (result == null ? "error" : result.toString()));
			console.log("");
		}
		console.log("*** expression test end ****");
	}

}