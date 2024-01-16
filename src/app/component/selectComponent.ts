import { SelectOption } from "../component/selectOption";

export class SelectComponent {
	
	public optionList: SelectOption[] = [];
	
	constructor() {}
	
	public clear(): void {
		this.optionList = [];
	}
	
	public addOption(selectOption: SelectOption): void {
		this.optionList.push(selectOption);
	}
	
	public select(value: string): SelectOption {
		var result: SelectOption = null;
		for(let option of this.optionList) {
			option.selected = value === option.value ? "selected" : "";
			if (value === option.value) {
				result = option;
			}
		}
		return result;
	}

}