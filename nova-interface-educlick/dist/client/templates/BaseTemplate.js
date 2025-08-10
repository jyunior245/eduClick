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
exports.BaseTemplate = void 0;
class BaseTemplate {
    static render(props) {
        const { title, content, header = '', footer = '', containerClass = 'container-fluid bg-light min-vh-100', bodyClass = 'container py-4' } = props;
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
    static renderWithTitle(props) {
        const { title } = props, templateProps = __rest(props, ["title"]);
        const titleContent = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold mb-0">${title}</h2>
      </div>
    `;
        return this.render(Object.assign(Object.assign({}, templateProps), { title, content: titleContent + templateProps.content }));
    }
}
exports.BaseTemplate = BaseTemplate;
