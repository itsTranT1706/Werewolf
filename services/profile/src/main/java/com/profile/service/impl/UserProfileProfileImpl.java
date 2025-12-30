package com.profile.service.impl;

import com.profile.dtos.request.InitProfileRequest;
import com.profile.dtos.request.UpdateProfileRequest;
import com.profile.dtos.response.UserProfileResponse;
import com.profile.entity.UserProfile;
import com.profile.exceptions.AppException;
import com.profile.mapper.UserMapper;
import com.profile.repository.UserProfileRepository;
import com.profile.service.IUserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileProfileImpl implements IUserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserMapper userMapper;
//    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserProfileResponse initProfile(InitProfileRequest request) {
        // Không cần check password, không cần encode
        if (userProfileRepository.existsById(request.getId())) {
            throw new AppException("User ID already exists: " + request.getId());
        }
        // Check if username already exists
        if (userProfileRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userProfileRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already exists: " + request.getEmail());
        }

        // Convert request to user entity
        UserProfile userProfile = userMapper.initProfileRequestToUserProfile(request);
        userProfile = UserProfile.builder()
                .id(request.getId())
                .username(request.getUsername())
                .email(request.getEmail())
                .displayName(request.getUsername()) // Default display name
                .avatarUrl("https://example.com/default-avatar.png") // Default avatar URL
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        UserProfile savedUserProfile = userProfileRepository.save(userProfile);
        return userMapper.userProfileToUserProfileResponse(savedUserProfile);
    }


    @Override
    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        log.info("Updating profile for user id: {}", userId);

        // 1. Tìm user trong DB
        UserProfile userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found with id: " + userId));

        // 2. Cập nhật từng trường nếu request có dữ liệu (Check null & empty)
        // Lưu ý: Không update username, email, password ở đây.


        if (request.getDisplayName() != null && !request.getDisplayName().isEmpty()) {
            userProfile.setDisplayName(request.getDisplayName());
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
            userProfile.setAvatarUrl(request.getAvatarUrl());
        }

        userProfile.setUpdatedAt(LocalDateTime.now());

        // 3. Lưu xuống DB
        UserProfile updatedUserProfile = userProfileRepository.save(userProfile);
        log.info("Profile updated successfully for user: {}", updatedUserProfile.getUsername());

        // 4. Convert sang Response
        return userMapper.userProfileToUserProfileResponse(updatedUserProfile);
    }
}
