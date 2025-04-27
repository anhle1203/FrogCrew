<template>
    <div class="game-schedule">
        <h2>My Assigned Games</h2>

        <div v-if="assignedGames.length === 0" class="empty-message">
            You currently have no game assignments
        </div>

        <table v-else class="games-table">
            <thead>
                <tr>
                    <th>Game ID</th>
                    <th>Sport</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Position</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="assignment in assignedGames" :key="assignment.gameID">
                    <td>{{ assignment.gameID }}</td>
                    <td>{{ assignment.game.sportType }}</td>
                    <td>{{ assignment.game.gameDate }}</td>
                    <td>{{ assignment.game.gameTime }}</td>
                    <td>{{ assignment.position }}</td>
                    <td>
                        <button @click="showGameDetails(assignment.game)" class="action-btn">View Details</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Game Details Modal -->
        <div v-if="selectedGame" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <button class="close-btn" @click="closeModal">&times;</button>
                <h3>Game Details</h3>

                <div class="game-info">
                    <div class="detail-row">
                        <span class="detail-label">Game ID:</span>
                        <span>{{ selectedGame.gameId }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Sport Type:</span>
                        <span>{{ selectedGame.sportType }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span>{{ selectedGame.gameDate }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time:</span>
                        <span>{{ selectedGame.gameTime }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Venue:</span>
                        <span>{{ selectedGame.venue }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Opponent:</span>
                        <span>{{ selectedGame.opponent || 'N/A' }}</span>
                    </div>
                </div>

                <div class="positions-section">
                    <div class="positions-column">
                        <h4>Assigned Positions</h4>
                        <div v-for="(position, index) in assignedPositions" :key="'assigned-' + index"
                            class="position-item">
                            <strong>{{ position.position }}:</strong>
                            <span v-if="position.assigned">
                                <a href="#" @click.prevent="showUserDetails(position)" class="user-link">
                                    {{ position.assigned }}
                                </a>
                            </span>
                            <span v-else>Unassigned</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Details Modal -->
            <div v-if="selectedUser" class="modal-overlay" @click.self="closeUserModal">
                <div class="modal-content">
                    <button class="close-btn" @click="closeUserModal">&times;</button>
                    <h3>User Details</h3>
                    <div class="user-details">
                        <div class="detail-row">
                            <span class="detail-label">Username:</span>
                            <span>{{ selectedUser.username }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Full Name:</span>
                            <span>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span>{{ selectedUser.email }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Phone:</span>
                            <span>{{ selectedUser.phone }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ViewAssignedGames',
    data() {
        return {
            assignedGames: [],
            selectedGame: null,
            selectedUser: null,
            allUsers: []
        }
    },
    computed: {
        assignedPositions() {
            if (!this.selectedGame) return [];
            return this.selectedGame.crewPositions.filter(pos => pos.assigned);
        }
    },
    created() {
        this.loadData();
    },
    methods: {
        loadData() {
            // Load current user
            const userData = localStorage.getItem('currentUser');
            const currentUser = userData ? JSON.parse(userData) : null;

            // Load all games
            const gamesData = localStorage.getItem('games');
            const allGames = gamesData ? JSON.parse(gamesData) : [];

            // Load all users
            const usersData = localStorage.getItem('users');
            this.allUsers = usersData ? JSON.parse(usersData) : [];

            // Map assigned games
            this.assignedGames = currentUser?.gameAssigned?.map(assignment => {
                const game = allGames.find(g => g.gameId === assignment.gameID);
                return {
                    ...assignment,
                    game: game || { sportType: 'Unknown', gameDate: 'N/A', gameTime: 'N/A' }
                };
            }) || [];
        },

        showGameDetails(game) {
            this.selectedGame = game;
        },

        showUserDetails(position) {
            // Extract username from the assigned field (format: "Full Name (username)")
            const usernameMatch = position.assigned.match(/\(([^)]+)\)/);
            if (usernameMatch && usernameMatch[1]) {
                this.selectedUser = this.allUsers.find(user => user.username === usernameMatch[1]);
            }
        },

        closeModal() {
            this.selectedGame = null;
        },

        closeUserModal() {
            this.selectedUser = null;
        }
    }
}
</script>

<style scoped>
.game-schedule {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.empty-message {
    color: #666;
    font-style: italic;
    padding: 20px;
    text-align: center;
}

.games-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.games-table th,
.games-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.games-table th {
    background-color: #4D1979;
    color: white;
}

.action-btn {
    background-color: #4D1979;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.action-btn:hover {
    background-color: #3a125b;
}

.user-link {
    color: #4D1979;
    text-decoration: none;
    font-weight: bold;
}

.user-link:hover {
    text-decoration: underline;
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
    width: 600px;
    max-width: 90%;
    max-height: 80vh;
    overflow-y: auto;
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

.game-info {
    margin-bottom: 20px;
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

.positions-section {
    margin-top: 20px;
}

.positions-column {
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 5px;
}

.positions-column h4 {
    margin-top: 0;
    color: #4D1979;
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
}

.position-item {
    padding: 8px 0;
    border-bottom: 1px solid #f5f5f5;
}

.user-details {
    margin-top: 20px;
}

.user-link {
    color: #4D1979;
    text-decoration: none;
    font-weight: bold;
    cursor: pointer;
}

.user-link:hover {
    text-decoration: underline;
}
</style>