package com.profile.service.impl;

import com.profile.dtos.request.CreateUserRequest;
import com.profile.dtos.request.UpdateProfileRequest;
import com.profile.dtos.response.UserResponse;
import com.profile.entity.User;
import com.profile.exceptions.AppException;
import com.profile.mapper.UserMapper;
import com.profile.repository.UserRepository;
import com.profile.service.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileImpl implements IUserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
//    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating user with username: {}", request.getUsername());

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already exists: " + request.getEmail());
        }

        // Convert request to user entity
        User user = userMapper.createUserRequestToUser(request);

        // Encode password
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPassword((request.getPassword()));

        User savedUser = userRepository.save(user);
        log.info("User created successfully with id: {}", savedUser.getId());

        // Convert saved user to response
        return userMapper.userToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        log.info("Updating profile for user id: {}", userId);

        // 1. Tìm user trong DB
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found with id: " + userId));

        // 2. Cập nhật từng trường nếu request có dữ liệu (Check null & empty)
        // Lưu ý: Không update username, email, password ở đây.

        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        if (request.getDisplayName() != null && !request.getDisplayName().isEmpty()) {
            user.setDisplayName(request.getDisplayName());
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user.setUpdatedAt(LocalDateTime.now());

        // 3. Lưu xuống DB
        User updatedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", updatedUser.getUsername());

        // 4. Convert sang Response
        return userMapper.userToUserResponse(updatedUser);
    }
}
