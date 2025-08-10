"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
class Button {
    static render(props) {
        const { text, type = 'button', variant = 'primary', size = 'md', disabled = false, icon, className = '', id = '' } = props;
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
    static renderWithClick(props) {
        const buttonHtml = this.render(props);
        if (props.onClick) {
            return buttonHtml.replace('<button', `<button onclick="(${props.onClick.toString()})()"`);
        }
        return buttonHtml;
    }
}
exports.Button = Button;
