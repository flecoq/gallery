import { FuncDefinition } from './funcDefinition';
import { FuncExpression } from '../function/expression/funcExpression';
import { RandomFunction } from '../function/expression/randomfunction';
import { VectorFunction } from '../function/expression/vectorfunction';
import { MathFunction } from '../function/expression/mathfunction';
import { FuncImpl } from './funcImpl';
import { Func } from '../../model/assembler/func';

export class FunctionUtils {
	
	public static definitionList: FuncDefinition[] = [];
	
	public static getFuncList(): FuncDefinition[] {
		if( FunctionUtils.definitionList.length == 0) {
			
			// function: random
			// ex: random(0, 1)
			var func: FuncDefinition = new FuncDefinition("random", "float");
			func.addDefParam("min", true, "float");
			func.addDefParam("max", true, "float");
			FunctionUtils.definitionList.push(func);

			// function: randomList
			// ex: randomList(a;b;c)
			func = new FuncDefinition("randomList", "string");
			func.addDefParam("value", true, "value");
			FunctionUtils.definitionList.push(func);
			
			// function: vector
			// ex: vector(10,100,100)
			func = new FuncDefinition("vector", "vector");
			func.addDefParam("x", true, "float");
			func.addDefParam("y", true, "float");
			func.addDefParam("z", true, "float");
			FunctionUtils.definitionList.push(func);

			// Math function

			func = new FuncDefinition("sin", "float");
			func.addDefParam("value", true, "float");
			FunctionUtils.definitionList.push(func);
			func = new FuncDefinition("asin", "float");
			func.addDefParam("value", true, "float");
			FunctionUtils.definitionList.push(func);
			func = new FuncDefinition("cos", "float");
			func.addDefParam("value", true, "float");
			FunctionUtils.definitionList.push(func);
			func = new FuncDefinition("acos", "float");
			func.addDefParam("value", true, "float");
			FunctionUtils.definitionList.push(func);
			func = new FuncDefinition("tan", "float");
			func.addDefParam("value", true, "float");
			FunctionUtils.definitionList.push(func);
			func = new FuncDefinition("atan", "float");
			func.addDefParam("value", true, "float");
			FunctionUtils.definitionList.push(func);
			func = new FuncDefinition("trunc", "integer");
			func.addDefParam("value", true, "float");
			FunctionUtils.definitionList.push(func);
			func = new FuncDefinition("abs", "float");
			func.addDefParam("value", true, "float");
			FunctionUtils.definitionList.push(func);

			// boolean function
			func = new FuncDefinition("equal", "boolean");
			func.addDefParam("a", true, null);
			func.addDefParam("b", true, null);
			FunctionUtils.definitionList.push(func);

			func = new FuncDefinition("or", "boolean");
			func.addDefParam("a", true, "boolean");
			func.addDefParam("b", true, "boolean");
			func.addDefParam("c", false, "boolean");
			func.addDefParam("d", false, "boolean");
			func.addDefParam("e", false, "boolean");
			func.addDefParam("f", false, "boolean");
			func.addDefParam("g", false, "boolean");
			func.addDefParam("h", false, "boolean");
			FunctionUtils.definitionList.push(func);

			func = new FuncDefinition("and", "boolean");
			func.addDefParam("a", true, "boolean");
			func.addDefParam("b", true, "boolean");
			func.addDefParam("c", false, "boolean");
			func.addDefParam("d", false, "boolean");
			func.addDefParam("e", false, "boolean");
			func.addDefParam("f", false, "boolean");
			func.addDefParam("g", false, "boolean");
			func.addDefParam("h", false, "boolean");
			FunctionUtils.definitionList.push(func);
		}
		
		return FunctionUtils.definitionList;
	}
	
	public static getFuncDefinition(type: string): FuncDefinition {
		for(let func of this.getFuncList()) {
			if( func.type === type) {
				return func;
			}
		}
		return null;
	}

	public static getFuncImpl(func : Func): FuncImpl {
		// TODO
		return null;
	}

	public static getFuncExpression(func : Func): FuncExpression {
		if( "random" === func.type) {
			return new RandomFunction(func);
		} else if( "vector" === func.type) {
			return new VectorFunction(func);
		} else if( MathFunction.isMathFunction(func.type)) {
			return new MathFunction(func);
		} else {
			return null;
		}
	}
}