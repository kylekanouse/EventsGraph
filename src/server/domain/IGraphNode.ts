export default interface IGraphNode {
  id: string,
  group: number,
  label: string,
  val: number,
  desc: string,
  icon: string,
  type: string,
  url: string,
  color?: string,
  image?: string
}