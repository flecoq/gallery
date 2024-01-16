import { Expression } from './expression';
import { CharExpression } from './charExpression';
import { ClassExpression } from './classExpression';
import { PropertyExpression } from './propertyExpression';
import { OperatorExpression } from './operatorExpression';
import { FuncValue } from '../../process/function/funcValue';
import { Param } from '../../model/assembler/param';
import { Func } from '../../model/assembler/func';
import { FuncDefinition } from '../../process/function/funcDefinition';
import { FunctionUtils } from '../../process/function/functionUtils';
import { FormatUtils } from '../../process/utils/formatUtils';
import { FuncImpl } from '../../process/function/funcImpl';
import { FuncExpression } from '../../process/function/expression/funcExpression';

export class ExpressionComp {
	
	public static TYPE_PARENTHESIS: number = 1;
	public static TYPE_FUNCTION: number = 2;
	public static TYPE_ARGUMENT: number = 3;
	public static TYPE_VALUE: number = 4;
	public static TYPE_VARIABLE: number = 5;
	public static TYPE_PROPERTY: number = 6;
	public static TYPE_ROOT: number = 7;
	
	public exp: Expression;
	public content: string;
	
	public type: number;
	public charExpEnd: CharExpression;
	
	public parent: ExpressionComp;
	public children: ExpressionComp[] = [];
	public childrenResult: FuncValue[] = [];
	public classChild: ExpressionComp;
	
	public end: boolean;
	public value: string;
	public funcDefinition: FuncDefinition;
	public property: PropertyExpression;
	public funcImpl: FuncImpl;
	
	
	constructor(type: number) {
		this.type = type;
	}
	
	public static createFromExpression(exp: Expression, parent: ExpressionComp): ExpressionComp {
		var result: ExpressionComp = new ExpressionComp(null);
		result.exp = exp;
		result.parent = parent;
		result.content = exp.toString();
		return result;
	}

	public appendValue(s: string): void {
		if (this.value == null) {
			this.value = s;
		} else {
			this.value += s;
		}
	}
	
	public setType(): void {
		var funcName: string = this.exp.getFuncName();
		if (funcName) {
			this.funcDefinition = FunctionUtils.getFuncDefinition(funcName);
			if (this.funcDefinition) {
				this.type = ExpressionComp.TYPE_FUNCTION;
				this.exp.foward(funcName.length + 1);
				return;
			} else {
				// finding func in process
				/*this.funcImpl = FunctionUtils.getFuncImpl(funcName);
				if (this.funcImpl) {
					this.type = ExpressionComp.TYPE_FUNCTION;
					this.exp.foward(funcName.length + 1);
					return;
				}*/
			}
		}
		var regInteger = new RegExp('[0-9-]+');
		var regAlpha = new RegExp('[a-zA-Z_]+');
		if ("$" === this.exp.getChar()) {
			this.type = ExpressionComp.TYPE_VARIABLE;
			this.appendValue(this.exp.getChar());
			this.exp.next();
		} else if ( regInteger.test(this.exp.getChar()) || regAlpha.test(this.exp.getChar())) {
			this.type = ExpressionComp.TYPE_VALUE;
			this.appendValue(this.exp.getChar());
			this.exp.next();
		} else if (CharExpression.CHAR_PARENTHESIS_BEGIN.equals(CharExpression.find(this.exp.getChar()))) {
			this.type = ExpressionComp.TYPE_PARENTHESIS;
			this.exp.next();
		}
		if (this.type == null) {
			throw new Error("type not found: " + toString());
		}
	}
	
	public setTypeFromClass(classExpression: ClassExpression): void {
		for (let func of classExpression.funcList) {
			if (this.exp.isBegin(func.type + "(")) {
				this.type = ExpressionComp.TYPE_FUNCTION;
				this.funcDefinition = func;
				this.exp.foward(func.type.length + 1);
				return;
			}
		}
		for (let property of classExpression.propList) {
			if (this.exp.isBegin(property.name)) {
				this.type = ExpressionComp.TYPE_PROPERTY;
				this.property = property;
				this.exp.foward(property.name.length);
				return;
			}
		}
		if (this.type == null) {
			throw new Error("type not found: " + toString());
		}
	}

