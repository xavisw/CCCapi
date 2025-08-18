-- Criado banco de dados completo para o sistema CCAPI
-- Sistema de Banco de Dados CCAPI Financiamentos
-- Linguagem: SQL (MySQL/PostgreSQL)

-- Criação do banco de dados
CREATE DATABASE ccapi_financiamentos;
USE ccapi_financiamentos;

-- Tabela de usuários/parceiros
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL, -- CPF ou CNPJ
    telefone VARCHAR(20) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
    tipo_usuario ENUM('parceiro', 'admin') DEFAULT 'parceiro'
);

-- Tabela principal de propostas
CREATE TABLE propostas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_proposta VARCHAR(20) UNIQUE NOT NULL,
    usuario_id INT NOT NULL,
    
    -- Dados do cliente
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_documento VARCHAR(20) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(255) NOT NULL,
    cliente_profissao VARCHAR(100) NOT NULL,
    cliente_renda_mensal DECIMAL(10,2) NOT NULL,
    cliente_cep VARCHAR(10) NOT NULL,
    cliente_endereco TEXT NOT NULL,
    
    -- Dados do veículo
    veiculo_tipo ENUM('leve', 'moto', 'pesados') NOT NULL,
    veiculo_marca VARCHAR(100) NOT NULL,
    veiculo_modelo VARCHAR(100) NOT NULL,
    veiculo_ano INT NOT NULL,
    veiculo_placa VARCHAR(10) NOT NULL,
    veiculo_valor DECIMAL(12,2) NOT NULL,
    veiculo_condicao ENUM('novo', 'seminovo', 'usado') NOT NULL,
    
    -- Dados do financiamento
    valor_financiar DECIMAL(12,2) NOT NULL,
    valor_entrada DECIMAL(12,2) NOT NULL,
    tipo_produto ENUM('financiamento', 'refinanciamento') NOT NULL,
    
    -- Especialista responsável
    especialista ENUM('fabricio', 'eder', 'suzana', 'wandreyna', 'neto') NOT NULL,
    
    -- Status e controle
    status ENUM('pendente', 'em_analise', 'aprovada', 'rejeitada', 'cancelada') DEFAULT 'pendente',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    observacoes TEXT,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_especialista (especialista),
    INDEX idx_veiculo_tipo (veiculo_tipo),
    INDEX idx_status (status),
    INDEX idx_data_criacao (data_criacao)
);

-- Tabela de propostas por especialista (Fabricio)
CREATE TABLE propostas_fabricio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proposta_id INT NOT NULL,
    data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_analise ENUM('nova', 'em_analise', 'finalizada') DEFAULT 'nova',
    observacoes_especialista TEXT,
    
    FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE,
    INDEX idx_proposta_id (proposta_id),
    INDEX idx_status_analise (status_analise)
);

-- Tabela de propostas por especialista (Eder)
CREATE TABLE propostas_eder (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proposta_id INT NOT NULL,
    data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_analise ENUM('nova', 'em_analise', 'finalizada') DEFAULT 'nova',
    observacoes_especialista TEXT,
    
    FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE,
    INDEX idx_proposta_id (proposta_id),
    INDEX idx_status_analise (status_analise)
);

-- Tabela de propostas por especialista (Suzana)
CREATE TABLE propostas_suzana (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proposta_id INT NOT NULL,
    data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_analise ENUM('nova', 'em_analise', 'finalizada') DEFAULT 'nova',
    observacoes_especialista TEXT,
    
    FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE,
    INDEX idx_proposta_id (proposta_id),
    INDEX idx_status_analise (status_analise)
);

-- Tabela de propostas por especialista (Wandreyna)
CREATE TABLE propostas_wandreyna (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proposta_id INT NOT NULL,
    data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_analise ENUM('nova', 'em_analise', 'finalizada') DEFAULT 'nova',
    observacoes_especialista TEXT,
    
    FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE,
    INDEX idx_proposta_id (proposta_id),
    INDEX idx_status_analise (status_analise)
);

-- Tabela de propostas por especialista (Neto)
CREATE TABLE propostas_neto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proposta_id INT NOT NULL,
    data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_analise ENUM('nova', 'em_analise', 'finalizada') DEFAULT 'nova',
    observacoes_especialista TEXT,
    
    FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE,
    INDEX idx_proposta_id (proposta_id),
    INDEX idx_status_analise (status_analise)
);

-- Tabela de propostas por tipo de veículo (Leve)
CREATE TABLE propostas_veiculos_leves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proposta_id INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE,
    INDEX idx_proposta_id (proposta_id)
);

