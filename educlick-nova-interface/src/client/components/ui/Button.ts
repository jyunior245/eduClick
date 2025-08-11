export interface ButtonProps {
  text: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: string;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export class Button {
  static render(props: ButtonProps): string {
    const {
      text,
      type = 'button',
      variant = 'primary',
      size = 'md',
      disabled = false,
      icon,
      className = '',
      id = ''
    } = props;

    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const iconHtml = icon ? `<i class="${icon}"></i> ` : '';
    const idAttr = id ? `id="${id}"` : '';

    return `
      <button 
        type="${type}" 
        class="btn btn-${variant} ${sizeClass} ${className}" 
        ${disabledAttr}
        ${idAttr}
      >
        ${iconHtml}${text}
      </button>
    `;
  }

  static renderWithClick(props: ButtonProps): string {
    const buttonHtml = this.render(props);
    if (props.onClick) {
      return buttonHtml.replace(
        '<button',
        `<button onclick="(${props.onClick.toString()})()"`
      );
    }
    return buttonHtml;
  }
} 