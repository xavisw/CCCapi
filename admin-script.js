// Admin Dashboard JavaScript
class AdminDashboard {
  constructor() {
    this.currentProposal = null
    this.currentAction = null
    this.syncManager = window.syncManager
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadOverviewData()
    this.loadSpecialistProposals()
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const section = e.currentTarget.dataset.section
        this.showSection(section)
      })
    })

    // Modal controls
    document.getElementById("closeProposalModal").addEventListener("click", () => {
      this.closeModal("proposalModal")
    })

    document.getElementById("closeObservationModal").addEventListener("click", () => {
      this.closeModal("observationModal")
    })

    // Proposal actions
    document.getElementById("approveProposal").addEventListener("click", () => {
      this.handleProposalAction("approved")
    })

    document.getElementById("pendProposal").addEventListener("click", () => {
      this.handleProposalAction("pending")
    })

    document.getElementById("rejectProposal").addEventListener("click", () => {
      this.handleProposalAction("rejected")
    })

    // Observation modal
    document.getElementById("cancelObservation").addEventListener("click", () => {
      this.closeModal("observationModal")
    })

    document.getElementById("confirmObservation").addEventListener("click", () => {
      this.confirmObservation()
    })

    // Logout
    document.getElementById("adminLogout").addEventListener("click", () => {
      this.logout()
    })
  }

  showSection(sectionId) {
    // Update navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelector(`[data-section="${sectionId}"]`).classList.add("active")

    // Update content
    document.querySelectorAll(".admin-section").forEach((section) => {
      section.classList.remove("active")
    })
    document.getElementById(sectionId).classList.add("active")

    // Load specialist data if needed
    if (sectionId !== "overview") {
      this.loadSpecialistData(sectionId)
    }
  }

  async loadOverviewData() {
    if (this.syncManager && this.syncManager.isOnline) {
      await this.syncManager.syncAllData()
    }

    // Get data from localStorage (now synced)
    const proposals = JSON.parse(localStorage.getItem("ccapi_proposals") || "[]")
    const users = JSON.parse(localStorage.getItem("ccapi_users") || "[]")

    // Update stats
    document.getElementById("totalSystemProposals").textContent = proposals.length
    document.getElementById("totalUsers").textContent = users.length
    document.getElementById("pendingSystemProposals").textContent = proposals.filter(
      (p) => p.status === "pending",
    ).length
    document.getElementById("approvedSystemProposals").textContent = proposals.filter(
      (p) => p.status === "approved",
    ).length

    // Load recent proposals
    this.loadRecentProposals(proposals)
  }

  loadRecentProposals(proposals) {
    const tbody = document.getElementById("recentProposalsTable")

    if (proposals.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="no-data">Nenhuma proposta encontrada</td></tr>'
      return
    }

    // Sort by date (most recent first)
    const sortedProposals = proposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const recentProposals = sortedProposals.slice(0, 10)

    tbody.innerHTML = recentProposals
      .map(
        (proposal) => `
            <tr onclick="adminDashboard.viewProposal('${proposal.id}')">
                <td>#${proposal.id.slice(-6)}</td>
                <td>${proposal.clientName}</td>
                <td>${this.capitalizeFirst(proposal.specialist)}</td>
                <td>R$ ${this.formatMoney(proposal.financeValue)}</td>
                <td><span class="status-badge status-${proposal.status}">${this.getStatusText(proposal.status)}</span></td>
                <td>${this.formatDate(proposal.createdAt)}</td>
            </tr>
        `,
      )
      .join("")
  }

  loadSpecialistProposals() {
    const specialists = ["fabricio", "neto", "wandreyna", "suzana", "eder"]
    specialists.forEach((specialist) => {
      this.loadSpecialistData(specialist)
    })
  }

  loadSpecialistData(specialist) {
    const proposals = JSON.parse(localStorage.getItem("ccapi_proposals") || "[]")
    const specialistProposals = proposals.filter((p) => p.specialist === specialist)

    const container = document.querySelector(`[data-specialist="${specialist}"]`)
    if (!container) return

    if (specialistProposals.length === 0) {
      container.innerHTML = `
                <div class="no-data" style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma proposta atribuída a ${this.capitalizeFirst(specialist)}</p>
                </div>
            `
      return
    }

    container.innerHTML = `
            <div class="proposals-table">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cliente</th>
                            <th>Veículo</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${specialistProposals
                          .map(
                            (proposal) => `
                            <tr>
                                <td>#${proposal.id.slice(-6)}</td>
                                <td>${proposal.clientName}</td>
                                <td>${proposal.vehicleBrand} ${proposal.vehicleModel}</td>
                                <td>R$ ${this.formatMoney(proposal.financeValue)}</td>
                                <td><span class="status-badge status-${proposal.status}">${this.getStatusText(proposal.status)}</span></td>
                                <td>${this.formatDate(proposal.createdAt)}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm" onclick="adminDashboard.viewProposal('${proposal.id}')">
                                        <i class="fas fa-eye"></i>
                                        Ver Detalhes
                                    </button>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `
  }

  viewProposal(proposalId) {
    const proposals = JSON.parse(localStorage.getItem("ccapi_proposals") || "[]")
    const proposal = proposals.find((p) => p.id === proposalId)

    if (!proposal) return

    this.currentProposal = proposal
    this.showProposalDetails(proposal)
    this.showModal("proposalModal")
  }

  showProposalDetails(proposal) {
    const detailsContainer = document.getElementById("proposalDetails")

    detailsContainer.innerHTML = `
            <div class="proposal-details">
                <div class="detail-section">
                    <h3><i class="fas fa-user"></i> Dados do Cliente</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Nome Completo</span>
                            <span class="detail-value">${proposal.clientName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">CPF/CNPJ</span>
                            <span class="detail-value">${proposal.clientDocument}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Telefone</span>
                            <span class="detail-value">${proposal.clientPhone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${proposal.clientEmail}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Profissão</span>
                            <span class="detail-value">${proposal.clientProfession || "Não informado"}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Renda Mensal</span>
                            <span class="detail-value">R$ ${this.formatMoney(proposal.clientIncome)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">CEP</span>
                            <span class="detail-value">${proposal.clientCep || "Não informado"}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Endereço</span>
                            <span class="detail-value">${proposal.clientAddress}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3><i class="fas fa-car"></i> Dados do Veículo</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Tipo</span>
                            <span class="detail-value">${this.capitalizeFirst(proposal.vehicleType)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Marca</span>
                            <span class="detail-value">${proposal.vehicleBrand}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Modelo</span>
                            <span class="detail-value">${proposal.vehicleModel}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ano</span>
                            <span class="detail-value">${proposal.vehicleYear}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Placa</span>
                            <span class="detail-value">${proposal.vehiclePlate || "Não informado"}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Valor do Veículo</span>
                            <span class="detail-value">R$ ${this.formatMoney(proposal.vehicleValue)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Condição</span>
                            <span class="detail-value">${this.capitalizeFirst(proposal.vehicleCondition)}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3><i class="fas fa-calculator"></i> Dados do Financiamento</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Valor a Financiar</span>
                            <span class="detail-value">R$ ${this.formatMoney(proposal.financeValue)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Entrada</span>
                            <span class="detail-value">R$ ${this.formatMoney(proposal.downPayment)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tipo de Produto</span>
                            <span class="detail-value">${this.capitalizeFirst(proposal.financeType)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Especialista</span>
                            <span class="detail-value">${this.capitalizeFirst(proposal.specialist)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status Atual</span>
                            <span class="detail-value">
                                <span class="status-badge status-${proposal.status}">
                                    ${this.getStatusText(proposal.status)}
                                </span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Data de Criação</span>
                            <span class="detail-value">${this.formatDate(proposal.createdAt)}</span>
                        </div>
                    </div>
                </div>

                ${
                  proposal.observation
                    ? `
                    <div class="detail-section">
                        <h3><i class="fas fa-comment"></i> Observação</h3>
                        <p style="color: #e2e8f0; line-height: 1.6;">${proposal.observation}</p>
                    </div>
                `
                    : ""
                }
            </div>
        `
  }

  handleProposalAction(action) {
    this.currentAction = action

    if (action === "approved") {
      this.updateProposalStatus(action, "Sua proposta foi aprovada! Nosso especialista entrará em contato em breve.")
    } else {
      // For pending and rejected, ask for observation
      document.getElementById("observationTitle").textContent =
        action === "pending" ? "Motivo da Pendência" : "Motivo da Recusa"
      this.showModal("observationModal")
    }
  }

  confirmObservation() {
    const observation = document.getElementById("observationText").value.trim()

    if (!observation) {
      alert("Por favor, adicione uma observação.")
      return
    }

    const message =
      this.currentAction === "pending"
        ? `Sua proposta está pendente. Motivo: ${observation}`
        : `Sua proposta foi recusada. Motivo: ${observation}`

    this.updateProposalStatus(this.currentAction, message, observation)
    this.closeModal("observationModal")
    document.getElementById("observationText").value = ""
  }

  async updateProposalStatus(status, message, observation = "") {
    const proposals = JSON.parse(localStorage.getItem("ccapi_proposals") || "[]")
    const proposalIndex = proposals.findIndex((p) => p.id === this.currentProposal.id)

    if (proposalIndex === -1) return

    // Update proposal
    proposals[proposalIndex].status = status
    proposals[proposalIndex].statusMessage = message
    proposals[proposalIndex].observation = observation
    proposals[proposalIndex].updatedAt = new Date().toISOString()

    // Save to localStorage
    localStorage.setItem("ccapi_proposals", JSON.stringify(proposals))

    if (this.syncManager) {
      await this.syncManager.forceSyncData("proposals", proposals)
    }

    // Add notification for user
    await this.addUserNotification(proposals[proposalIndex].userId, message, status)

    // Refresh data
    this.loadOverviewData()
    this.loadSpecialistProposals()
    this.closeModal("proposalModal")

    // Show success message
    this.showNotification(`Proposta ${this.getStatusText(status).toLowerCase()} com sucesso!`, "success")
  }

  async addUserNotification(userId, message, status) {
    const notifications = JSON.parse(localStorage.getItem("ccapi_notifications") || "[]")

    notifications.push({
      id: Date.now().toString(),
      userId: userId,
      message: message,
      status: status,
      read: false,
      createdAt: new Date().toISOString(),
    })

    localStorage.setItem("ccapi_notifications", JSON.stringify(notifications))

    if (this.syncManager) {
      await this.syncManager.forceSyncData("notifications", notifications)
    }
  }

  showModal(modalId) {
    document.getElementById(modalId).classList.add("active")
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active")
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
            <i class="fas fa-${type === "success" ? "check-circle" : "info-circle"}"></i>
            <span>${message}</span>
        `

    // Add styles
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#10b981" : "#3b82f6"};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `

    document.body.appendChild(notification)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  logout() {
    if (confirm("Tem certeza que deseja sair?")) {
      window.location.href = "index.html"
    }
  }

  // Utility functions
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  formatMoney(value) {
    return Number.parseFloat(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  getStatusText(status) {
    const statusMap = {
      pending: "Pendente",
      approved: "Aprovada",
      rejected: "Recusada",
    }
    return statusMap[status] || "Desconhecido"
  }
}

// Add CSS animations
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

// Initialize admin dashboard
const adminDashboard = new AdminDashboard()
