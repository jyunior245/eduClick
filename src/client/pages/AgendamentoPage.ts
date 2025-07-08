import { agendarComProfessor, getInfoProfessor } from '../services/api';
import { mostrarToast } from '../components/Toast';
import { renderHeader } from '../components/Header';
import { renderFooter } from '../components/Footer';

export function renderAgendamentoPage(root: HTMLElement, professorId: string) {
  root.innerHTML = `
    ${renderHeader()}
    <main class="container my-5">
      <div class="agendamento-publico-container">
        <h2>Agendar com o Professor</h2>
        <div id="info-professor"></div>
        <div id="horarios-disponiveis"></div>
        <h3>Reservar Horário</h3>
        <form id="formAgendar">
          <input type="text" name="alunoNome" placeholder="Seu nome" required />
          <input type="text" name="alunoTelefone" placeholder="Seu telefone" required />
          <input type="datetime-local" name="dataHora" required />
          <button type="submit">Reservar</button>
        </form>
        <p><a href="/">Voltar ao início</a></p>
      </div>
    </main>
    ${renderFooter()}
  `;
  carregarInfoProfessor(professorId);
  // (horários disponíveis pode ser implementado depois)
  const form = document.getElementById('formAgendar');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form as HTMLFormElement);
      const alunoNome = formData.get('alunoNome') as string;
      const alunoTelefone = formData.get('alunoTelefone') as string;
      const dataHora = formData.get('dataHora') as string;
      try {
        const response = await agendarComProfessor(professorId, alunoNome, alunoTelefone, dataHora);
        if (response.ok) {
          mostrarToast('Agendamento realizado com sucesso!', 'success');
          (form as HTMLFormElement).reset();
        } else {
          const errorData = await response.json();
          mostrarToast(`Erro ao agendar: ${errorData.error}`, 'danger');
        }
      } catch (error) {
        mostrarToast('Erro ao conectar com o servidor.', 'danger');
      }
    });
  }
}

async function carregarInfoProfessor(professorId: string) {
  const res = await getInfoProfessor(professorId);
  if (res.ok) {
    const professor = await res.json();
    const infoDiv = document.getElementById('info-professor');
    if (infoDiv) {
      infoDiv.innerHTML = `
        <img src="${professor.fotoPerfil}" alt="Foto de Perfil" style="max-width: 100px; border-radius: 50%;" />
        <p><b>Nome:</b> ${professor.nome}</p>
        <p><b>Valor da diária:</b> R$ ${professor.valorDiaria}</p>
        <p><b>Horas por aula:</b> ${professor.horasPorAula}</p>
      `;
    }
  }
} 