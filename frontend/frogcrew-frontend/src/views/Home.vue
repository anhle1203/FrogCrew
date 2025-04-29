<template>
    <div class="header">FrogCrew</div>
    <div class="login-container">
        <h1>Login</h1>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" v-model="form.username" required
                    :class="{ 'is-invalid': errors.username }" />
                <div v-if="errors.username" class="invalid-feedback">
                    {{ errors.username }}
                </div>
            </div>

            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" v-model="form.password" required
                    :class="{ 'is-invalid': errors.password }" />
                <div v-if="errors.password" class="invalid-feedback">
                    {{ errors.password }}
                </div>
            </div>

            <div class="buttons">
                <button type="submit" :disabled="isSubmitting" id="loginBtn">
                    {{ isSubmitting ? 'Logging in...' : 'Login' }}
                </button>

                <button type="button" id="register-btn" @click="handleRegister">Register</button>
            </div>

            <div v-if="loginError" class="alert alert-danger mt-3">
                {{ loginError }}
            </div>
        </form>
    </div>
</template>

<script>
if (!localStorage.getItem('users')) {
    const initialUsers = [
        {
            username: 'admin',
            password: 'admin123',
            firstName: 'Ad',
            lastName: 'Min',
            email: 'admin@gmail.com',
            phone: '000-000-0000',
            role: 'admin'
        },
        {
            username: 'user',
            password: 'user123',
            firstName: 'User',
            lastName: 'One',
            email: 'user@gmail.com',
            phone: '000-000-0001',
            role: 'user',
            gameRegistered: [{ gameID: '00000000-000000', position: 'Supporter' }, { gameID: '00000000-000001', position: 'Videographer' }],
            gameAssigned: []
        },
        {
            username: 'user2',
            password: 'user123',
            firstName: 'User',
            lastName: 'Two',
            email: 'user2@gmail.com',
            phone: '000-000-0002',
            role: 'user',
            gameRegistered: [{ gameID: '00000000-000000', position: 'Supporter' }],
            gameAssigned: []
        }
    ];
    localStorage.setItem('users', JSON.stringify(initialUsers));
}

export default {
    data() {
        return {
            form: {
                username: '',
                password: ''
            },
            errors: {
                username: '',
                password: ''
            },
            isSubmitting: false,
            loginError: ''
        }
    },
    methods: {
        // Validate form
        validateForm() {
            let isValid = true

            // Reset errors
            this.errors = { username: '', password: '' }

            // Username validation
            if (!this.form.username.trim()) {
                this.errors.username = 'Username is required'
                isValid = false
            }

            // Password validation
            if (!this.form.password) {
                this.errors.password = 'Password is required'
                isValid = false
            }

            return isValid
        },
        // Handle Login
        async handleLogin() {
            if (!this.validateForm()) return

            this.isSubmitting = true
            this.loginError = ''

            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Mock authentication
                const users = JSON.parse(localStorage.getItem('users'));

                const foundUser = users.find(
                    u => u.username === this.form.username && u.password === this.form.password
                )

                if (foundUser) {
                    localStorage.setItem('isAuthenticated', 'true')
                    localStorage.setItem('userRole', foundUser.role)
                    localStorage.setItem('currentUser', JSON.stringify(foundUser))

                    // Set the games schedule
                    if (!localStorage.getItem('games')) {
                        const initialGames = [
                            {
                                gameId: '00000000-000000',
                                sportType: 'Football',
                                gameDate: '2025-01-01',
                                gameTime: '9:00 - 11:00',
                                venue: 'TCU Stadium',
                                opponent: 'Baylor',
                                crewPositions: [
                                    {
                                        position: 'Videographer',
                                        assigned: '',
                                        username: ''
                                    },
                                    {
                                        position: 'Coach',
                                        assigned: 'Doe',
                                        username: ''
                                    },
                                    {
                                        position: 'Supporter',
                                        assigned: '',
                                        username: ''
                                    }
                                ]
                            },
                            {
                                gameId: '00000000-000001',
                                sportType: 'Baseball',
                                gameDate: '2025-01-02',
                                gameTime: '10:00 - 22:00',
                                venue: 'TCU Stadium',
                                opponent: 'Baylor',
                                crewPositions: [
                                    {
                                        position: 'Videographer',
                                        assigned: '',
                                        username: ''
                                    },
                                    {
                                        position: 'Coach',
                                        assigned: 'Doe',
                                        username: ''
                                    },
                                    {
                                        position: 'Supporter',
                                        assigned: '',
                                        username: ''
                                    }
                                ]
                            }
                        ];
                        localStorage.setItem('games', JSON.stringify(initialGames));
                    }

                    // Redirect based on role
                    this.$router.push(foundUser.role === 'admin' ? '/admin' : '/user')
                } else {
                    this.loginError = 'Invalid username or password'
                }
            } catch (error) {
                this.loginError = 'Login failed. Please try again later.'
                console.error('Login error:', error)
            } finally {
                this.isSubmitting = false
            }
        },
        // Handle Register
        handleRegister() {
            this.$router.push('/register');
        }
    }
}
</script>

<style scoped>
.header {
    height: 50px;
    width: 99%;
    background-color: #4D1979;
    display: flex;
    align-items: center;
    padding-left: 20px;
    color: white;
}

.login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-top: 50px;
}

.form-group {
    margin-bottom: 15px;
    margin-right: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 1rem;
}

input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

input.is-invalid {
    border-color: #dc3545;
}

.invalid-feedback {
    color: #dc3545;
    font-size: 0.875em;
}

.buttons {
    display: flex;
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

    &:hover {
        background-color: #3a125b;
    }

    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

#register-btn {
    margin-left: 3px;
}

.alert {
    padding: 10px;
    border-radius: 4px;
}

.alert-danger {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
}
</style>