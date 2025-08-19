// Sistema de Gerenciamento de Dados - Funciona localmente e com servidor
class DataManager {
  constructor() {
    this.isServerMode = false
    this.apiBase = "api/"
    this.checkServerMode()
  }

  async checkServerMode() {
    try {
      const response = await fetch(this.apiBase + "main-site-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      })
      this.isServerMode = response.ok
    } catch (error) {
      this.isServerMode = false
    }
    console.log("[v0] Server mode:", this.isServerMode)
  }

  // Registro de usuário
  async register(userData) {
    if (this.isServerMode) {
      try {
        const response = await fetch(this.apiBase + "main-site-api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "register", ...userData }),
        })
        return await response.json()
      } catch (error) {
        console.log("[v0] Server error, using localStorage")
      }
    }

    // Fallback para localStorage
    const users = JSON.parse(localStorage.getItem("ccapi_users") || "[]")
    const existingUser = users.find((u) => u.email === userData.email)

    if (existingUser) {
      return { success: false, message: "Email já cadastrado" }
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      created_at: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("ccapi_users", JSON.stringify(users))
    localStorage.setItem("ccapi_current_user", JSON.stringify(newUser))

    return { success: true, message: "Cadastro realizado com sucesso!" }
  }

  // Login de usuário
  async login(email, password) {
    if (this.isServerMode) {
      try {
        const response = await fetch(this.apiBase + "main-site-api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "login", email, password }),
        })
        const result = await response.json()
        if (result.success) {
          localStorage.setItem("ccapi_current_user", JSON.stringify(result.user))
        }
        return result
      } catch (error) {
        console.log("[v0] Server error, using localStorage")
      }
    }

    // Fallback para localStorage
    const users = JSON.parse(localStorage.getItem("ccapi_users") || "[]")
    const user = users.find((u) => u.email === email && u.password === password)

    if (user) {
      localStorage.setItem("ccapi_current_user", JSON.stringify(user))
      return { success: true, message: "Login realizado com sucesso!", user }
    }

    return { success: false, message: "Email ou senha incorretos" }
  }

  // Salvar proposta
  async saveProposal(proposalData) {
    const currentUser = JSON.parse(localStorage.getItem("ccapi_current_user") || "{}")

    if (this.isServerMode) {
      try {
        const response = await fetch(this.apiBase + "main-site-api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_proposal",
            user_id: currentUser.id,
            ...proposalData,
          }),
        })
        return await response.json()
      } catch (error) {
        console.log("[v0] Server error, using localStorage")
      }
    }

    // Fallback para localStorage
    const proposals = JSON.parse(localStorage.getItem("ccapi_proposals") || "[]")
    const newProposal = {
      id: Date.now(),
      user_id: currentUser.id,
      status: "pendente",
      created_at: new Date().toISOString(),
      ...proposalData,
    }

    proposals.push(newProposal)
    localStorage.setItem("ccapi_proposals", JSON.stringify(proposals))

    return { success: true, message: "Proposta enviada com sucesso!" }
  }

  // Obter propostas do usuário
  async getUserProposals() {
    const currentUser = JSON.parse(localStorage.getItem("ccapi_current_user") || "{}")

    if (this.isServerMode) {
      try {
        const response = await fetch(this.apiBase + "main-site-api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_user_proposals", user_id: currentUser.id }),
        })
        const result = await response.json()
        return result.proposals || []
      } catch (error) {
        console.log("[v0] Server error, using localStorage")
      }
    }

    // Fallback para localStorage
    const proposals = JSON.parse(localStorage.getItem("ccapi_proposals") || "[]")
    return proposals.filter((p) => p.user_id === currentUser.id)
  }

  // Verificar se usuário está logado
  isLoggedIn() {
    return localStorage.getItem("ccapi_current_user") !== null
  }

  // Logout
  logout() {
    localStorage.removeItem("ccapi_current_user")
  }
}

// Instância global do gerenciador de dados
const dataManager = new DataManager()

// Sistema de Notificações Customizado
class NotificationSystem {
  constructor() {
    this.createNotificationContainer()
  }