-- Tabela de propostas por tipo de veículo (Moto)
CREATE TABLE propostas_veiculos_motos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proposta_id INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE,
    INDEX idx_proposta_id (proposta_id)
);

-- Tabela de propostas por tipo de veículo (Pesados)
CREATE TABLE propostas_veiculos_pesados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proposta_id INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE,
    INDEX idx_proposta_id (proposta_id)
);

-- Tabela de log de atividades
CREATE TABLE log_atividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    proposta_id INT,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE SET NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_proposta_id (proposta_id),
    INDEX idx_data_acao (data_acao)
);

-- Triggers para distribuir propostas automaticamente

-- Trigger para inserir na tabela do especialista correspondente
DELIMITER //
CREATE TRIGGER after_proposta_insert 
AFTER INSERT ON propostas
FOR EACH ROW
BEGIN
    -- Inserir na tabela do especialista
    CASE NEW.especialista
        WHEN 'fabricio' THEN
            INSERT INTO propostas_fabricio (proposta_id) VALUES (NEW.id);
        WHEN 'eder' THEN
            INSERT INTO propostas_eder (proposta_id) VALUES (NEW.id);
        WHEN 'suzana' THEN
            INSERT INTO propostas_suzana (proposta_id) VALUES (NEW.id);
        WHEN 'wandreyna' THEN
            INSERT INTO propostas_wandreyna (proposta_id) VALUES (NEW.id);
        WHEN 'neto' THEN
            INSERT INTO propostas_neto (proposta_id) VALUES (NEW.id);
    END CASE;
    
    -- Inserir na tabela do tipo de veículo
    CASE NEW.veiculo_tipo
        WHEN 'leve' THEN
            INSERT INTO propostas_veiculos_leves (proposta_id) VALUES (NEW.id);
        WHEN 'moto' THEN
            INSERT INTO propostas_veiculos_motos (proposta_id) VALUES (NEW.id);
        WHEN 'pesados' THEN
            INSERT INTO propostas_veiculos_pesados (proposta_id) VALUES (NEW.id);
    END CASE;
    
    -- Log da atividade
    INSERT INTO log_atividades (usuario_id, proposta_id, acao, descricao) 
    VALUES (NEW.usuario_id, NEW.id, 'PROPOSTA_CRIADA', CONCAT('Nova proposta criada para ', NEW.cliente_nome));
END//
DELIMITER ;

-- Views úteis para consultas

-- View de propostas com dados do usuário
CREATE VIEW vw_propostas_completas AS
SELECT 
    p.*,
    u.nome_completo as parceiro_nome,
    u.email as parceiro_email,
    u.telefone as parceiro_telefone
FROM propostas p
JOIN usuarios u ON p.usuario_id = u.id;

-- View de estatísticas por especialista
CREATE VIEW vw_estatisticas_especialistas AS
SELECT 
    especialista,
    COUNT(*) as total_propostas,
    COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as aprovadas,
    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as rejeitadas,
    AVG(valor_financiar) as valor_medio_financiamento
FROM propostas
GROUP BY especialista;

-- View de estatísticas por tipo de veículo
CREATE VIEW vw_estatisticas_veiculos AS
SELECT 
    veiculo_tipo,
    COUNT(*) as total_propostas,
    COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as aprovadas,
    AVG(valor_financiar) as valor_medio_financiamento,
    AVG(veiculo_valor) as valor_medio_veiculo
FROM propostas
GROUP BY veiculo_tipo;

-- Inserção de dados de exemplo
INSERT INTO usuarios (nome_completo, email, senha, documento, telefone, tipo_usuario) VALUES
('Admin Sistema', 'admin@ccapi.com.br', '$2y$10$example_hash', '00000000000', '(85) 99999-9999', 'admin'),
('Parceiro Exemplo', 'parceiro@exemplo.com', '$2y$10$example_hash', '12345678901', '(85) 98888-8888', 'parceiro');

-- Função para gerar código de proposta
DELIMITER //
CREATE FUNCTION gerar_codigo_proposta() RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE novo_codigo VARCHAR(20);
    DECLARE contador INT;
    
    SELECT COUNT(*) + 1 INTO contador FROM propostas;
    SET novo_codigo = CONCAT('CCAPI', LPAD(contador, 6, '0'));
    
    RETURN novo_codigo;
END//
DELIMITER ;

-- Trigger para gerar código automático
DELIMITER //
CREATE TRIGGER before_proposta_insert 
BEFORE INSERT ON propostas
FOR EACH ROW
BEGIN
    IF NEW.codigo_proposta IS NULL OR NEW.codigo_proposta = '' THEN
        SET NEW.codigo_proposta = gerar_codigo_proposta();
    END IF;
END//
DELIMITER ;
