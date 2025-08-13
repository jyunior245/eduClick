export interface EditarPerfilTemplateParams {
  usuario?: any;
  onSubmit?: string;
  errorMessage?: string;
}

export class EditarPerfilTemplate {
  static render(params: EditarPerfilTemplateParams = {}): string {
    const usuario = params.usuario || {};
    
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow-lg border-0 rounded-4">
              <div class="card-header bg-primary text-white rounded-top-4">
                <h3 class="mb-0">
                  <i class="bi bi-person-gear"></i> Editar Perfil
                </h3>
              </div>
              <div class="card-body p-4">
                ${params.errorMessage ? `<div class='alert alert-danger'>${params.errorMessage}</div>` : ''}
                <div class="mb-4 text-center">
                  <div class="d-inline-block position-relative">
                    <img id="foto-preview" src="${usuario.fotoUrl || 'https://placehold.co/160x160?text=Foto'}" alt="Foto de perfil" class="rounded-circle border" style="width: 160px; height: 160px; object-fit: cover;">
                  </div>
                  <div class="mt-2">
                    <input type="file" id="foto" accept="image/*" class="form-control" style="max-width: 340px; margin: 0 auto;">
                    <small class="text-muted d-block mt-1">Tamanho máximo 5MB. Formatos: JPG, PNG.</small>
                  </div>
                </div>
                <form id="form-editar-perfil" onsubmit="${params.onSubmit || 'handleEditarPerfilSubmit'}(event)">
                  <div class="row g-3">
                    <div class="col-md-6 mb-3">
                      <label for="nome" class="form-label">Nome Completo</label>
                      <input type="text" class="form-control" id="nome" name="nome" value="${usuario.nome || ''}" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="telefone" class="form-label">Telefone</label>
                      <input type="tel" class="form-control" id="telefone" name="telefone" value="${usuario.telefone || ''}" placeholder="(11) 99999-9999">
                    </div>
                  </div>
                  <div class="row g-3">
                    <div class="col-md-6 mb-3">
                      <label for="especialidade" class="form-label">Especialidade</label>
                      <input type="text" class="form-control" id="especialidade" name="especialidade" value="${usuario.especialidade || ''}" placeholder="Ex: Matemática, Física, etc.">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="formacao" class="form-label">Formação</label>
                      <input type="text" class="form-control" id="formacao" name="formacao" value="${usuario.formacao || ''}" placeholder="Ex: Licenciatura em Matemática, Mestrado, etc.">
                    </div>
                  </div>
                  <div class="row g-3">
                    <div class="col-md-6 mb-3">
                      <label for="experiencia" class="form-label">Experiência</label>
                      <input type="text" class="form-control" id="experiencia" name="experiencia" value="${usuario.experiencia || ''}" placeholder="Ex: 10 anos de ensino, aulas particulares, etc.">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="linkUnico" class="form-label">Link Único</label>
                      <input type="text" class="form-control" id="linkUnico" name="linkUnico" value="${usuario.linkUnico || ''}" placeholder="seu-link-unico">
                    </div>
                  </div>
                  <div class="d-flex gap-2 mt-3">
                    <button type="submit" class="btn btn-primary px-4">
                      <i class="bi bi-check-circle"></i> Salvar Alterações
                    </button>
                    <a href="/dashboard" class="btn btn-outline-secondary px-4">
                      <i class="bi bi-arrow-left"></i> Voltar
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
} 
