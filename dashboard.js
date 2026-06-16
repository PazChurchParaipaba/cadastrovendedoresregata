// Configuração Supabase
const SUPABASE_URL = 'https://groezaseypdbpgymgpvo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2V6YXNleXBkYnBneW1ncHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjkxNjYsImV4cCI6MjA4MTY0NTE2Nn0.5U5QeoGmZn_i9Y8POoUCkatBUAdSW-cjHRyfxpm_pyM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    carregarVendedores();

    document.getElementById('refreshBtn').addEventListener('click', () => {
        carregarVendedores();
    });
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

        totalCount.textContent = count || data.length;

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum vendedor cadastrado ainda.</td></tr>';
            return;
        }

        tableBody.innerHTML = ''; // Limpa a tabela

        data.forEach(vendedor => {
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
                    <button class="btn-action print-action" onclick="imprimir(${vendedor.id})" title="Imprimir Formulário">
                        🖨️
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-error">Erro ao carregar os dados.</td></tr>`;
    } finally {
        refreshBtn.disabled = false;
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
