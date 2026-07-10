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
                    <button class="btn-action edit-action" onclick="editar(${vendedor.id})" title="Editar Vendedor">
                        ✏️
                    </button>
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

// Modal logic
const editModal = document.getElementById('editModal');
const closeModal = document.querySelector('.close-modal');

if (closeModal) {
    closeModal.onclick = function() {
        editModal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target == editModal) {
        editModal.style.display = 'none';
    }
}

// Logic for Mesas
const editTipoInstalacao = document.getElementById('edit_tipo_instalacao');
if (editTipoInstalacao) {
    editTipoInstalacao.addEventListener('change', function() {
        const container = document.getElementById('edit_containerMesas');
        const input = document.getElementById('edit_quantidade_mesas');
        if (this.value === 'Mesas') {
            container.style.display = 'block';
            input.required = true;
        } else {
            container.style.display = 'none';
            input.required = false;
            input.value = '';
        }
    });
}

async function editar(id) {
    try {
        const { data, error } = await supabaseClient
            .from('vendedores')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (data) {
            document.getElementById('edit_id').value = data.id;
            document.getElementById('edit_nome').value = data.nome || '';
            document.getElementById('edit_cpf').value = data.cpf || '';
            document.getElementById('edit_identidade').value = data.identidade || '';
            document.getElementById('edit_data_nascimento').value = data.data_nascimento || '';
            document.getElementById('edit_telefone').value = data.telefone || '';
            
            document.getElementById('edit_endereco').value = data.endereco || '';
            document.getElementById('edit_bairro').value = data.bairro || '';
            document.getElementById('edit_cidade').value = data.cidade || '';
            
            document.getElementById('edit_localizacao').value = data.localizacao || '';
            document.getElementById('edit_numero_vaga').value = data.numero_vaga || '';
            
            const checkboxes = document.querySelectorAll('input[name="edit_produtos"]');
            checkboxes.forEach(cb => cb.checked = false);
            if (data.produtos) {
                const produtosList = data.produtos.split(', ');
                checkboxes.forEach(cb => {
                    if (produtosList.includes(cb.value)) {
                        cb.checked = true;
                    }
                });
            }

            const tipoInstalacao = document.getElementById('edit_tipo_instalacao');
            tipoInstalacao.value = data.tipo_instalacao || '';
            tipoInstalacao.dispatchEvent(new Event('change'));
            
            if (data.tipo_instalacao === 'Mesas') {
                document.getElementById('edit_quantidade_mesas').value = data.quantidade_mesas || '';
            }

            editModal.style.display = 'block';
        }
    } catch (err) {
        console.error('Erro ao buscar vendedor para edição:', err);
        alert('Erro ao carregar dados do vendedor.');
    }
}

const editForm = document.getElementById('editForm');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('editSubmitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const loader = submitBtn.querySelector('.loader');
        const feedbackMsg = document.getElementById('editFeedbackMessage');

        btnText.style.display = 'none';
        loader.style.display = 'inline-block';
        submitBtn.disabled = true;
        feedbackMsg.style.display = 'none';
        feedbackMsg.className = 'feedback-message';

        const formData = new FormData(e.target);
        const id = formData.get('id');

        const checkboxes = document.querySelectorAll('input[name="edit_produtos"]:checked');
        const produtos = Array.from(checkboxes).map(cb => cb.value).join(', ');

        const updates = {
            nome: formData.get('nome'),
            cpf: formData.get('cpf'),
            identidade: formData.get('identidade'),
            data_nascimento: formData.get('data_nascimento'),
            telefone: formData.get('telefone'),
            endereco: formData.get('endereco'),
            bairro: formData.get('bairro'),
            cidade: formData.get('cidade'),
            localizacao: formData.get('localizacao'),
            numero_vaga: formData.get('numero_vaga'),
            produtos: produtos,
            tipo_instalacao: formData.get('tipo_instalacao'),
            quantidade_mesas: formData.get('tipo_instalacao') === 'Mesas' ? parseInt(formData.get('quantidade_mesas')) : null,
        };

        try {
            const { error } = await supabaseClient
                .from('vendedores')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            feedbackMsg.textContent = 'Dados atualizados com sucesso!';
            feedbackMsg.classList.add('success');
            
            setTimeout(() => {
                editModal.style.display = 'none';
                carregarVendedores();
                feedbackMsg.style.display = 'none';
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            feedbackMsg.textContent = 'Ocorreu um erro ao atualizar os dados. Tente novamente.';
            feedbackMsg.classList.add('error');
        } finally {
            btnText.style.display = 'inline-block';
            loader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
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
