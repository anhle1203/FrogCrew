<template>
    <div class="game-schedule">
        <h2>Available Games</h2>

        <div v-if="availableGames.length === 0" class="empty-message">
            No available games with unassigned positions
        </div>

        <table v-else class="games-table">
            <thead>
                <tr>
                    <th>Game ID</th>
                    <th>Sport</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Unassigned Positions</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="game in availableGames" :key="game.gameId">
                    <td>{{ game.gameId }}</td>
                    <td>{{ game.sportType }}</td>
                    <td>{{ game.gameDate }}</td>
                    <td>{{ game.gameTime }}</td>
                    <td>{{ game.unassignedPositions.join(', ') }}</td>
                    <td>
                        <button @click="showGameDetails(game)" class="action-btn">View Details</button>
                        <span v-if="isRegistered(game.gameId)" class="registered-text">Registered</span>
                        <button v-else-if="game.unassignedPositions.length > 0" @click="showRegisterModal(game)"
                            class="action-btn">Register</button>
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
                        <h4>Unassigned Positions</h4>
                        <div v-for="(position, index) in neededPositions" :key="'needed-' + index"
                            class="position-item">
                            {{ position.position }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Register Modal -->
        <div v-if="showRegisterModalFlag" class="modal-overlay" @click.self="closeRegisterModal">
            <div class="modal-content">
                <button class="close-btn" @click="closeRegisterModal">&times;</button>
                <h3>Register for Game {{ registeringGame.gameId }}</h3>

                <div class="form-group">
                    <label>Select Position:</label>
                    <select v-model="selectedPosition" class="position-select">
                        <option value="">Choose a position</option>
                        <option v-for="position in registeringGame.unassignedPositions" :key="position"
                            :value="position">
                            {{ position }}
                        </option>
                    </select>
                </div>

                <button @click="submitRegistration" class="action-btn" :disabled="!selectedPosition">
                    Register
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ViewUnassignedGames',
    data() {
        return {
            availableGames: [],
            selectedGame: null,
            showRegisterModalFlag: false,
            registeringGame: null,
            selectedPosition: '',
            currentUser: null,
            allGames: [],
            allUsers: []
        }
    },

    computed: {
        neededPositions() {
            if (!this.selectedGame) return [];
            return this.selectedGame.crewPositions.filter(pos => !pos.assigned);
        }
    },

    created() {
        this.loadData();
    },

    methods: {
        loadData() {
            // Load current user
            const userData = localStorage.getItem('currentUser');
            this.currentUser = userData ? JSON.parse(userData) : null;

            // Load all games
            const gamesData = localStorage.getItem('games');
            this.allGames = gamesData ? JSON.parse(gamesData) : [];

            // Filter games where:
            // 1. There are unassigned positions AND
            // 2. The current user is NOT registered for this game (checked by gameId)
            this.availableGames = this.allGames.filter(game => {
                const hasUnassigned = game.crewPositions.some(pos => !pos.assigned);

                // Check if user is registered for this game (by gameId)
                const isRegistered = this.currentUser?.gameRegistered?.some(
                    reg => reg.gameID === game.gameId
                );

                return hasUnassigned && !isRegistered;
            }).map(game => ({
                ...game,
                unassignedPositions: game.crewPositions
                    .filter(pos => !pos.assigned)
                    .map(pos => pos.position)
            }));
        },

        isRegistered(gameId) {
            return this.currentUser?.gameRegistered?.some(
                reg => reg.gameID === gameId
            );
        },

        showGameDetails(game) {
            this.selectedGame = game;
        },

        showRegisterModal(game) {
            if (!game) return;
            this.registeringGame = { ...game }; // Create a copy of the game
            this.selectedPosition = '';
            this.showRegisterModalFlag = true;
        },

        async submitRegistration() {
            try {
                if (!this.registeringGame || !this.selectedPosition || !this.currentUser) {
                    throw new Error('Invalid registration data');
                }

                // Load current data
                const usersData = localStorage.getItem('users');
                this.allUsers = usersData ? JSON.parse(usersData) : [];

                // Update user's gameRegistered array
                const updatedUsers = this.allUsers.map(user => {
                    if (user.username === this.currentUser.username) {
                        const newRegistration = {
                            gameID: this.registeringGame.gameId,
                            position: this.selectedPosition
                        };

                        // Check if already registered to prevent duplicates
                        const isAlreadyRegistered = user.gameRegistered?.some(
                            reg => reg.gameID === newRegistration.gameID &&
                                reg.position === newRegistration.position
                        );

                        return {
                            ...user,
                            gameRegistered: isAlreadyRegistered
                                ? user.gameRegistered
                                : [...(user.gameRegistered || []), newRegistration]
                        };
                    }
                    return user;
                });

                // Save to localStorage
                localStorage.setItem('users', JSON.stringify(updatedUsers));

                // Update current user in localStorage
                const currentUser = updatedUsers.find(u => u.username === this.currentUser.username);
                if (currentUser) {
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    this.currentUser = currentUser;
                }

                this.closeRegisterModal();
                this.loadData(); // Refresh the game list

                alert(`Successfully registered`);
            } catch (error) {
                console.error('Registration error:', error);
                alert('Failed to complete registration. Please try again.');
            }
        },

        closeModal() {
            this.selectedGame = null;
        },

        closeRegisterModal() {
            this.showRegisterModalFlag = false;
            this.registeringGame = null;
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
    margin-right: 5px;
}

.action-btn:hover {
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

.position-select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 8px;
}

.registered-text {
    color: #4D1979;
    font-weight: bold;
    padding: 4px 8px;
    background-color: #f0e6ff;
    border-radius: 4px;
}
</style>