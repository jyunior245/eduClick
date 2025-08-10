"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditarPerfilProfessorPage = void 0;
class EditarPerfilProfessorPage {
    static render(professor) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return `
      <div class="container-fluid bg-light min-vh-100">
        <div class="container py-4">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-8">
              <div class="card shadow">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h4 class="mb-0"><i class="bi bi-person-gear"></i> Editar Perfil do Professor</h4>
                  <button class="btn btn-outline-light btn-sm" id="btn-voltar-header">
                    <i class="bi bi-arrow-left"></i> Voltar
                  </button>
                </div>
                <div class="card-body p-4">
                  <form id="editar-perfil-form">
                    <div class="row">
                      <!-- Informações Básicas -->
                      <div class="col-md-6">
                        <h5 class="mb-3"><i class="bi bi-person"></i> Informações Básicas</h5>
                        <div class="mb-3">
                          <label for="nome" class="form-label">Nome Completo</label>
                          <input type="text" class="form-control" id="nome" name="nome" value="${professor.nome || ''}" required autocomplete="name">
                        </div>
                        <div class="mb-3">
                          <label for="email" class="form-label">Email</label>
                          <input type="email" class="form-control" id="email" name="email" value="${professor.email || ''}" required autocomplete="email">
                        </div>
                        <div class="mb-3">
                          <label for="telefone" class="form-label">Telefone</label>
                          <input type="tel" class="form-control" id="telefone" name="telefone" value="${professor.telefone || ''}" autocomplete="tel">
                        </div>
                      </div>
                      <!-- Foto de Perfil -->
                      <div class="col-md-6">
                        <h5 class="mb-3"><i class="bi bi-camera"></i> Foto de Perfil</h5>
                        <div class="text-center mb-3">
                          <img id="preview-foto" src="${professor.fotoPerfil || 'https://via.placeholder.com/150x150?text=Sem+Foto'}" alt="Foto de Perfil" class="rounded-circle shadow" style="width: 120px; height: 120px; object-fit: cover;">
                        </div>
                        <div class="mb-3">
                          <label for="fotoPerfil" class="form-label">URL da Foto</label>
                          <input type="url" class="form-control" id="fotoPerfil" name="fotoPerfil" value="${professor.fotoPerfil || ''}" placeholder="https://exemplo.com/foto.jpg" autocomplete="photo">
                          <div class="form-text">Cole aqui o link da sua foto de perfil</div>
                        </div>
                      </div>
                    </div>
                    <hr class="my-4">
                    <!-- Informações Profissionais -->
                    <div class="row">
                      <div class="col-12">
                        <h5 class="mb-3"><i class="bi bi-briefcase"></i> Informações Profissionais</h5>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="descricao" class="form-label">Descrição Profissional</label>
                          <textarea class="form-control" id="descricao" name="descricao" rows="4" placeholder="Conte um pouco sobre sua experiência e especialidades...">${professor.descricao || ''}</textarea>
                        </div>
                        <div class="mb-3">
                          <label for="formacao" class="form-label">Formação Acadêmica</label>
                          <input type="text" class="form-control" id="formacao" name="formacao" value="${professor.formacao || ''}" placeholder="Ex: Licenciatura em Matemática" autocomplete="organization-title">
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="conteudosDominio" class="form-label">Áreas de Atuação</label>
                          <input type="text" class="form-control" id="conteudosDominio" name="conteudosDominio" value="${((_a = professor.conteudosDominio) === null || _a === void 0 ? void 0 : _a.join(', ')) || ''}" placeholder="Ex: Matemática, Física, Química" autocomplete="off">
                          <div class="form-text">Separe as áreas por vírgula</div>
                        </div>
                        <div class="mb-3">
                          <label for="experiencia" class="form-label">Anos de Experiência</label>
                          <input type="number" class="form-control" id="experiencia" name="experiencia" value="${professor.experiencia || ''}" min="0" max="50" autocomplete="off">
                        </div>
                      </div>
                    </div>
                    <hr class="my-4">
                    <!-- Configurações de Agendamento -->
                    <div class="row">
                      <div class="col-12">
                        <h5 class="mb-3"><i class="bi bi-calendar-check"></i> Configurações de Agendamento</h5>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label for="valorPadrao" class="form-label">Valor Padrão por Aula (R$)</label>
                          <input type="number" class="form-control" id="valorPadrao" name="valorPadrao" value="${professor.valorPadrao || ''}" step="0.01" min="0" autocomplete="off">
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label for="duracaoPadrao" class="form-label">Duração Padrão (minutos)</label>
                          <input type="number" class="form-control" id="duracaoPadrao" name="duracaoPadrao" value="${professor.duracaoPadrao || ''}" min="30" step="30" autocomplete="off">
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label for="maxAlunosPadrao" class="form-label">Máximo de Alunos Padrão</label>
                          <input type="number" class="form-control" id="maxAlunosPadrao" name="maxAlunosPadrao" value="${professor.maxAlunosPadrao || ''}" min="1" max="20" autocomplete="off">
                        </div>
                      </div>
                    </div>
                    <hr class="my-4">
                    <!-- Configurações de Disponibilidade -->
                    <div class="row">
                      <div class="col-12">
                        <h5 class="mb-3"><i class="bi bi-clock"></i> Configurações de Disponibilidade</h5>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label class="form-label">Dias da Semana Disponíveis</label>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="segunda" name="diasDisponiveis" value="segunda" ${((_b = professor.diasDisponiveis) === null || _b === void 0 ? void 0 : _b.includes('segunda')) ? 'checked' : ''}>
                            <label class="form-check-label" for="segunda">Segunda-feira</label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="terca" name="diasDisponiveis" value="terca" ${((_c = professor.diasDisponiveis) === null || _c === void 0 ? void 0 : _c.includes('terca')) ? 'checked' : ''}>
                            <label class="form-check-label" for="terca">Terça-feira</label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="quarta" name="diasDisponiveis" value="quarta" ${((_d = professor.diasDisponiveis) === null || _d === void 0 ? void 0 : _d.includes('quarta')) ? 'checked' : ''}>
                            <label class="form-check-label" for="quarta">Quarta-feira</label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="quinta" name="diasDisponiveis" value="quinta" ${((_e = professor.diasDisponiveis) === null || _e === void 0 ? void 0 : _e.includes('quinta')) ? 'checked' : ''}>
                            <label class="form-check-label" for="quinta">Quinta-feira</label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="sexta" name="diasDisponiveis" value="sexta" ${((_f = professor.diasDisponiveis) === null || _f === void 0 ? void 0 : _f.includes('sexta')) ? 'checked' : ''}>
                            <label class="form-check-label" for="sexta">Sexta-feira</label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="sabado" name="diasDisponiveis" value="sabado" ${((_g = professor.diasDisponiveis) === null || _g === void 0 ? void 0 : _g.includes('sabado')) ? 'checked' : ''}>
                            <label class="form-check-label" for="sabado">Sábado</label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="domingo" name="diasDisponiveis" value="domingo" ${((_h = professor.diasDisponiveis) === null || _h === void 0 ? void 0 : _h.includes('domingo')) ? 'checked' : ''}>
                            <label class="form-check-label" for="domingo">Domingo</label>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="horarioInicio" class="form-label">Horário de Início</label>
                          <input type="time" class="form-control" id="horarioInicio" name="horarioInicio" value="${professor.horarioInicio || '08:00'}" autocomplete="off">
                        </div>
                        <div class="mb-3">
                          <label for="horarioFim" class="form-label">Horário de Fim</label>
                          <input type="time" class="form-control" id="horarioFim" name="horarioFim" value="${professor.horarioFim || '18:00'}" autocomplete="off">
                        </div>
                        <div class="mb-3">
                          <label for="intervaloAulas" class="form-label">Intervalo entre Aulas (minutos)</label>
                          <input type="number" class="form-control" id="intervaloAulas" name="intervaloAulas" value="${professor.intervaloAulas || '30'}" min="0" max="120" autocomplete="off">
                        </div>
                      </div>
                    </div>
                    <div class="d-flex justify-content-end mt-4">
                      <button type="submit" class="btn btn-success">Salvar Alterações</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
}
exports.EditarPerfilProfessorPage = EditarPerfilProfessorPage;
