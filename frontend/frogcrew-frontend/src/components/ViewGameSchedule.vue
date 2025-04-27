<template>
    <div class="game-schedule">
        <h2>Game Schedule</h2>
        <table class="games-table">
            <thead>
                <tr>
                    <th>Game ID</th>
                    <th>Sport</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="game in games" :key="game.gameId">
                    <td>{{ game.gameId }}</td>
                    <td>{{ game.sportType }}</td>
                    <td>{{ game.gameDate }}</td>
                    <td>{{ game.gameTime }}</td>
                    <td>
                        <button @click="showGameDetails(game)" class="action-btn">View Details</button>
                        <button @click="scheduleGame(game)" class="action-btn">Schedule Crew</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <button @click="showAddGameModal" class="add-game-btn">Add Game</button>

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
                        <span>{{ selectedGame.opponent }}</span>
                    </div>
                </div>

                <div class="positions-section">
                    <div class="positions-column">
                        <h4>Assigned Positions</h4>
                        <div v-for="(position, index) in assignedPositions" :key="'assigned-' + index"
                            class="position-item">
                            <strong>{{ position.position }}:</strong> {{ position.assigned }}
                        </div>
                        <div v-if="assignedPositions.length === 0" class="empty-message">
                            No positions assigned yet
                        </div>
                    </div>

                    <div class="positions-column">
                        <h4>Needed Positions</h4>
                        <div v-for="(position, index) in neededPositions" :key="'needed-' + index"
                            class="position-item">
                            <strong>{{ position.position }}</strong>
                        </div>
                        <div v-if="neededPositions.length === 0" class="empty-message">
                            All positions are filled
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Game Modal -->
        <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
            <div class="modal-content">
                <button class="close-btn" @click="closeAddModal">&times;</button>
                <h3>Add New Game</h3>

                <div class="form-group">
                    <label for="sportType">Sport Type:</label>
                    <input type="text" id="sportType" v-model="newGame.sportType" required
                        :class="{ 'is-invalid': errors.sportType }" />
                    <div v-if="errors.sportType" class="invalid-feedback">{{ errors.sportType }}</div>
                </div>

                <div class="form-group">
                    <label for="gameDate">Date:</label>
                    <input type="date" id="gameDate" v-model="newGame.gameDate" required
                        :class="{ 'is-invalid': errors.gameDate }" />
                    <div v-if="errors.gameDate" class="invalid-feedback">{{ errors.gameDate }}</div>
                </div>

                <div class="form-group">
                    <label for="gameTime">Time:</label>
                    <input type="text" id="gameTime" v-model="newGame.gameTime" placeholder="00:00 - 00:00" required
                        :class="{ 'is-invalid': errors.gameTime }" @input="formatGameTime" />
                    <div v-if="errors.gameTime" class="invalid-feedback">{{ errors.gameTime }}</div>
                </div>

                <div class="form-group">
                    <label for="venue">Venue:</label>
                    <input type="text" id="venue" v-model="newGame.venue" required
                        :class="{ 'is-invalid': errors.venue }" />
                    <div v-if="errors.venue" class="invalid-feedback">{{ errors.venue }}</div>
                </div>

                <div class="form-group">
                    <label for="opponent">Opponent (optional):</label>
                    <input type="text" id="opponent" v-model="newGame.opponent" />
                </div>

                <div class="form-group">
                    <label>Positions:</label>
                    <div v-for="(position, index) in newGame.positions" :key="index" class="position-input">
                        <input type="text" v-model="newGame.positions[index]" placeholder="Position name" required />
                        <button @click="removePosition(index)" class="remove-btn">&times;</button>
                    </div>
                    <button @click="addPosition" class="add-position-btn">+ Add Position</button>
                </div>

                <button @click="submitNewGame" class="submit-btn">Add Game</button>
            </div>
        </div>

        <!-- Schedule Crew Modal -->
        <div v-if="schedulingGame" class="modal-overlay" @click.self="closeScheduleModal">
            <div class="modal-content">
                <button class="close-btn" @click="closeScheduleModal">&times;</button>
                <h3>Schedule Crew for {{ schedulingGame.sportType }} ({{ schedulingGame.gameDate }})</h3>

                <div class="positions-list">
                    <div v-for="position in neededPositionsForScheduling" :key="position.position"
                        class="position-item">
                        <h4>{{ position.position }}</h4>
                        <select v-model="position.assignedUser" class="user-select">
                            <option value="">Select Crew Member</option>
                            <option v-for="user in getAvailableUsersForPosition(position.position)" :key="user.username"
                                :value="user.username">
                                {{ user.firstName }} {{ user.lastName }} ({{ user.username }})
                            </option>
                        </select>
                    </div>
                </div>

                <button @click="submitCrewSchedule" class="submit-btn">Confirm Assignments</button>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    name: 'ViewGameSchedule',
    data() {
        return {
            games: [],
            selectedGame: null,
            showAddModal: false,
            schedulingGame: null,
            neededPositionsForScheduling: [],
            newGame: {
                gameId: '',
                sportType: '',
                gameDate: '',
                gameTime: '',
                venue: '',
                opponent: '',
                positions: ['']
            },
            errors: {
                sportType: '',
                gameDate: '',
                gameTime: '',
                venue: ''
            }
        }
    },
    computed: {
        assignedPositions() {
            if (!this.selectedGame) return [];
            return this.selectedGame.crewPositions.filter(pos => pos.assigned);
        },
        neededPositions() {
            if (!this.selectedGame) return [];
            return this.selectedGame.crewPositions.filter(pos => !pos.assigned);
        }
    },
    created() {
        this.loadGames();
    },
    methods: {
        loadGames() {
            const storedGames = localStorage.getItem('games');
            this.games = storedGames ? JSON.parse(storedGames) : [];
        },

        showGameDetails(game) {
            this.selectedGame = game;
        },

        closeModal() {
            this.selectedGame = null;
        },

        showAddGameModal() {
            this.showAddModal = true;
            this.resetNewGame();
        },

        closeAddModal() {
            this.showAddModal = false;
        },

        resetNewGame() {
            this.newGame = {
                gameId: this.generateGameId(),
                sportType: '',
                gameDate: '',
                gameTime: '',
                venue: '',
                opponent: '',
                positions: ['']
            };
            this.errors = {
                sportType: '',
                gameDate: '',
                gameTime: '',
                venue: ''
            };
        },

        generateGameId() {
            const now = new Date();
            // Format: YYYYMMDD-HHMMSS
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            return `${year}${month}${day}-${hours}${minutes}${seconds}`;
        },

        formatGameTime() {
            // Auto-format to 00:00 - 00:00 pattern
            let value = this.newGame.gameTime.replace(/\D/g, '');
            if (value.length > 7) {
                value = value.substring(0, 2) + ':' + value.substring(2, 4) + ' - ' + value.substring(4, 6) + ':' + value.substring(6, 8);
            }
            this.newGame.gameTime = value.substring(0, 13);
        },

        addPosition() {
            this.newGame.positions.push('');
        },

        removePosition(index) {
            if (this.newGame.positions.length > 1) {
                this.newGame.positions.splice(index, 1);
            }
        },

        validateGame() {
            let isValid = true;
            this.errors = {
                sportType: '',
                gameDate: '',
                gameTime: '',
                venue: ''
            };

            if (!this.newGame.sportType.trim()) {
                this.errors.sportType = 'Sport type is required';
                isValid = false;
            }

            if (!this.newGame.gameDate) {
                this.errors.gameDate = 'Date is required';
                isValid = false;
            }

            if (!this.newGame.gameTime || !/^\d{2}:\d{2} - \d{2}:\d{2}$/.test(this.newGame.gameTime)) {
                this.errors.gameTime = 'Please use 00:00 - 00:00 format';
                isValid = false;
            }

            if (!this.newGame.venue.trim()) {
                this.errors.venue = 'Venue is required';
                isValid = false;
            }

            // Validate positions
            for (let i = 0; i < this.newGame.positions.length; i++) {
                if (!this.newGame.positions[i].trim()) {
                    alert('Please fill in all position fields or remove empty ones');
                    return false;
                }
            }

            return isValid;
        },

        submitNewGame() {
            if (!this.validateGame()) return;

            // Generate gameID
            const gameId = this.generateGameId();

            const game = {
                gameId: this.newGame.gameId,
                sportType: this.newGame.sportType,
                gameDate: this.newGame.gameDate,
                gameTime: this.newGame.gameTime,
                venue: this.newGame.venue,
                opponent: this.newGame.opponent || '',
                crewPositions: this.newGame.positions.map(position => ({
                    position,
                    assigned: ''
                }))
            };

            // Update localStorage
            const updatedGames = [...this.games, game];
            localStorage.setItem('games', JSON.stringify(updatedGames));

            // Update local state
            this.games = updatedGames;
            this.closeAddModal();
            alert('Game added successfully!');
        },

        scheduleGame(game) {
            this.schedulingGame = game;
            this.neededPositionsForScheduling = game.crewPositions
                .filter(pos => !pos.assigned)
                .map(pos => ({
                    position: pos.position,
                    assignedUser: ''
                }));
        },

        closeScheduleModal() {
            this.schedulingGame = null;
            this.neededPositionsForScheduling = [];
        },

        getAvailableUsersForPosition(position) {
            const allUsers = JSON.parse(localStorage.getItem('users')) || [];
            return allUsers
                .filter(user =>
                    user.gameRegistered?.some(reg =>
                        reg.gameID === this.schedulingGame.gameId &&
                        reg.position === position
                    )
                )
                .map(user => ({
                    ...user,
                    displayName: `${user.firstName} ${user.lastName} (${user.username})`
                }));
        },

        async submitCrewSchedule() {
            try {
                const allUsers = JSON.parse(localStorage.getItem('users')) || [];

                // Update game in games array
                const updatedGames = this.games.map(game => {
                    if (game.gameId !== this.schedulingGame.gameId) return game;

                    const updatedCrewPositions = game.crewPositions.map(pos => {
                        const assignedPosition = this.neededPositionsForScheduling.find(
                            p => p.position === pos.position && p.assignedUser
                        );

                        if (!assignedPosition) return pos;

                        // Find user details to get full name
                        const assignedUser = allUsers.find(u => u.username === assignedPosition.assignedUser);
                        const fullName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : '';

                        return {
                            ...pos,
                            assigned: fullName + ' (' + assignedPosition.assignedUser + ')',
                            username: assignedPosition.assignedUser
                        };
                    });

                    return {
                        ...game,
                        crewPositions: updatedCrewPositions
                    };
                });

                this.selectedGame = updatedGames.find(g => g.gameId === this.selectedGame?.gameId) || null;

                // Update users
                const updatedUsers = allUsers.map(user => {
                    const assignedPosition = this.neededPositionsForScheduling.find(
                        pos => pos.assignedUser === user.username
                    );

                    if (assignedPosition) {
                        return {
                            ...user,
                            gameRegistered: (user.gameRegistered || []).filter(
                                reg => reg.gameID !== this.schedulingGame.gameId
                            ),
                            gameAssigned: [
                                ...(user.gameAssigned || []),
                                {
                                    gameID: this.schedulingGame.gameId,
                                    position: assignedPosition.position
                                }
                            ]
                        };
                    } else {
                        return {
                            ...user,
                            gameRegistered: (user.gameRegistered || []).filter(
                                reg =>
                                    !(
                                        reg.gameID === this.schedulingGame.gameId &&
                                        this.neededPositionsForScheduling.some(
                                            pos =>
                                                pos.position === reg.position &&
                                                pos.assignedUser
                                        )
                                    )
                            )
                        };
                    }
                });

                // Save to localStorage
                localStorage.setItem('games', JSON.stringify(updatedGames));
                localStorage.setItem('users', JSON.stringify(updatedUsers));

                // Update local state
                this.games = updatedGames;
                this.closeScheduleModal();
                alert('Crew assignments saved successfully!');

            } catch (error) {
                console.error('Error saving crew assignments:', error);
                alert('Failed to save crew assignments');
            }
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
    margin-right: 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
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

.game-info {
    margin-bottom: 20px;
}

.game-info div {
    margin-bottom: 8px;
}

.positions-section {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}

.positions-column {
    flex: 1;
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
}

.empty-message {
    color: #666;
    font-style: italic;
    padding: 8px 0;
}

.add-game-btn {
    background-color: #4D1979;
    color: white;
    padding: 10px 20px;
    margin-top: 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.add-game-btn:hover {
    background-color: #3a125b;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.is-invalid {
    border-color: #dc3545;
}

.invalid-feedback {
    color: #dc3545;
    font-size: 0.875em;
}

.position-input {
    display: flex;
    margin-bottom: 8px;
}

.position-input input {
    flex: 1;
    margin-right: 8px;
}

.remove-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    width: 30px;
    cursor: pointer;
}

.add-position-btn {
    background-color: #6c757d;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 5px;
}

.submit-btn {
    background-color: #4D1979;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 15px;
    width: 100%;
}

.submit-btn:hover {
    background-color: #3a125b;
}

.positions-list {
    margin: 20px 0;
}

.position-item {
    margin-bottom: 15px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 4px;
}

.position-item h4 {
    margin-top: 0;
    color: #4D1979;
}

.user-select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 8px;
}
</style>