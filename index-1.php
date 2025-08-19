<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$db_path = 'C:/Users/Henrique/Ccapi.db';

error_log("[DEBUG] Tentando conectar ao banco: $db_path");

try {
    $pdo = new PDO("sqlite:$db_path");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    error_log("[DEBUG] Conexão com banco estabelecida com sucesso");
} catch(PDOException $e) {
    error_log("[ERROR] Erro de conexão: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro de conexão com banco: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

error_log("[DEBUG] Ação recebida: $action, Método: $method");

switch($action) {
    case 'register':
        if ($method === 'POST') {
            $input = file_get_contents('php://input');
            error_log("[DEBUG] Dados recebidos para registro: $input");
            
            $data = json_decode($input, true);
            
            if (!$data) {
                error_log("[ERROR] Erro ao decodificar JSON");
                echo json_encode(['error' => 'Dados inválidos']);
                break;
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO usuarios (nome, email, cpf_cnpj, telefone, senha, created_at) 
                VALUES (?, ?, ?, ?, ?, datetime('now'))
            ");
            
            $senha_hash = password_hash($data['senha'], PASSWORD_DEFAULT);
            
            try {
                $stmt->execute([
                    $data['nome'],
                    $data['email'], 
                    $data['cpf_cnpj'],
                    $data['telefone'],
                    $senha_hash
                ]);
                
                $user_id = $pdo->lastInsertId();
                error_log("[DEBUG] Usuário cadastrado com ID: $user_id");
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Usuário cadastrado com sucesso',
                    'user_id' => $user_id
                ]);
            } catch(PDOException $e) {
                error_log("[ERROR] Erro ao cadastrar usuário: " . $e->getMessage());
                if ($e->getCode() == 23000) {
                    echo json_encode(['error' => 'Email já cadastrado']);
                } else {
                    echo json_encode(['error' => 'Erro ao cadastrar: ' . $e->getMessage()]);
                }
            }
        }
        break;

    case 'login':
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // REMOVER: Verificação de login no localStorage
            // ADICIONAR: Envio via fetch para esta API
            
            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
            $stmt->execute([$data['email']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($data['senha'], $user['senha'])) {
                unset($user['senha']); // Remove senha do retorno
                echo json_encode([
                    'success' => true,
                    'message' => 'Login realizado com sucesso',
                    'user' => $user
                ]);
            } else {
                echo json_encode(['error' => 'Email ou senha incorretos']);
            }
        }
        break;

    case 'nova_proposta':
        if ($method === 'POST') {
            $input = file_get_contents('php://input');
            error_log("[DEBUG] Dados recebidos para nova proposta: $input");
            
            $data = json_decode($input, true);
            
            if (!$data) {
                error_log("[ERROR] Erro ao decodificar JSON da proposta");
                echo json_encode(['error' => 'Dados inválidos']);
                break;
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO propostas (
                    usuario_id, nome_cliente, cpf_cliente, telefone_cliente, 
                    profissao_cliente, cep_cliente, tipo_veiculo, marca_veiculo, 
                    modelo_veiculo, ano_veiculo, placa_veiculo, valor_veiculo, 
                    tipo_produto, especialista, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', datetime('now'))
            ");
            
            try {
                $stmt->execute([
                    $data['usuario_id'],
                    $data['nome_cliente'],
                    $data['cpf_cliente'],
                    $data['telefone_cliente'],
                    $data['profissao_cliente'],
                    $data['cep_cliente'],
                    $data['tipo_veiculo'],
                    $data['marca_veiculo'],
                    $data['modelo_veiculo'],
                    $data['ano_veiculo'],
                    $data['placa_veiculo'],
                    $data['valor_veiculo'],
                    $data['tipo_produto'],
                    $data['especialista']
                ]);
                
                $proposta_id = $pdo->lastInsertId();
                error_log("[DEBUG] Proposta criada com ID: $proposta_id");
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Proposta enviada com sucesso',
                    'proposta_id' => $proposta_id
                ]);
            } catch(PDOException $e) {
                error_log("[ERROR] Erro ao criar proposta: " . $e->getMessage());
                echo json_encode(['error' => 'Erro ao enviar proposta: ' . $e->getMessage()]);
            }
        }
        break;

    case 'minhas_propostas':
        if ($method === 'GET') {
            $usuario_id = $_GET['usuario_id'] ?? '';
            
            // REMOVER: Busca de propostas no localStorage
            // ADICIONAR: Busca via fetch para esta API
            
            $stmt = $pdo->prepare("
                SELECT *, 
                       CASE 
                           WHEN status = 'aprovada' THEN 'Aprovada'
                           WHEN status = 'recusada' THEN 'Recusada'
                           WHEN status = 'pendente' THEN 'Pendente'
                           ELSE 'Pendente'
                       END as status_texto
                FROM propostas 
                WHERE usuario_id = ? 
                ORDER BY created_at DESC
            ");
            
            $stmt->execute([$usuario_id]);
            $propostas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['propostas' => $propostas]);
        }
        break;

    case 'atualizar_perfil':
        if ($method === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // REMOVER: Atualização de perfil no localStorage
            // ADICIONAR: Envio via fetch para esta API
            
            $stmt = $pdo->prepare("
                UPDATE usuarios 
                SET nome = ?, telefone = ?, updated_at = datetime('now')
                WHERE id = ?
            ");
            
            try {
                $stmt->execute([
                    $data['nome'],
                    $data['telefone'],
                    $data['usuario_id']
                ]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Perfil atualizado com sucesso'
                ]);
            } catch(PDOException $e) {
                echo json_encode(['error' => 'Erro ao atualizar perfil: ' . $e->getMessage()]);
            }
        }
        break;

    case 'dashboard_stats':
        if ($method === 'GET') {
            $usuario_id = $_GET['usuario_id'] ?? '';
            
            // REMOVER: Contagem de estatísticas no localStorage
            // ADICIONAR: Busca via fetch para esta API
            
            $stmt = $pdo->prepare("
                SELECT 
                    COUNT(*) as total_propostas,
                    SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
                    SUM(CASE WHEN status = 'aprovada' THEN 1 ELSE 0 END) as aprovadas,
                    SUM(CASE WHEN status = 'recusada' THEN 1 ELSE 0 END) as recusadas
                FROM propostas 
                WHERE usuario_id = ?
            ");
            
            $stmt->execute([$usuario_id]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($stats);
        }
        break;

    case 'notificacoes':
        if ($method === 'GET') {
            $usuario_id = $_GET['usuario_id'] ?? '';
            
            // REMOVER: Busca de notificações no localStorage
            // ADICIONAR: Busca via fetch para esta API
            
            $stmt = $pdo->prepare("
                SELECT * FROM notificacoes 
                WHERE usuario_id = ? AND lida = 0 
                ORDER BY created_at DESC
            ");
            
            $stmt->execute([$usuario_id]);
            $notificacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['notificacoes' => $notificacoes]);
        }
        break;

    case 'marcar_notificacao_lida':
        if ($method === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("UPDATE notificacoes SET lida = 1 WHERE id = ?");
            $stmt->execute([$data['notificacao_id']]);
            
            echo json_encode(['success' => true]);
        }
        break;

    default:
        error_log("[ERROR] Ação não encontrada: $action");
        http_response_code(404);
        echo json_encode(['error' => 'Ação não encontrada']);
        break;
}
?>
