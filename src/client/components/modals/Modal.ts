export interface ModalProps {
  id: string;
  title: string;
  content: string;
  footer?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
}

export class Modal {
  static render(props: ModalProps): string {
    const {
      id,
      title,
      content,
      footer = '',
      size = 'md',
      closeButton = true
    } = props;

    const sizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : '';
    const closeButtonHtml = closeButton ? 
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>' : '';

    return `
      <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}Label" aria-hidden="true">
        <div class="modal-dialog ${sizeClass}">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${id}Label">${title}</h5>
              ${closeButtonHtml}
            </div>
            <div class="modal-body">
              ${content}
            </div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  static renderFormModal(props: ModalProps & { formId: string }): string {
    const { formId, footer = '', ...modalProps } = props;
    
    const formContent = `
      <form id="${formId}">
        ${modalProps.content}
        ${footer ? `<div class='modal-footer'>${footer}</div>` : ''}
      </form>
    `;

    return this.render({
      ...modalProps,
      content: formContent,
      footer: '' // Não renderizar footer fora do form
    });
  }
} 