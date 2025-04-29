<template>
    <div class="header">
        <div class="title">FrogCrew</div>
        <div class="user-header">
            <div class="username">{{ username }}</div>
            <button @click="handleLogout">Logout</button>
        </div>
    </div>
    <div class="dashboard">
        <h1>User Dashboard</h1>
        <div class="button-group">
            <button @click="activeComponent = 'ViewAssignedGames'"
                :class="{ active: activeComponent === 'ViewAssignedGames' }">
                View Assigned Games
            </button>
            <button @click="activeComponent = 'ViewUnassignedGames'"
                :class="{ active: activeComponent === 'ViewUnassignedGames' }">
                View Unassigned Games
            </button>
        </div>

        <component :is="activeComponent" />
    </div>
</template>

<script>
import ViewAssignedGames from '@/components/ViewAssignedGames.vue';
import ViewUnassignedGames from '@/components/ViewUnassignedGames.vue';

export default {
    components: {
        ViewAssignedGames,
        ViewUnassignedGames
    },

    data() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const username = currentUser?.username;
        return {
            username: username || 'User',
            activeComponent: null
        }
    },

    methods: {
        handleLogout() {
            localStorage.removeItem('isAuthenticated')
            localStorage.removeItem('userRole')
            localStorage.removeItem('username')
            localStorage.removeItem('currentUser')
            this.$router.push('/')
        }
    }
}
</script>

<style scoped>
.dashboard {
    text-align: center;
    padding: 20px;
}

.header {
    height: 50px;
    width: 99%;
    background-color: #4D1979;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 20px;
    color: white;
}

.title {
    display: flex;
    align-items: center;
}

.user-header {
    display: flex;
    flex-direction: row;
    margin-left: auto;
    padding-right: 20px;
}

.username {
    display: flex;
    align-items: center;
    margin-right: 10px;
}

.button-group {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
}

button {
    background-color: #4D1979;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #3a125b;
}

button.active {
    background-color: #3a125b;
    font-weight: bold;
}
</style>