import { Point } from "../../process/utils/point";

export class SnapshotServer {
    public filename: string;
    public content: any;
	public width: number;
	public height: number;

    constructor(filename: string, size: Point, data: any) {
		this.filename = filename;
		this.width = size.x;
		this.height = size.y
		this.content = data;
	}
}
