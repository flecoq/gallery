import { Info } from './info';
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FormatUtils } from '../../process/utils/formatUtils';
import { Point } from '../../process/utils/point';
import { CreationIndex } from '../../process/scene/mesh/material/mapping/creationIndex';

export class Creation {
    public id: string;
    public filename: string;
    public Info: Info[] = [];
	public groupId: string;

    constructor() {}
	
	public createFromJson(data: any, groupId: string): void {
		this.id = data.id;
		this.filename = data.filename;
		this.groupId = groupId;
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
	
	public getInfoVectorValue(name: string): Vector3 {
		var info: Info = this.getInfo(name);
		return info ? FormatUtils.toVector(info.value) : null;
	}
	
	public getInfoPointValue(name: string): Point {
		var info: Info = this.getInfo(name);
		return info ? FormatUtils.toPoint(info.value) : null;
	}
	
	public getInfoBoolValue(name: string): boolean {
		var info: Info = this.getInfo(name);
		return info ? FormatUtils.toBool(info.value) : null;
	}
	
	public addOrUpdateInfo(name: string, value : string): void {
		var info = this.getInfo(name);
		if( info != null ) {
			info.value = value
		} else {
			this.Info.push(new Info(name, value));
		}
	}
	
	public getLayerList() {
		var value = this.getInfoValue("layer.list");
		return value ? value.split(";") : null;
	}
	
	public getSizeList() {
		var value = this.getInfoValue("size.list");
		return value ? value.split(";") : null;
	}
	
	public getListCount(): number {
		return this.getInfoIntValue("list.count");
	}
	
	public getSizebyQuality(quality: string): string {
		var sizeList: string[] = this.getSizeList();
		if( sizeList.length > 0) {
			if( quality === "low") {
				return sizeList[0];
			} else if( quality === "medium") {
				return sizeList[1];
			} else if( quality === "hight") {
				return sizeList[sizeList.length-1];
			} else {
				return sizeList[1];
			}
		}
		return null;
	}
	
	public getFilenameByIndex(index: CreationIndex): string {
		var values: string[] = this.filename.split(".");
		var result: string = values[0];
		if( index.list && index.list > 0 )  {
			result += "_" + index.list;
		} else if( this.getListCount() ) {
			result += "_1";
		}
		if( index.layer &&  index.layer.length > 0)  {
			result += "_" + index.layer;
		}
		if( index.size &&  index.size.length > 0)  {
			result += "_" + index.size;
		}
		return result + "." + values[1];
	}
	
	public getUrl() : string {
		return "./assembler/" + this.filename;
	}
	
	public getUrlByIndex(index: CreationIndex) : string {
		return "./assembler/" + this.getFilenameByIndex(index);
	}
	
	public getType(): string {
		return this.getInfo("type").value;
	}

	public getRatio(): number {
		var size: Point = this.getInfoPointValue("size");
		return size == null ? 1 : size.y / size.x;
	}

	public getSize(): Point {
		return this.getInfoPointValue("size");
	}
	
	public widthToHeight(value: number): number {
		return value * this.getRatio();
	}
	
	public heightToWidth(value: number): number {
		return value / this.getRatio();
	}
	
	public getThumbUrl() : string {
		var type = this.getType();
		if( type === "picture" || type === "texture" ) {
			var thumb: string = this.getInfoValue("thumb");
			return thumb ? "./assembler/" + thumb : this.getUrl();
		} else if( type === "object") {
			return "./assembler/" + this.getInfoValue("url") + "thumb.png";
		}
	}
	
	public static createCreation(id: string, filename: string, size: string, type: string): Creation {
		var result: Creation = new Creation();
		result.id = id;
		result.filename = filename;
		result.addInfo("size", size);
		result.addInfo("type", type);
		return result;
	}

}
