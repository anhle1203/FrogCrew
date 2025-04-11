package edu.tcu.frogcrew.service;

import edu.tcu.frogcrew.model.User;
import edu.tcu.frogcrew.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("This email is already registered.");
        }
        return userRepository.save(user);
    }
}