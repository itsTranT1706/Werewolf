// package com.profile.entity;

// import com.profile.shared.enums.GameResult;
// import jakarta.persistence.*;
// import jakarta.validation.constraints.*;
// import lombok.*;
// import org.hibernate.annotations.CreationTimestamp;
// import org.hibernate.annotations.UpdateTimestamp;

// import java.time.LocalDateTime;

// @Entity
// @Table(name = "game_history")
// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class GameHistory {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @NotBlank(message = "User ID is required")
//     @Column(name = "user_id", nullable = false)
//     private String userId;

//     @NotBlank(message = "Game session ID is required")
//     @Column(name = "game_session_id", nullable = false)
//     private String gameSessionId;

//     @NotNull(message = "Game result is required")
//     @Enumerated(EnumType.STRING)
//     @Column(name = "game_result", nullable = false)
//     private GameResult gameResult;

//     @NotBlank(message = "Game mode is required")
//     @Column(name = "game_mode", nullable = false)
//     private String gameMode;

//     @Size(max = 500, message = "Description must not exceed 500 characters")
//     private String description;

//     @Column(columnDefinition = "TEXT")
//     private String metadata;

//     @Builder.Default
//     @Column(name = "score_earned")
//     private Integer scoreEarned = 0;

//     @Builder.Default
//     @Column(name = "experience_gained")
//     private Integer experienceGained = 0;

//     @Builder.Default
//     @Column(name = "duration_seconds")
//     private Integer durationSeconds = 0;

//     @Builder.Default
//     @Column(name = "rank_before")
//     private Integer rankBefore = 0;

//     @Builder.Default
//     @Column(name = "rank_after")
//     private Integer rankAfter = 0;

//     @CreationTimestamp
//     @Column(name = "created_at", updatable = false)
//     private LocalDateTime createdAt;

//     @UpdateTimestamp
//     @Column(name = "updated_at")
//     private LocalDateTime updatedAt;


// }