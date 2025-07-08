import { getPerfilProfessor, editarPerfilProfessor } from '../services/api';
import { mostrarToast } from '../components/Toast';
import { renderHeader } from '../components/Header';
import { renderFooter } from '../components/Footer';
import { EditarPerfilProfessorPage as EditarPerfilView } from '../../presentation/views/pages/EditarPerfilProfessorPage';

export function renderEditarPerfilProfessorPage(root: HTMLElement) {
  getPerfilProfessor()
    .then(res => res.json())
    .then(professor => {
      root.innerHTML = EditarPerfilView.render(professor);
      // Configurar preview da foto
      const fotoInput = document.getElementById('fotoPerfil') as HTMLInputElement;
      const previewFoto = document.getElementById('preview-foto') as HTMLImageElement;
      if (fotoInput && previewFoto) {
        fotoInput.addEventListener('input', () => {
          if (fotoInput.value) {
            previewFoto.src = fotoInput.value;
          }
        });
      }
      // Evento de submit
      const form = document.getElementById('editar-perfil-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(form as HTMLFormElement);
          const dados: any = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            fotoPerfil: formData.get('fotoPerfil'),
            descricao: formData.get('descricao'),
            formacao: formData.get('formacao'),
            experiencia: parseInt(formData.get('experiencia') as string) || 0,
            valorPadrao: parseFloat(formData.get('valorPadrao') as string) || 0,
            duracaoPadrao: parseInt(formData.get('duracaoPadrao') as string) || 60,
            maxAlunosPadrao: parseInt(formData.get('maxAlunosPadrao') as string) || 1,
            horarioInicio: formData.get('horarioInicio'),
            horarioFim: formData.get('horarioFim'),
            intervaloAulas: parseInt(formData.get('intervaloAulas') as string) || 30
          };
          const diasDisponiveis = formData.getAll('diasDisponiveis') as string[];
          dados.diasDisponiveis = diasDisponiveis;
          const conteudosDominio = formData.get('conteudosDominio') as string;
          if (conteudosDominio) {
            dados.conteudosDominio = conteudosDominio.split(',').map(s => s.trim());
          }
          try {
            const response = await editarPerfilProfessor(dados);
            if (response.ok) {
              mostrarToast('Perfil atualizado com sucesso!', 'success');
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1500);
            } else {
              const errorData = await response.json();
              mostrarToast('Erro ao atualizar perfil: ' + errorData.error, 'danger');
            }
          } catch (error) {
            mostrarToast('Erro ao conectar com o servidor.', 'danger');
          }
        });
      }
      // Botão voltar do header
      const btnVoltarHeader = document.getElementById('btn-voltar-header');
      if (btnVoltarHeader) {
        btnVoltarHeader.addEventListener('click', () => {
          window.history.pushState({}, '', '/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        });
      }
    });
} 