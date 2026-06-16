// Substitua pelas variáveis passadas na prompt (mesmas do script.js)
const SUPABASE_URL = 'https://groezaseypdbpgymgpvo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2V6YXNleXBkYnBneW1ncHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjkxNjYsImV4cCI6MjA4MTY0NTE2Nn0.5U5QeoGmZn_i9Y8POoUCkatBUAdSW-cjHRyfxpm_pyM';

// Inicializa o cliente do Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert("ID do vendedor não fornecido na URL (ex: ?id=1)");
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('vendedores')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (data) {
            preencherFormulario(data);
            setTimeout(() => {
                window.print();
            }, 500); // Dá um tempo para renderizar
        }
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        alert('Erro ao carregar dados do vendedor.');
    }
});

function marcarCheckbox(id, isChecked) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = isChecked ? '&nbsp;X&nbsp;' : '&nbsp;&nbsp;&nbsp;';
    }
}

function preencherDivs(idSuffix, data) {
    document.getElementById('p_nome' + idSuffix).textContent = (data.nome || '').toUpperCase();
    
    marcarCheckbox('c_local_paraipaba' + idSuffix, data.localizacao === 'Paraipaba');
    marcarCheckbox('c_local_lagoinha' + idSuffix, data.localizacao === 'Lagoinha');
    
    document.getElementById('p_vaga' + idSuffix).textContent = data.numero_vaga || '';

    const produtos = data.produtos_comercializados || [];
    marcarCheckbox('c_prod_comidas' + idSuffix, produtos.includes('Comidas'));
    marcarCheckbox('c_prod_bebidas' + idSuffix, produtos.includes('Bebidas'));
    marcarCheckbox('c_prod_brinquedos' + idSuffix, produtos.includes('Brinquedos'));
    marcarCheckbox('c_prod_outro' + idSuffix, produtos.includes('Outro'));

    marcarCheckbox('c_tipo_barraca' + idSuffix, data.tipo_instalacao === 'Barraca');
    marcarCheckbox('c_tipo_carrinho' + idSuffix, data.tipo_instalacao === 'Carrinho');
    marcarCheckbox('c_tipo_isopor' + idSuffix, data.tipo_instalacao === 'Isopor');
    marcarCheckbox('c_tipo_mesas' + idSuffix, data.tipo_instalacao === 'Mesas');

    document.getElementById('p_mesas' + idSuffix).textContent = data.quantidade_mesas ? ` ${data.quantidade_mesas} ` : '________';

    // Only set for the top part if elements exist
    if (document.getElementById('p_identidade' + idSuffix)) {
        document.getElementById('p_identidade' + idSuffix).textContent = data.identidade || '';
        document.getElementById('p_cpf' + idSuffix).textContent = data.cpf || '';
        document.getElementById('p_nascimento' + idSuffix).textContent = data.data_nascimento ? formatarData(data.data_nascimento) : '';
        document.getElementById('p_endereco' + idSuffix).textContent = (data.endereco || '').toUpperCase();
        document.getElementById('p_cidade' + idSuffix).textContent = (data.cidade || '').toUpperCase();
        document.getElementById('p_bairro' + idSuffix).textContent = (data.bairro || '').toUpperCase();
        document.getElementById('p_telefone' + idSuffix).textContent = data.telefone || '';
    }
}

function preencherFormulario(data) {
    // Top part
    preencherDivs('', data);
    
    // Bottom part
    preencherDivs('_comp', data);

    // Data
    const hoje = new Date();
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    document.getElementById('p_dia').textContent = hoje.getDate().toString().padStart(2, '0');
    document.getElementById('p_mes').textContent = meses[hoje.getMonth()];
}

function formatarData(dataISO) {
    if (!dataISO) return '';
    const partes = dataISO.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataISO;
}
