package com.profile.controller;

import com.profile.dtos.ApiResponse;
import com.profile.dtos.request.InitProfileRequest;
import com.profile.dtos.request.UpdateProfileRequest;
import com.profile.dtos.response.UserProfileResponse;
import com.profile.service.IUserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-profile")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final IUserProfileService userService;

    // API này dành cho Node.js gọi sang
    @PostMapping("/internal/init")
    public ResponseEntity<ApiResponse<UserProfileResponse>> initProfile(@RequestBody InitProfileRequest request) {
        UserProfileResponse response = userService.initProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserProfileResponse> getProfile(@PathVariable String id) {
        UserProfileResponse response = userService.getProfile(id);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}")
    public ApiResponse<UserProfileResponse> updateProfile(
            @PathVariable String id,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserProfileResponse result = userService.updateProfile(id, request);

        return ApiResponse.success(result);
    }
}
