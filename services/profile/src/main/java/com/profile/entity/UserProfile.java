package com.profile.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    private String id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(unique = true, nullable = false)
    private String username;

    @Size(max = 100, message = "Display name must not exceed 100 characters")
    @Column(name = "display_name")
    private String displayName;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(unique = true, nullable = false)
    private String email;


    @Builder.Default
    @Column(name = "total_point", nullable = false)
    private Integer totalPoint = 0;

    @Builder.Default
    @Column(name = "total_match", nullable = false)
    private Integer totalMatch = 0;

    @Builder.Default
    @Column(name = "win_match", nullable = false)
    private Integer winMatch = 0;

    @Builder.Default
    @Column(name = "lose_match", nullable = false)
    private Integer loseMatch = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
