export default interface IGraphEvent {
  id: number,
  target: string,
  source: string,
  action: string,
  category: string,
  label?: string,
  value?: number,
  type?: string
}