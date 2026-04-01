export class ElementHelper {
  static isTextContentValid(content: unknown): content is string | number {
    return (typeof content === 'string' && content.trim() !== '') || (typeof content === 'number' && !isNaN(content))
  }
}
