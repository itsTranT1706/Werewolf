package com.profile.repository;

import com.profile.entity.GameHistory;
import com.profile.shared.enums.GameResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameHistoryRepository extends JpaRepository<GameHistory, Long> {

    Page<GameHistory> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<GameHistory> findByUserIdAndGameResult(String userId, GameResult gameResult);

    List<GameHistory> findByGameSessionId(String gameSessionId);

    List<GameHistory> findByUserIdAndGameMode(String userId, String gameMode);

    @Query("SELECT gh FROM GameHistory gh WHERE gh.userId = :userId AND gh.createdAt BETWEEN :startDate AND :endDate ORDER BY gh.createdAt DESC")
    List<GameHistory> findByUserIdAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(gh.scoreEarned) FROM GameHistory gh WHERE gh.userId = :userId")
    Integer getTotalScoreEarnedByUserId(@Param("userId") String userId);

    @Query("SELECT SUM(gh.experienceGained) FROM GameHistory gh WHERE gh.userId = :userId")
    Integer getTotalExperienceGainedByUserId(@Param("userId") String userId);

    @Query("SELECT AVG(gh.durationSeconds) FROM GameHistory gh WHERE gh.userId = :userId AND gh.durationSeconds > 0")
    Double getAverageGameDurationByUserId(@Param("userId") String userId);

    long countByUserId(String userId);

    long countByUserIdAndGameResult(String userId, GameResult gameResult);

    long countByUserIdAndGameMode(String userId, String gameMode);

    @Query("SELECT COUNT(gh) FROM GameHistory gh WHERE gh.userId = :userId AND gh.gameResult = 'VICTORY'")
    long countVictoriesByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(gh) FROM GameHistory gh WHERE gh.userId = :userId AND gh.gameResult = 'DEFEAT'")
    long countDefeatsByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(gh) FROM GameHistory gh WHERE gh.userId = :userId AND gh.gameResult = 'DRAW'")
    long countDrawsByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(DISTINCT gh.gameMode) FROM GameHistory gh WHERE gh.userId = :userId")
    long countDistinctGameModesByUserId(@Param("userId") String userId);

    @Query("SELECT gh FROM GameHistory gh WHERE gh.userId = :userId ORDER BY gh.scoreEarned DESC")
    List<GameHistory> findTopScoresByUserId(@Param("userId") String userId, Pageable pageable);

    Optional<GameHistory> findByGameSessionIdAndUserId(String gameSessionId, String userId);

    void deleteByUserId(String userId);

    void deleteByGameSessionId(String gameSessionId);
}