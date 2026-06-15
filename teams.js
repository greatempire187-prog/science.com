class TeamsManager {
    constructor() {
        this.teams = [];
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('createTeamBtn').addEventListener('click', () => this.showCreateModal());
        document.getElementById('inviteMemberBtn').addEventListener('click', () => this.showInviteModal());
    }

    async loadTeams() {
        showLoading();
        try {
            this.teams = await API.getTeams();
            this.displayTeams();
        } catch (error) {
            console.error('Error loading teams:', error);
            showToast('Failed to load teams', 'error');
        } finally {
            hideLoading();
        }
    }

    displayTeams() {
        const container = document.getElementById('teamsList');
        
        if (!this.teams || this.teams.length === 0) {
            container.innerHTML = '<p>No teams created yet</p>';
            return;
        }

        container.innerHTML = this.teams.map(team => `
            <div class="team-card">
                <h3>${team.name}</h3>
                <p>${team.description || 'No description'}</p>
                <div class="members">
                    ${team.members.map(member => `
                        <div class="member-avatar" title="${member.name}">
                            ${member.name.charAt(0).toUpperCase()}
                        </div>
                    `).join('')}
                </div>
                <div class="actions">
                    <button class="btn btn-secondary" onclick="viewTeamDetail('${team.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-secondary" onclick="inviteToTeam('${team.id}')">
                        <i class="fas fa-user-plus"></i> Invite
                    </button>
                    <button class="btn btn-danger" onclick="deleteTeam('${team.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    showCreateModal() {
        showCreateTeamModal();
    }

    async createTeam(data) {
        showLoading();
        try {
            const team = await API.createTeam(data);
            this.teams.push(team);
            this.displayTeams();
            showToast('Team created successfully', 'success');
        } catch (error) {
            console.error('Error creating team:', error);
            showToast('Failed to create team', 'error');
        } finally {
            hideLoading();
        }
    }

    showInviteModal() {
        if (this.teams.length === 0) {
            showToast('No teams to invite to', 'warning');
            return;
        }
        showInviteMemberModal(this.teams);
    }

    async inviteMember(teamId, email) {
        showLoading();
        try {
            await API.inviteMember(teamId, email);
            showToast('Invitation sent successfully', 'success');
            await this.loadTeams();
        } catch (error) {
            console.error('Error inviting member:', error);
            showToast('Failed to send invitation', 'error');
        } finally {
            hideLoading();
        }
    }
}

const teamsManager = new TeamsManager();

async function loadTeams() {
    await teamsManager.loadTeams();
}

async function viewTeamDetail(id) {
    showLoading();
    try {
        const team = await API.getTeam(id);
        const members = await API.getTeamMembers(id);
        showTeamDetailModal(team, members);
    } catch (error) {
        console.error('Error viewing team:', error);
        showToast('Failed to load team', 'error');
    } finally {
        hideLoading();
    }
}

async function inviteToTeam(id) {
    const email = prompt('Enter email address to invite:');
    if (!email) return;

    await teamsManager.inviteMember(id, email);
}

async function deleteTeam(id) {
    if (!confirm('Are you sure you want to delete this team?')) {
        return;
    }

    showLoading();
    try {
        await API.deleteTeam(id);
        showToast('Team deleted successfully', 'success');
        await loadTeams();
    } catch (error) {
        console.error('Error deleting team:', error);
        showToast('Failed to delete team', 'error');
    } finally {
        hideLoading();
    }
}