	public updateEnd(): boolean {
		if (this.type == ExpressionComp.TYPE_VALUE || this.type == ExpressionComp.TYPE_VARIABLE) {
			if (this.exp.end) {
				this.end = true;
				return true;
			}
			var charExp: CharExpression = CharExpression.findOperator(this.exp.getChar());
			if (charExp && this.value.indexOf(";") == -1) {
				this.charExpEnd = charExp;
				this.exp.next();
				this.end = true;
				return true;
			}
			charExp = CharExpression.find(this.exp.getChar());
			if (this.parent && this.parent.type == ExpressionComp.TYPE_PARENTHESIS
					&& CharExpression.CHAR_PARENTHESIS_END.equals(charExp)) {
				this.charExpEnd = charExp;
				this.exp.next();
				this.end = true;
				return true;
			}
			if (this.parent && this.parent.type == ExpressionComp.TYPE_FUNCTION
					&& (CharExpression.CHAR_PARENTHESIS_END.equals(charExp)
							|| CharExpression.CHAR_COMMA.equals(charExp))) {
				this.charExpEnd = charExp;
				this.exp.next();
				this.end = true;
				return true;
			}
			if (this.parent && this.parent.type == ExpressionComp.TYPE_ARGUMENT
					&& (CharExpression.CHAR_PARENTHESIS_END.equals(charExp)
							|| CharExpression.CHAR_COMMA.equals(charExp))) {
				this.charExpEnd = charExp;
				this.end = true;
				return true;
			}
		}
		return false;
	}
	
