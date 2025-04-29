<template>
    <div class="header">FrogCrew</div>
    <div class="register-container">
        <h1>Register New User</h1>
        <form @submit.prevent="handleRegister">
            <div class="form-group">
                <label for="firstName">First Name:</label>
                <input type="text" id="firstName" v-model="form.firstName" required
                    :class="{ 'is-invalid': errors.firstName }" />
                <div v-if="errors.firstName" class="invalid-feedback">
                    {{ errors.firstName }}
                </div>
            </div>

            <div class="form-group">
                <label for="lastName">Last Name:</label>
                <input type="text" id="lastName" v-model="form.lastName" required
                    :class="{ 'is-invalid': errors.lastName }" />
                <div v-if="errors.lastName" class="invalid-feedback">
                    {{ errors.lastName }}
                </div>
            </div>

            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" v-model="form.email" required :class="{ 'is-invalid': errors.email }" />
                <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                </div>
            </div>

            <div class="form-group">
                <label for="phone">Phone Number:</label>
                <input type="tel" id="phone" v-model="form.phone" @input="formatPhoneNumber" placeholder="123-456-7890"
                    required :class="{ 'is-invalid': errors.phone }" />
                <div v-if="errors.phone" class="invalid-feedback">
                    {{ errors.phone }}
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


            <button type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Registering...' : 'Register' }}
            </button>

            <router-link to="/">Back to login</router-link>

            <div v-if="registerError" class="alert alert-danger mt-3">
                {{ registerError }}
                <span v-if="emailExists">
                    <router-link to="/">Click here to login</router-link>
                </span>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: ''
});

const errors = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: ''
});

const isSubmitting = ref(false);
const registerError = ref('');
const emailExists = ref(false);

const validateForm = () => {
    let isValid = true;
    errors.value = { firstName: '', lastName: '', email: '', phone: '', password: '', role: '' };

    // First Name validation
    if (!form.value.firstName.trim()) {
        errors.value.firstName = 'First name is required';
        isValid = false;
    }

    // First Name validation
    if (!form.value.firstName.trim()) {
        errors.value.firstName = 'First name is required';
        isValid = false;
    }

    // Last Name validation
    if (!form.value.lastName.trim()) {
        errors.value.lastName = 'Last name is required';
        isValid = false;
    }

    // Email validation
    if (!form.value.email.trim()) {
        errors.value.email = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = 'Please enter a valid email';
        isValid = false;
    }

    // Phone validation
    if (!form.value.phone.trim()) {
        errors.value.phone = 'Phone number is required';
        isValid = false;
    } else if (!/^\d{3}-\d{3}-\d{4}$/.test(form.value.phone)) {
        errors.value.phone = 'Please use 123-456-7890 format';
        isValid = false;
    }

    // Password validation
    if (!form.value.password) {
        errors.value.password = 'Password is required';
        isValid = false;
    }

    return isValid;
};

const handleRegister = () => {
    if (!validateForm()) return;

    isSubmitting.value = true;
    registerError.value = '';
    emailExists.value = false;

    try {
        // Get existing users from localStorage or initialize empty array
        const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

        // Check if email already exists
        if (existingUsers.some(user => user.email === form.value.email)) {
            registerError.value = 'Email already registered';
            emailExists.value = true;
            return;
        }

        // Create new user object
        const newUser = {
            username: form.value.email.split('@')[0], // Generate username from email
            password: form.value.password,
            firstName: form.value.firstName,
            lastName: form.value.lastName,
            email: form.value.email,
            phone: form.value.phone,
            role: 'user',
            gameRegistered: [],
            gameAssigned: []
        };

        // Update localStorage
        localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));

        // :og in the new user
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', newUser.role);

        // Redirect to dashboard
        router.push('/user');
    } catch (error) {
        registerError.value = 'Registration failed. Please try again.';
        console.error('Registration error:', error);
    } finally {
        isSubmitting.value = false;
    }
};

const formatPhoneNumber = () => {
    // Remove all non-digit characters
    let numbers = form.value.phone.replace(/\D/g, '');

    // Apply formatting when we have enough digits
    if (numbers.length > 3 && numbers.length <= 6) {
        form.value.phone = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length > 6) {
        form.value.phone = `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
};
</script>

<style lang="scss" scoped>
.header {
    height: 50px;
    width: 99%;
    background-color: #4D1979;
    display: flex;
    align-items: center;
    padding-left: 20px;
    color: white;
}

.register-container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.is-invalid {
    border-color: #dc3545;
}

.invalid-feedback {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

button {
    background-color: #4D1979;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    margin-right: 10px;
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

.alert {
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1.5rem;
}

.alert-danger {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
}
</style>