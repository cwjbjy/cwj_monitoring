export default abstract class DefinePlugin {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
  /**监听逻辑收集数据 */
  abstract monitor(): void;
}