	public parse(): void {
		// logger.info("parse:" + content);
		if (this.type == null) {
			this.setType();
		}
		if (this.type == ExpressionComp.TYPE_FUNCTION) {
			if (this.exp.end) {
				throw new Error("Incompleted function: " + this.exp.toString());
			}
			var doParse: boolean = true;
			while (doParse) {
				var expComp: ExpressionComp = ExpressionComp.createFromExpression(this.exp, this);
				this.addChild(expComp);
				expComp.parse();
				if (expComp.getOperator()) {
					expComp.toChild();
					expComp.type = ExpressionComp.TYPE_ARGUMENT;
					expComp.value = null;
					expComp.charExpEnd = null;
					expComp.parse();
				}
				if (!expComp.end) {
					doParse = false;
					throw new Error("Parsing error in: " + expComp.toString());
				} else if (CharExpression.CHAR_PARENTHESIS_END.equals(expComp.charExpEnd)) {
					this.charExpEnd = CharExpression.find(this.exp.getChar());
					if (this.charExpEnd) {
						if (CharExpression.CHAR_POINT.equals(this.charExpEnd)) {
							this.exp.next();
							this.classChild = ExpressionComp.createFromExpression(this.exp, this);
							this.classChild.parseFromClass(ClassExpression.get(this.funcDefinition.result));
							this.charExpEnd = this.classChild.charExpEnd;
						} else if (CharExpression.CHAR_COMMA.equals(this.charExpEnd)) {
							this.exp.next();
						} else if (CharExpression.CHAR_PARENTHESIS_END.equals(this.charExpEnd)
								|| this.charExpEnd.operator != null) {
							this.exp.next();
							this.createRoot();
						} else {
							throw new Error("Parsing error in: " + expComp.toString());
						}
					}
					this.end = true;
					doParse = false;
				}
				if (this.exp.end) {
					doParse = false;
				}
			}
		} else if (this.type == ExpressionComp.TYPE_ARGUMENT) {
			if (this.exp.end) {
				throw new Error("Incompleted function: " + this.exp.toString());
			}
			var doParse: boolean = true;
			while (doParse) {
				var expComp: ExpressionComp = ExpressionComp.createFromExpression(this.exp, this);
				this.addChild(expComp);
				expComp.parse();
				if (!expComp.end) {
					doParse = false;
					throw new Error("Parsing error in: " + expComp.toString());
				} else if (CharExpression.CHAR_COMMA.equals(expComp.charExpEnd)) {
					if (CharExpression.CHAR_COMMA.value === this.exp.getChar()) {
						this.exp.next();
					}
					this.end = true;
					doParse = false;
				} else if (CharExpression.CHAR_PARENTHESIS_END.equals(expComp.charExpEnd)) {
					this.charExpEnd = CharExpression.find(this.exp.getChar());
					if (this.charExpEnd) {
						this.exp.next();
						this.createRoot();
					}
					this.end = true;
					doParse = false;
				}
				if (this.exp.end) {
					doParse = false;
				}
			}
		} else if (this.type == ExpressionComp.TYPE_PARENTHESIS) {
			if (this.exp.end) {
				throw new Error("Incompleted parenthesis bloc: " + this.exp.toString());
			}
			var doParse: boolean = true;
			while (doParse) {
				var expComp: ExpressionComp = ExpressionComp.createFromExpression(this.exp, this);
				this.addChild(expComp);
				expComp.parse();
				if (!expComp.end) {
					doParse = false;
					throw new Error("Parsing error in: " + expComp.toString());
				} else if (CharExpression.CHAR_PARENTHESIS_END.equals(expComp.charExpEnd)) {
					this.charExpEnd = this.exp.end ? null : CharExpression.find(this.exp.getChar());
					if (this.charExpEnd) {
						if (CharExpression.CHAR_PARENTHESIS_END.equals(this.charExpEnd)
								|| this.charExpEnd.operator != null) {
							this.exp.next();
							this.createRoot();
						} else {
							throw new Error("Parsing error in: " + expComp.toString());
						}
					}
					this.end = true;
					doParse = false;
				}
				if (this.exp.end) {
					doParse = false;
				}
			}
		} else if (this.type == ExpressionComp.TYPE_ROOT) {
			if (this.exp.end) {
				throw new Error("Incompleted expression: " + this.exp.toString());
			}
			var doParse: boolean = true;
			while (doParse) {
				var expComp: ExpressionComp = ExpressionComp.createFromExpression(this.exp, this);
				this.addChild(expComp);
				expComp.parse();
				if (!expComp.end) {
					doParse = false;
					throw new Error("Parsing error in: " + expComp.toString());
				}
				if (this.exp.end) {
					doParse = false;
					this.end = true;
				}
			}
		} else if (this.type == ExpressionComp.TYPE_VALUE || this.type == ExpressionComp.TYPE_VARIABLE) {
			var doParse: boolean = true;
			while (doParse) {
				if (this.updateEnd()) {
					if (false && this.type == ExpressionComp.TYPE_VALUE) {
						/*try {
							Float.parseFloat(value);
						} catch (NumberFormatException e) {
							throw new AssemblerException("value bad format: " + value);
						}*/
					}
					doParse = false;
					this.createRoot();
				} else {
					this.appendValue(this.exp.getChar());
					this.exp.next();
				}
			}
		}		
	}
		
