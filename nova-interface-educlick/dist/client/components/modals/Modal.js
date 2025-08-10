"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = void 0;
class Modal {
    static render(props) {
        const { id, title, content, footer = '', size = 'md', closeButton = true } = props;
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
    static renderFormModal(props) {
        const { formId, footer = '' } = props, modalProps = __rest(props, ["formId", "footer"]);
        const formContent = `
      <form id="${formId}">
        ${modalProps.content}
        ${footer ? `<div class='modal-footer'>${footer}</div>` : ''}
      </form>
    `;
        return this.render(Object.assign(Object.assign({}, modalProps), { content: formContent, footer: '' // Não renderizar footer fora do form
         }));
    }
}
exports.Modal = Modal;