  createNotificationContainer() {
    if (!document.getElementById("notification-container")) {
      const container = document.createElement("div")
      container.id = "notification-container"
      container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `
      document.body.appendChild(container)
    }
  }

  show(message, type = "info") {
    const notification = document.createElement("div")
    notification.style.cssText = `
            background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            pointer-events: auto;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `

    notification.textContent = message

    const container = document.getElementById("notification-container")
    container.appendChild(notification)

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 4000)
  }
}

// Instância global do sistema de notificações
const notifications = new NotificationSystem()

// Adicionar estilos de animação
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`
document.head.appendChild(style)

// Funções de Modal
function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "flex"
    document.body.style.overflow = "hidden"
    console.log("[v0] Modal opened:", modalId)
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
    console.log("[v0] Modal closed:", modalId)
  }
}

// Função para abrir WhatsApp
function openWhatsApp(service = "") {
  const phoneNumber = "5585999999999" // Substitua pelo número real
  let message = "Olá! Gostaria de solicitar uma consulta"

  if (service) {
    message += ` sobre ${service}`
  }

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  window.open(url, "_blank")
  console.log("[v0] WhatsApp opened for service:", service)
}

// Função para mostrar/esconder dashboard
function showDashboard() {
  if (!dataManager.isLoggedIn()) {
    notifications.show("Você precisa fazer login primeiro!", "error")
    return
  }

  document.getElementById("main-content").style.display = "none"
  document.getElementById("dashboard").style.display = "block"
  loadDashboardData()
  console.log("[v0] Dashboard shown")
}

function hideDashboard() {
  document.getElementById("main-content").style.display = "block"
  document.getElementById("dashboard").style.display = "none"
  console.log("[v0] Dashboard hidden")
}

// Função para carregar dados do dashboard
async function loadDashboardData() {
  const currentUser = JSON.parse(localStorage.getItem("ccapi_current_user") || "{}")
  const proposals = await dataManager.getUserProposals()

  // Atualizar estatísticas
  const totalProposals = proposals.length
  const pendingProposals = proposals.filter((p) => p.status === "pendente").length
  const approvedProposals = proposals.filter((p) => p.status === "aprovada").length
  const rejectedProposals = proposals.filter((p) => p.status === "recusada").length

  // Atualizar elementos do dashboard
  const statsElements = {
    "total-proposals": totalProposals,
    "pending-proposals": pendingProposals,
    "approved-proposals": approvedProposals,
    "rejected-proposals": rejectedProposals,
  }

  Object.entries(statsElements).forEach(([id, value]) => {
    const element = document.getElementById(id)
    if (element) {
      element.textContent = value
    }
  })

  // Carregar lista de propostas
  loadProposalsList(proposals)

  console.log("[v0] Dashboard data loaded")
}

// Função para carregar lista de propostas
function loadProposalsList(proposals) {
  const proposalsContainer = document.getElementById("proposals-list")
  if (!proposalsContainer) return

  if (proposals.length === 0) {
    proposalsContainer.innerHTML = '<p class="text-gray-500">Nenhuma proposta encontrada.</p>'
    return
  }

  proposalsContainer.innerHTML = proposals
    .map(
      (proposal) => `
        <div class="bg-white p-4 rounded-lg shadow border-l-4 ${
          proposal.status === "aprovada"
            ? "border-green-500"
            : proposal.status === "recusada"
              ? "border-red-500"
              : "border-yellow-500"
        }">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-semibold">${proposal.cliente_nome}</h4>
                <span class="px-2 py-1 rounded text-sm ${
                  proposal.status === "aprovada"
                    ? "bg-green-100 text-green-800"
                    : proposal.status === "recusada"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }">${proposal.status}</span>
            </div>
            <p class="text-sm text-gray-600">Veículo: ${proposal.veiculo_marca} ${proposal.veiculo_modelo}</p>
            <p class="text-sm text-gray-600">Valor: R$ ${proposal.valor_veiculo}</p>
            <p class="text-sm text-gray-600">Data: ${new Date(proposal.created_at).toLocaleDateString()}</p>
            ${proposal.observacao ? `<p class="text-sm text-gray-600 mt-2"><strong>Observação:</strong> ${proposal.observacao}</p>` : ""}
        </div>
    `,
    )
    .join("")
}

// Navegação do Dashboard
function showDashboardSection(sectionId) {
  // Esconder todas as seções
  document.querySelectorAll(".dashboard-section").forEach((section) => {
    section.style.display = "none"
  })

  // Mostrar seção selecionada
  const targetSection = document.getElementById(sectionId)
  if (targetSection) {
    targetSection.style.display = "block"
  }

  // Atualizar navegação ativa
  document.querySelectorAll(".dashboard-nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  const activeNavItem = document.querySelector(`[onclick="showDashboardSection('${sectionId}')"]`)
  if (activeNavItem) {
    activeNavItem.classList.add("active")
  }

  console.log("[v0] Dashboard section shown:", sectionId)
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, initializing event listeners")

  // Menu de três pontinhos
  const menuToggle = document.getElementById("menu-toggle")
  const partnerMenu = document.getElementById("partner-menu")

  if (menuToggle && partnerMenu) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation()
      partnerMenu.style.display = partnerMenu.style.display === "block" ? "none" : "block"
      console.log("[v0] Partner menu toggled")
    })

    // Fechar menu ao clicar fora
    document.addEventListener("click", () => {
      partnerMenu.style.display = "none"
    })