	public parseFromClass(classExpression: ClassExpression): void {
		if (this.type == null) {
			this.setTypeFromClass(classExpression);
		}
		if (this.type == ExpressionComp.TYPE_FUNCTION) {
			if (this.exp.end) {
				throw new Error("Incompleted function: " + this.exp.toString());
			}
			var doParse: boolean = true;
			while (doParse) {
				var expComp: ExpressionComp = ExpressionComp.createFromExpression(this.exp, this);
				if (this.funcDefinition.argumentCount() > 0) {
					this.addChild(expComp);
					expComp.parse();
					if (expComp.getOperator()) {
						expComp.toChild();
						expComp.type = ExpressionComp.TYPE_ARGUMENT;
						expComp.value = null;
						expComp.charExpEnd = null;
						expComp.parse();
					}
				} else {
					expComp.charExpEnd = CharExpression.find(this.exp.getChar());
					if (CharExpression.CHAR_PARENTHESIS_END.equals(expComp.charExpEnd)) {
						expComp.end = true;
						this.exp.next();
						doParse = false;
					} else {
						throw new Error("Parsing error in: " + expComp.toString());
					}
				}
				if (!expComp.end) {
					doParse = false;
					throw new Error("Parsing error in: " + expComp.toString());
				} else if (CharExpression.CHAR_PARENTHESIS_END.equals(expComp.charExpEnd)) {
					this.charExpEnd = this.exp.end ? null : CharExpression.find(this.exp.getChar());
					if (this.charExpEnd) {
						if (CharExpression.CHAR_POINT.equals(this.charExpEnd)) {
							this.exp.next();
							this.classChild = ExpressionComp.createFromExpression(this.exp, this);
							this.classChild.parseFromClass(classExpression);
							this.charExpEnd = this.classChild.charExpEnd;
						} else if (CharExpression.CHAR_PARENTHESIS_END.equals(this.charExpEnd)
								|| this.charExpEnd.operator != null) {
							this.exp.next();
							this.createRoot();
						} else {
							throw new Error("Parsing error in: " + expComp.toString());
						}
					}
					this.end = true;
					doParse = false;
				}
				if (this.exp.end) {
					doParse = false;
				}
			}
		} else if (this.type == ExpressionComp.TYPE_PROPERTY) {
			this.charExpEnd = this.exp.end ? null : CharExpression.find(this.exp.getChar());
			if (this.charExpEnd) {
				if (CharExpression.CHAR_POINT.equals(this.charExpEnd)) {
					this.exp.next();
					this.classChild = ExpressionComp.createFromExpression(this.exp, this);
					this.classChild.parse();
					this.charExpEnd = this.classChild.charExpEnd;
				} else if (CharExpression.CHAR_PARENTHESIS_END.equals(this.charExpEnd) || this.charExpEnd.operator != null) {
					this.exp.next();
					this.createRoot();
				} else {
					throw new Error("Parsing error in: " + this.classChild.toString());
				}
			}
			this.end = true;
		}
	}

	public createRoot(): void {
		if (this.parent == null && this.getOperator() != null) {
			this.toChild();
			this.type = ExpressionComp.TYPE_ROOT;
			this.value = null;
			this.charExpEnd = null;
			this.parse();
		}
	}

	public getOperator(): number {
		return this.charExpEnd == null ? null : this.charExpEnd.operator;
	}

	public getValueClassExpression(): ClassExpression {
		if (FormatUtils.isInt(this.value)) {
			return ClassExpression.INTEGER;
		} else if (FormatUtils.isFloat(this.value)) {
			return ClassExpression.FLOAT;
		} else {
			return ClassExpression.STRING;
		}
	}

	public getClassExpression(): ClassExpression {
		if (this.type == ExpressionComp.TYPE_VALUE) {
			return this.getValueClassExpression();
		} else if (this.type == ExpressionComp.TYPE_VARIABLE) {
			// variables are subsituted before
			/*FuncValue result =  exp.getValueCollection() == null ? FuncValue.getStringResult(value)
					: exp.getValueCollection().getValue(value.substring(1));
			return result.getClassExpression();*/
		} else if (this.type == ExpressionComp.TYPE_PARENTHESIS 
						|| this.type == ExpressionComp.TYPE_ARGUMENT || this.type == ExpressionComp.TYPE_ROOT) {
			var result: ClassExpression = null;
			var operator: number = null;
			for (let child of this.children) {
				if (result == null) {
					result = child.getClassExpression();
				} else {
					var opExp: OperatorExpression = OperatorExpression.getOperator(result, child.getClassExpression(),
							operator);
					if (opExp) {
						result = opExp.result;
					} else {
						throw new Error("incompatible format for expression: " + this.content);
					}
				}
				operator = child.getOperator();
			}
			return result;
		} else if (this.type == ExpressionComp.TYPE_FUNCTION) {
			// validate argument format
			if (this.funcDefinition) {
				if (this.funcDefinition.mandatoryCount() > this.children.length
						|| this.funcDefinition.Param.length < this.children.length) {
					throw new Error("bad argument number for function expression: " + this.content);
				} else {
					for (let u = 0; u < this.children.length; u++) {
						var classExpression: ClassExpression = this.getClassExpressionByRange(u);
						if (classExpression != null
								&& !classExpression.compatible(this.children[u].getClassExpression())) {
							throw new Error("bad argument format(" + this.children[u].content
									+ ") for function expression " + this.content);
						}
					}
				}
				// TODO: class children
				return ClassExpression.get(this.funcDefinition.result);
			} else {
				if (this.children.length == 1) {
					if (!ClassExpression.FLOAT.compatible(this.children[0].getClassExpression())) {
						throw new Error("func " + this.funcImpl.name + " requires a float argument");
					}
				} else {
					throw new Error("func " + this.funcImpl.name + " requires 1 argument");
				}
				return ClassExpression.FLOAT;
			}
		}
		return null;
	}

