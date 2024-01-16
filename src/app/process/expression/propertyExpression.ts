import { ClassExpression } from './ClassExpression';

export class PropertyExpression {
	
	public name: string;
	public result: ClassExpression;
	
	constructor(name: string, result: ClassExpression) {
		this.name = name;
		this.result = result;
	}
	
}