import re
import urllib.request
import json
from datetime import datetime

# Supabase credentials
SUPABASE_URL = 'https://groezaseypdbpgymgpvo.supabase.co/rest/v1/vendedores'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2V6YXNleXBkYnBneW1ncHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjkxNjYsImV4cCI6MjA4MTY0NTE2Nn0.5U5QeoGmZn_i9Y8POoUCkatBUAdSW-cjHRyfxpm_pyM'

def parse_date(date_str):
    if not date_str or date_str.strip() == '':
        return '1900-01-01'
    try:
        dt = datetime.strptime(date_str.strip(), '%d/%m/%Y')
        return dt.strftime('%Y-%m-%d')
    except:
        return '1900-01-01'

with open('extracted.txt', 'r', encoding='utf-16le', errors='ignore') as f:
    text = f.read()
    
# Clean text from null bytes if any
text = text.replace('\x00', '')

# Split by CADASTRO DE VENDEDORES AMBULANTES to isolate forms
blocks = text.split('CADASTRO DE VENDEDORES AMBULANTES')

vendedores = []

for block in blocks:
    nome_match = re.search(r'NOME:\s*(.+)', block)
    if not nome_match:
        continue
    
    nome = nome_match.group(1).strip()
    if not nome or nome == 'NOME:':
        continue
        
    identidade = re.search(r'IDENTIDADE:\s*(.*)', block)
    cpf = re.search(r'CPF:\s*(.*)', block)
    data_nascimento = re.search(r'DATA DE NASCIMENTO:\s*(.*)', block)
    endereco = re.search(r'ENDERE[ÇC]O:\s*(.*)', block)
    cidade = re.search(r'CIDADE:\s*(.*)', block)
    bairro = re.search(r'BAIRRO:\s*(.*)', block)
    telefone = re.search(r'TELEFONE:\s*(.*)', block)
    
    vendedor = {
        'nome': nome,
        'identidade': identidade.group(1).strip() if identidade and identidade.group(1).strip() else 'N/A',
        'cpf': cpf.group(1).strip() if cpf and cpf.group(1).strip() else 'N/A',
        'data_nascimento': parse_date(data_nascimento.group(1).strip() if data_nascimento else ''),
        'endereco': endereco.group(1).strip() if endereco and endereco.group(1).strip() else 'N/A',
        'cidade': cidade.group(1).strip() if cidade and cidade.group(1).strip() else 'N/A',
        'bairro': bairro.group(1).strip() if bairro and bairro.group(1).strip() else 'N/A',
        'telefone': telefone.group(1).strip() if telefone and telefone.group(1).strip() else 'N/A',
        'localizacao': 'Não Informado',
        'tipo_instalacao': 'Não Informado',
        'quantidade_mesas': 0,
        'produtos_comercializados': []
    }
    
    # Filter out empty or garbage names
    if len(nome) > 2 and len(nome) < 100:
        vendedores.append(vendedor)

print(f"Found {len(vendedores)} records to import.")

for v in vendedores:
    try:
        print(f"Importing: {v['nome'].encode('utf-8', 'replace').decode('utf-8')}")
    except:
        pass
    
    data = json.dumps(v).encode('utf-8')
    req = urllib.request.Request(SUPABASE_URL, data=data)
    req.add_header('apikey', SUPABASE_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=representation')
    
    try:
        with urllib.request.urlopen(req) as response:
            res = response.read()
            print('Success')
    except Exception as e:
        print(f"Error importing {v['nome']}: {e}")