	public getClassExpressionByParam(param: Param): ClassExpression {
		if (param.value) {
			var values: string[] = param.value.split(";");
			if (values.length == 2) {
				return ClassExpression.get(values[1]);
			}
		}
		return null;
	}

	public getClassExpressionByName(name: string): ClassExpression {
		return this.getClassExpressionByParam(this.funcDefinition.getParam(name));
	}
	
	public getClassExpressionByRange(u: number): ClassExpression {
		return this.getClassExpressionByParam(this.funcDefinition.Param[u]);
	}

	public getResult(): FuncValue {
		return this.getResultFromParent(null);
	}

	public getResultFromParent(parent: FuncValue): FuncValue {
		OperatorExpression.init();
		ClassExpression.init();
		if (this.type == ExpressionComp.TYPE_VALUE) {
			var intValue: number = FormatUtils.toStrictInt(this.value);
			if (!isNaN(intValue)) {
				return FuncValue.createFromInt(intValue);
			}
			var floatValue: number = FormatUtils.toStrictFloat(this.value);
			if (!isNaN(floatValue)) {
				return FuncValue.createFromFloat(floatValue);
			}
			return FuncValue.createFromString(this.value);
		/*} else if (this.type == ExpressionComp.TYPE_VARIABLE) {
			return exp.getValueCollection() == null ? FuncValue.getStringResult(value)
					: exp.getValueCollection().getValue(value.substring(1));*/
		} else if (this.type == ExpressionComp.TYPE_PARENTHESIS || this.type == ExpressionComp.TYPE_ARGUMENT || this.type == ExpressionComp.TYPE_ROOT) {
			var result: FuncValue = null;
			var product: FuncValue = null;
			var operator: number = null;
			var productOperator: number = null;
			for (let child of this.children) {
				if (result == null) {
					result = child.getResult();
				} else {
					var childResult: FuncValue = child.getResult();
					if ((operator == CharExpression.OPERATOR_SUM || operator == CharExpression.OPERATOR_DIFF)
							&& (child.getOperator() == CharExpression.OPERATOR_DIV
									|| child.getOperator() == CharExpression.OPERATOR_PRODUCT)) {
						product = childResult;
						productOperator = operator;
					} else {
						var opExp: OperatorExpression = OperatorExpression.getOperator(
								product == null ? ClassExpression.get(result.type) : ClassExpression.get(product.type),
								ClassExpression.get(childResult.type), operator);
						if (opExp) {
							if (product == null) {
								result = opExp.execute(result, childResult);
							} else {
								product = opExp.execute(product, childResult);
							}
						} else {
							throw new Error("incompatible format for expression: " + this.content);
						}
					}
				}
				operator = child.getOperator();
				if (product != null && (operator == null || operator == CharExpression.OPERATOR_SUM
						|| operator == CharExpression.OPERATOR_DIFF)) {
					var opExp: OperatorExpression = OperatorExpression.getOperator(ClassExpression.get(result.type),
							ClassExpression.get(product.type), productOperator);
					if (opExp) {
						result = opExp.execute(result, product);
					} else {
						throw new Error("incompatible format for expression: " + this.content);
					}

				}
			}
			return result;
		} else if (this.type == ExpressionComp.TYPE_FUNCTION) {
			this.validateArgumentFormat();
			var result: FuncValue = null;
			if (parent == null) {
				if (result == null) {
					var argList: FuncValue[] = this.getChildrenResult();
					if (this.funcDefinition) {
						var func: FuncExpression = FunctionUtils.getFuncExpression(this.funcDefinition.createFuncParam(argList));
						result = func == null ? null : func.getResult();
					/*} else if (funcImpl != null) {
						result = new FuncValue(funcImpl.getValue(argList.get(0).getFloat()));*/
					}
				}
			} else {
				result = ClassExpression.getFuncValue(parent, this.funcDefinition.createFuncParam(this.getChildrenResult()));
			}
			return this.classChild == null ? result : this.classChild.getResultFromParent(result);
		} else if (this.type == ExpressionComp.TYPE_PROPERTY) {
			return ClassExpression.getPropertyResult(parent, this.property);
		}
		return null;
	}
	
