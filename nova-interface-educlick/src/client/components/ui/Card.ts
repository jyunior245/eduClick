
export interface CardProps {
  title?: string;
  content: string;
  footer?: string;
  className?: string;
  id?: string;
  headerActions?: string;
}

export class Card {
  static render(props: CardProps): string {
    const {
      title,
      content,
      footer,
      className = '',
      id = '',
      headerActions = ''
    } = props;

    const idAttr = id ? `id="${id}"` : '';
    const titleHtml = title ? `
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="card-title mb-0">${title}</h6>
        ${headerActions}
      </div>
    ` : '';
    const footerHtml = footer ? `<div class="card-footer">${footer}</div>` : '';

    return `
      <div class="card h-100 shadow-sm ${className}" ${idAttr}>
        ${titleHtml}
        <div class="card-body">
          ${content}
        </div>
        ${footerHtml}
      </div>
    `;
  }
} 