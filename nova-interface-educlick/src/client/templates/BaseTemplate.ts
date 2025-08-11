export interface BaseTemplateProps {
  title: string;
  content: string;
  header?: string;
  footer?: string;
  containerClass?: string;
  bodyClass?: string;
}

export class BaseTemplate {
  static render(props: BaseTemplateProps): string {
    const {
      title,
      content,
      header = '',
      footer = '',
      containerClass = 'container-fluid bg-light min-vh-100',
      bodyClass = 'container py-4'
    } = props;

    return `
      <div class="${containerClass}">
        ${header}
        <div class="${bodyClass}">
          ${content}
        </div>
        ${footer}
      </div>
    `;
  }

  static renderWithTitle(props: BaseTemplateProps): string {
    const { title, ...templateProps } = props;
    
    const titleContent = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold mb-0">${title}</h2>
      </div>
    `;

    return this.render({
      ...templateProps,
      title,
      content: titleContent + templateProps.content
    });
  }
} 