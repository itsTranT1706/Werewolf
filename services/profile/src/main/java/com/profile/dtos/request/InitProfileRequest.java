package com.profile.dtos.request;

import lombok.Data;

// DTO chỉ dùng để nhận data từ Node.js
@Data
public class InitProfileRequest {
    private String id;
    private String username;
    private String email;
}