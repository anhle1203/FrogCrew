<template>
    <div class="crew-members">
        <h2>Crew Members</h2>
        <table class="crew-table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.username">
                    <td>{{ user.username }}</td>
                    <td>{{ user.firstName }} {{ user.lastName }}</td>
                    <td>
                        <button @click="showUserDetails(user)" class="view-btn">View Details</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <button @click="openInviteModal" class="invite-btn">Invite New Crew Member</button>

        <!-- User Details Modal -->
        <div v-if="selectedUser" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <button class="close-btn" @click="closeModal">&times;</button>
                <h3>User Details</h3>
                <div class="user-details">
                    <div class="detail-row">
                        <span class="detail-label">Username:</span>
                        <span>{{ selectedUser.username }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">First Name:</span>
                        <span>{{ selectedUser.firstName }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Last Name:</span>
                        <span>{{ selectedUser.lastName }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span>{{ selectedUser.email }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span>{{ selectedUser.phone }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Role:</span>
                        <span>{{ selectedUser.role }}</span>
                    </div>
                </div>
                <button v-if="selectedUser.role !== 'admin'" @click="confirmDelete" class="delete-btn">
                    Delete User
                </button>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteConfirmation" class="modal-overlay">
            <div class="confirmation-modal">
                <p>Do you want to delete {{ selectedUser.username }}?</p>
                <div class="confirmation-buttons">
                    <button @click="deleteUser" class="confirm-btn">Yes</button>
                    <button @click="cancelDelete" class="cancel-btn">No</button>
                </div>
            </div>
        </div>

        <!-- Invite New Member Modal -->
        <div v-if="showInviteModal" class="modal-overlay" @click.self="closeInviteModal">
            <div class="modal-content">
                <button class="close-btn" @click="closeInviteModal">&times;</button>
                <h3>Invite New Crew Member</h3>
                <div class="form-group">
                    <label for="inviteEmail">Email Address:</label>
                    <input type="email" id="inviteEmail" v-model="inviteEmail" placeholder="Enter email address"
                        required />
                </div>
                <button @click="sendInvite" class="invite-submit-btn">Send Invite</button>
            </div>
            <div v-if="inviteError" class="alert alert-danger mt-3">
                {{ inviteError }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ViewCrewMembers',
    data() {
        return {
            users: [],
            selectedUser: null,
            showDeleteConfirmation: false,
            showInviteModal: false,
            inviteEmail: ''
        }
    },
    created() {
        this.loadUsers();
    },
    methods: {
        loadUsers() {
            const storedUsers = localStorage.getItem('users');
            if (storedUsers) {
                this.users = JSON.parse(storedUsers);
            }
        },

        showUserDetails(user) {
            this.selectedUser = user;
        },

        closeModal() {
            this.selectedUser = null;
            this.showDeleteConfirmation = false;
        },

        confirmDelete() {
            this.showDeleteConfirmation = true;
        },

        cancelDelete() {
            this.showDeleteConfirmation = false;
        },

        deleteUser() {
            // 1. Filter out the selected user from users array
            const updatedUsers = this.users.filter(
                user => user.username !== this.selectedUser.username
            );

            // 2. Update games to clear this user's assignments
            const games = JSON.parse(localStorage.getItem('games')) || [];
            const updatedGames = games.map(game => {
                const updatedPositions = game.crewPositions.map(position => {
                    // Check if this position was assigned to the deleted user
                    if (position.username === this.selectedUser.username) {
                        return {
                            ...position,
                            assigned: '',          // Clear full name
                            username: ''   // Clear username
                        };
                    }
                    return position;
                });

                return {
                    ...game,
                    crewPositions: updatedPositions
                };
            });

            // 3. Update localStorage
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            localStorage.setItem('games', JSON.stringify(updatedGames));

            // 4. Update local state
            this.users = updatedUsers;
            this.showDeleteConfirmation = false;
            this.selectedUser = null;

            // 5. Show success message
            alert(`User has been deleted`);
        },

        openInviteModal() {
            this.showInviteModal = true;
            this.inviteEmail = '';
            this.inviteError = '';
        },

        closeInviteModal() {
            this.showInviteModal = false;
        },

        sendInvite() {
            // Validate email format
            if (!this.inviteEmail || !this.validateEmail(this.inviteEmail)) {
                alert('Please enter a valid email address');
                return;
            }

            // Get existing data
            const invitedUsers = JSON.parse(localStorage.getItem('invitedUsers')) || [];
            const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

            // Check if email already exists in either array
            const emailLower = this.inviteEmail.toLowerCase();

            if (invitedUsers.some(email => email.toLowerCase() === emailLower)) {
                alert('This email has already been invited');
                return;
            }

            if (existingUsers.some(user => user.email.toLowerCase() === emailLower)) {
                alert('This email is already registered as a user');
                return;
            }

            // Add new email and save
            invitedUsers.push(this.inviteEmail);
            localStorage.setItem('invitedUsers', JSON.stringify(invitedUsers));

            alert(`Invite sent to ${this.inviteEmail}`);
            this.closeInviteModal();
        },

        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
    }
}
</script>

<style scoped>
.crew-members {
    margin: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.crew-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.crew-table th,
.crew-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.crew-table th {
    background-color: #4D1979;
    color: white;
}

.crew-table tr:hover {
    background-color: #f5f5f5;
}

.view-btn {
    background-color: #4D1979;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.view-btn:hover {
    background-color: #3a125b;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 25px;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
}

.user-details {
    margin-top: 20px;
}

.detail-row {
    display: flex;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: bold;
    width: 120px;
    color: #4D1979;
}

.delete-btn {
    background-color: #dc3545;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.2s;
}

.delete-btn:hover {
    background-color: #c82333;
}

.confirmation-modal {
    background: white;
    padding: 25px;
    border-radius: 8px;
    width: 350px;
    max-width: 90%;
    text-align: center;
}

.confirmation-modal p {
    margin-bottom: 20px;
    font-size: 1.1rem;
}

.confirmation-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.confirm-btn {
    background-color: #dc3545;
    color: white;
    padding: 8px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.confirm-btn:hover {
    background-color: #c82333;
}

.cancel-btn {
    background-color: #6c757d;
    color: white;
    padding: 8px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.cancel-btn:hover {
    background-color: #5a6268;
}

.invite-btn {
    background-color: #4D1979;
    color: white;
    padding: 10px 20px;
    margin-top: 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.invite-btn:hover {
    background-color: #3a125b;
}

.invite-submit-btn {
    background-color: #28a745;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 15px;
    transition: background-color 0.2s;
}

.invite-submit-btn:hover {
    background-color: #218838;
}

.form-group {
    margin: 15px 0;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>