import { Info } from './assembler/info';
import { FormatUtils } from '../process/utils/formatUtils';

export class Content {
    public Info: Info[] = [];

    constructor() {}
	
	public createFromJson(data: any): void {
		if( data.Info) {
			for(let infoData of data.Info) {
				this.addInfo(infoData.name, infoData.value);			
			}
		}
	}
	
	public addInfo(name:string, value:string): void {
		this.Info.push(new Info(name, value));
	}
	
	public getInfo(name:string): Info {
		for(let info of this.Info) {
			if( info.name == name) {
				return info;
			}
		}
		return null;
	}
	
	public getInfoValue(name: string): string {
		var info: Info = this.getInfo(name);
		return info ? info.value : null;
	}
	
	public getInfoIntValue(name: string): number {
		var info: Info = this.getInfo(name);
		return info ? FormatUtils.toInt(info.value) : null;
	}
	
	public getInfoFloatValue(name: string): number {
		var info: Info = this.getInfo(name);
		return info ? FormatUtils.toFloat(info.value) : null;
	}
	
	public getInfoBoolValue(name: string): boolean {
		var info: Info = this.getInfo(name);
		return info ? FormatUtils.toBool(info.value) : null;
	}
	
	public updateInfo(name: string, value : string): void {
		var info = this.getInfo(name);
		if( info != null ) {
			info.value = value
		}
	}

}