	public validateArgumentFormat(): void {
		// validate argument format
		if (this.funcDefinition) {
			if (this.funcDefinition.mandatoryCount() > this.children.length
					|| this.funcDefinition.Param.length < this.children.length) {
				throw new Error("bad argument number for function expression: " + this.content);
			} else {
				for (let u = 0; u < this.children.length; u++) {
					var classExpression: ClassExpression = this.getClassExpressionByRange(u);
					if (classExpression != null && !classExpression.compatible(this.children[u].getClassExpression())) {
						throw new Error("bad argument format(" + this.children[u].content
								+ ") for function expression " + this.content);
					}
				}
			}
		} else {
			if (this.children.length == 1) {
				if (!ClassExpression.FLOAT.compatible(this.children[0].getClassExpression())) {
					throw new Error("func " + this.funcImpl.name + " requires a float argument");
				}
			} else {
				throw new Error("func " + this.funcImpl.name + " requires 1 argument");
			}
		}
	}
	
	public toChild(): ExpressionComp {
		var result: ExpressionComp = new ExpressionComp(this.type);
		result.content = this.exp.toString();
		result.charExpEnd =  this.charExpEnd;
		result.end = this.end;
		result.exp = this.exp;
		result.funcDefinition = this.funcDefinition;
		this.funcDefinition = null;
		result.parent = this;
		result.value = this.value;
		result.children = this.children;
		this.children = [];
		this.addChild(result);
		return result;
	}
	
	public addChild(comp: ExpressionComp): void {
		this.children.push(comp);
	}
	
	public getChildrenResult(): FuncValue[] {
		for(let child of this.children) {
			this.childrenResult.push(child.getResult())
		}
		return this.childrenResult;
	}
	
	public trace(tab: string): void {
		var list: string[] = [ "", "PARENTESIS", "FUNCTION", "ARGUMENT", "VALUE", "VARIABLE", "PROPERTY", "ROOT" ];
		if (this.type == null) {
			console.log(tab + "undefined type");
		} else {
			console.log(tab + list[this.type] + (this.funcDefinition == null ? "" : " " + this.funcDefinition.type)
					+ (this.value == null ? "" : "; value: " + this.value)
					+ (this.charExpEnd == null ? "" : "; charEnd: " + this.charExpEnd.value));
		}
		if (this.children) {
			for (let child of this.children) {
				child.trace(tab + "  ");
			}
		}
		if (this.classChild) {
			this.classChild.trace(tab + "  ");
		}
	}
	
	public getTypeString(): string {
		switch (this.type) {
		case ExpressionComp.TYPE_ARGUMENT:
			return "argument";
		case ExpressionComp.TYPE_FUNCTION:
			return "function";
		case ExpressionComp.TYPE_PARENTHESIS:
			return "parenthesis";
		case ExpressionComp.TYPE_PROPERTY:
			return "property";
		case ExpressionComp.TYPE_ROOT:
			return "root";
		case ExpressionComp.TYPE_VALUE:
			return "value";
		case ExpressionComp.TYPE_VARIABLE:
			return "variable";
		}
		return "undefined";
	}

	public toString(): string {
		return "content: " + this.content + "; type: " + this.getTypeString()
				+ (this.funcDefinition == null ? "" : "; function: " + this.funcDefinition.type) + "; value: " + this.value
				+ "; charExpEnd: " + (this.charExpEnd == null ? "null" : this.charExpEnd.value) + "; children: "
				+ this.children.length;
	}

	public funcToString(): string {
		var func: Func = this.funcDefinition.createFuncParam(this.getChildrenResult());
		var result: string = func.type + "(";
		for (let param of func.Param) {
			result += param.name + "=" + param.value + ", ";
		}
		return result = result.substring(0, result.length - 2) + ")";
	}
	public getFunc(): Func {
		return this.funcDefinition.createFuncParam(this.getChildrenResult());
	}
}