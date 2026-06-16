// Configuração Supabase
const SUPABASE_URL = 'https://groezaseypdbpgymgpvo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2V6YXNleXBkYnBneW1ncHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjkxNjYsImV4cCI6MjA4MTY0NTE2Nn0.5U5QeoGmZn_i9Y8POoUCkatBUAdSW-cjHRyfxpm_pyM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allVendedores = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarVendedores();

    document.getElementById('refreshBtn').addEventListener('click', () => {
        carregarVendedores();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        renderizarTabela(e.target.value);
    });

    // Modal listeners
    document.getElementById('closeModalBtn').addEventListener('click', fecharModal);
    document.getElementById('cancelEditBtn').addEventListener('click', fecharModal);
    document.getElementById('editForm').addEventListener('submit', salvarEdicao);
});

async function carregarVendedores() {
    const tableBody = document.getElementById('tableBody');
    const totalCount = document.getElementById('totalCount');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // UI Feedback
    refreshBtn.disabled = true;
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center"><span class="loader-small"></span> Carregando...</td></tr>';

    try {
        const { data, error, count } = await supabaseClient
            .from('vendedores')
            .select('*', { count: 'exact' })
            .order('id', { ascending: false });

        if (error) throw error;

        allVendedores = data || [];
        totalCount.textContent = count || allVendedores.length;
        renderizarTabela('');
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-error">Erro ao carregar os dados.</td></tr>`;
    } finally {
        refreshBtn.disabled = false;
    }
}

function renderizarTabela(filtro) {
    const tableBody = document.getElementById('tableBody');
    const filtroMin = filtro.toLowerCase().trim();
    
    const dadosFiltrados = allVendedores.filter(v => 
        (v.nome || '').toLowerCase().includes(filtroMin)
    );

    if (dadosFiltrados.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum vendedor encontrado.</td></tr>';
        return;
    }

    tableBody.innerHTML = ''; // Limpa a tabela

    dadosFiltrados.forEach(vendedor => {
        const tr = document.createElement('tr');
        
        // Formatando data
        let dataFormatada = '-';
        if (vendedor.created_at) {
            const dataObj = new Date(vendedor.created_at);
            dataFormatada = dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }

        tr.innerHTML = `
            <td class="fw-500">${escapeHTML(vendedor.nome || '-')}</td>
            <td>${escapeHTML(vendedor.cpf || '-')}</td>
            <td>${escapeHTML(vendedor.telefone || '-')}</td>
            <td>
                <span class="badge badge-local">${escapeHTML(vendedor.localizacao || '-')}</span>
            </td>
            <td>${escapeHTML(vendedor.tipo_instalacao || '-')}</td>
            <td class="text-muted text-sm">${dataFormatada}</td>
            <td class="actions-cell">
                <button class="btn-action" onclick="abrirModal(${vendedor.id})" title="Editar Formulário">
                    ✏️
                </button>
                <button class="btn-action print-action" onclick="imprimir(${vendedor.id})" title="Imprimir Formulário">
                    🖨️
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function abrirModal(id) {
    const vendedor = allVendedores.find(v => v.id === id);
    if (!vendedor) return;

    document.getElementById('editId').value = vendedor.id;
    document.getElementById('editNome').value = vendedor.nome || '';
    document.getElementById('editIdentidade').value = vendedor.identidade || '';
    document.getElementById('editCpf').value = vendedor.cpf || '';
    document.getElementById('editDataNascimento').value = vendedor.data_nascimento || '';
    document.getElementById('editTelefone').value = vendedor.telefone || '';
    document.getElementById('editEndereco').value = vendedor.endereco || '';
    document.getElementById('editBairro').value = vendedor.bairro || '';
    document.getElementById('editCidade').value = vendedor.cidade || '';
    document.getElementById('editLocalizacao').value = vendedor.localizacao || 'Paraipaba';
    document.getElementById('editNumeroVaga').value = vendedor.numero_vaga || '';
    document.getElementById('editTipo').value = vendedor.tipo_instalacao || 'Barraca';
    document.getElementById('editQtdMesas').value = vendedor.quantidade_mesas || 0;

    document.getElementById('editModal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function salvarEdicao(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const nome = document.getElementById('editNome').value;
    const identidade = document.getElementById('editIdentidade').value;
    const cpf = document.getElementById('editCpf').value;
    const data_nascimento = document.getElementById('editDataNascimento').value;
    const telefone = document.getElementById('editTelefone').value;
    const endereco = document.getElementById('editEndereco').value;
    const bairro = document.getElementById('editBairro').value;
    const cidade = document.getElementById('editCidade').value;
    const localizacao = document.getElementById('editLocalizacao').value;
    const numero_vaga = document.getElementById('editNumeroVaga').value;
    const tipo_instalacao = document.getElementById('editTipo').value;
    const quantidade_mesas = parseInt(document.getElementById('editQtdMesas').value) || 0;

    try {
        const { error } = await supabaseClient
            .from('vendedores')
            .update({ 
                nome, identidade, cpf, data_nascimento, telefone, 
                endereco, bairro, cidade, localizacao, 
                numero_vaga, tipo_instalacao, quantidade_mesas 
            })
            .eq('id', id);

        if (error) throw error;

        fecharModal();
        carregarVendedores(); // Recarrega a tabela atualizada
    } catch (err) {
        console.error('Erro ao salvar edição:', err);
        alert('Erro ao salvar os dados.');
    }
}

function imprimir(id) {
    // Abre a página de impressão em uma nova aba
    window.open(`print.html?id=${id}`, '_blank');
}

// Utilitário para prevenir XSS básico
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
