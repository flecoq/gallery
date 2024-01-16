export class SystemExplorerConfig {
	public distance: number;
	public size: number;
	public scene: string;
	public url: string;
	public filename: string;
	
	public constructor(distance: number, size: number, scene: string) {
		this.distance = distance;
		this.size = size;
		this.scene = scene;
	}
}
