// Substitua pelas variáveis passadas na prompt
const SUPABASE_URL = 'https://groezaseypdbpgymgpvo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2V6YXNleXBkYnBneW1ncHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjkxNjYsImV4cCI6MjA4MTY0NTE2Nn0.5U5QeoGmZn_i9Y8POoUCkatBUAdSW-cjHRyfxpm_pyM';

// Inicializa o cliente do Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');
    const tipoInstalacaoSelect = document.getElementById('tipo_instalacao');
    const containerMesas = document.getElementById('containerMesas');
    const inputMesas = document.getElementById('quantidade_mesas');
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const feedbackMessage = document.getElementById('feedbackMessage');

    // Mostra input de mesas apenas se "Mesas" for selecionado
    tipoInstalacaoSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Mesas') {
            containerMesas.style.display = 'flex';
            inputMesas.required = true;
        } else {
            containerMesas.style.display = 'none';
            inputMesas.required = false;
            inputMesas.value = '';
        }
    });

    // Formatação simples de CPF (Apenas UX básica, sem validação complexa)
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
        }
        e.target.value = value;
    });

    // Formatação simples de Telefone
    const telInput = document.getElementById('telefone');
    telInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{4,5})/, '($1) $2');
        }
        e.target.value = value;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // UI Loading State
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'block';
        feedbackMessage.className = 'feedback-message';
        feedbackMessage.style.display = 'none';

        try {
            // Coletar dados
            const formData = new FormData(form);
            
            // Coletar checkboxes selecionados
            const produtosComercializados = [];
            document.querySelectorAll('input[name="produtos"]:checked').forEach(cb => {
                produtosComercializados.push(cb.value);
            });

            const payload = {
                nome: formData.get('nome'),
                cpf: formData.get('cpf'),
                identidade: formData.get('identidade'),
                data_nascimento: formData.get('data_nascimento'),
                telefone: formData.get('telefone'),
                endereco: formData.get('endereco'),
                bairro: formData.get('bairro'),
                cidade: formData.get('cidade'),
                localizacao: formData.get('localizacao'),
                numero_vaga: formData.get('numero_vaga') || null,
                tipo_instalacao: formData.get('tipo_instalacao'),
                quantidade_mesas: formData.get('quantidade_mesas') ? parseInt(formData.get('quantidade_mesas')) : null,
                produtos_comercializados: produtosComercializados
            };

            // Inserir no Supabase
            const { data, error } = await supabaseClient
                .from('vendedores')
                .insert([payload]);

            if (error) throw error;

            // Sucesso
            feedbackMessage.textContent = 'Cadastro realizado com sucesso!';
            feedbackMessage.classList.add('success');
            form.reset();
            containerMesas.style.display = 'none';
            
        } catch (error) {
            console.error('Erro ao salvar:', error);
            feedbackMessage.textContent = 'Erro ao realizar cadastro: ' + (error.message || 'Verifique sua conexão ou contate o suporte.');
            feedbackMessage.classList.add('error');
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            loader.style.display = 'none';
        }
    });
});