    partnerMenu.addEventListener("click", (e) => {
      e.stopPropagation()
    })
  }

  // Formulário de cadastro
  const registerForm = document.getElementById("register-form")
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const userData = {
        nome: formData.get("nome"),
        email: formData.get("email"),
        cpf_cnpj: formData.get("cpf_cnpj"),
        telefone: formData.get("telefone"),
        password: formData.get("password"),
      }

      console.log("[v0] Registering user:", userData.email)

      const result = await dataManager.register(userData)

      if (result.success) {
        notifications.show(result.message, "success")
        closeModal("register-modal")
        this.reset()

        // Atualizar interface para usuário logado
        updateUIForLoggedUser()
      } else {
        notifications.show(result.message, "error")
      }
    })
  }

  // Formulário de login
  const loginForm = document.getElementById("login-form")
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const email = formData.get("email")
      const password = formData.get("password")

      console.log("[v0] Logging in user:", email)

      const result = await dataManager.login(email, password)

      if (result.success) {
        notifications.show(result.message, "success")
        closeModal("login-modal")
        this.reset()

        // Atualizar interface para usuário logado
        updateUIForLoggedUser()
      } else {
        notifications.show(result.message, "error")
      }
    })
  }

  // Formulário de nova proposta
  const proposalForm = document.getElementById("proposal-form")
  if (proposalForm) {
    proposalForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      if (!dataManager.isLoggedIn()) {
        notifications.show("Você precisa fazer login primeiro!", "error")
        return
      }

      const formData = new FormData(this)
      const proposalData = {
        cliente_nome: formData.get("cliente_nome"),
        cliente_cpf: formData.get("cliente_cpf"),
        cliente_telefone: formData.get("cliente_telefone"),
        cliente_profissao: formData.get("cliente_profissao"),
        cliente_cep: formData.get("cliente_cep"),
        veiculo_tipo: formData.get("veiculo_tipo"),
        veiculo_marca: formData.get("veiculo_marca"),
        veiculo_modelo: formData.get("veiculo_modelo"),
        veiculo_ano: formData.get("veiculo_ano"),
        veiculo_placa: formData.get("veiculo_placa"),
        valor_veiculo: formData.get("valor_veiculo"),
        tipo_produto: formData.get("tipo_produto"),
        especialista: formData.get("especialista"),
      }

      console.log("[v0] Saving proposal")

      const result = await dataManager.saveProposal(proposalData)

      if (result.success) {
        notifications.show(result.message, "success")
        this.reset()
        loadDashboardData() // Recarregar dados do dashboard
      } else {
        notifications.show(result.message || "Erro ao salvar proposta", "error")
      }
    })
  }

  // Botões de solicitar consulta
  document.querySelectorAll(".whatsapp-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const service = this.getAttribute("data-service") || ""
      openWhatsApp(service)
    })
  })

  // Fechar modais ao clicar no overlay
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none"
        document.body.style.overflow = "auto"
      }
    })
  })

  // Verificar se usuário já está logado
  if (dataManager.isLoggedIn()) {
    updateUIForLoggedUser()
  }

  console.log("[v0] All event listeners initialized")
})

// Função para atualizar interface quando usuário está logado
function updateUIForLoggedUser() {
  const currentUser = JSON.parse(localStorage.getItem("ccapi_current_user") || "{}")

  // Mostrar opção de dashboard no menu de parceiros
  const dashboardOption = document.getElementById("dashboard-option")
  if (dashboardOption) {
    dashboardOption.style.display = "block"
  }

  // Atualizar nome do usuário se houver elemento para isso
  const userNameElement = document.getElementById("user-name")
  if (userNameElement && currentUser.nome) {
    userNameElement.textContent = currentUser.nome
  }

  console.log("[v0] UI updated for logged user:", currentUser.email)
}

// Função de logout
function logout() {
  dataManager.logout()

  // Esconder opção de dashboard
  const dashboardOption = document.getElementById("dashboard-option")
  if (dashboardOption) {
    dashboardOption.style.display = "none"
  }

  // Voltar para página principal se estiver no dashboard
  if (document.getElementById("dashboard").style.display === "block") {
    hideDashboard()
  }

  notifications.show("Logout realizado com sucesso!", "success")
  console.log("[v0] User logged out")
}

// Máscaras para campos de formulário
function applyCPFMask(input) {
  let value = input.value.replace(/\D/g, "")
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  } else {
    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }
  input.value = value
}

function applyPhoneMask(input) {
  let value = input.value.replace(/\D/g, "")
  value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  input.value = value
}

function applyCEPMask(input) {
  let value = input.value.replace(/\D/g, "")
  value = value.replace(/(\d{5})(\d{3})/, "$1-$2")
  input.value = value
}

function applyMoneyMask(input) {
  let value = input.value.replace(/\D/g, "")
  value = (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
  input.value = value
}

console.log("[v0] Script loaded successfully")
