package models

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"log"
	"time"
)

type SessionModel struct {
	DB QueryAble
}

type Session struct {
	Id        int       `json:"id"`
	FamilyId  int       `json:"family_id"`
	UserId    int       `json:"user_id"`
	Token     []byte    `json:"-"`
	PlainText string    `json:"token"`
	Approved  bool      `json:"approved"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

const AuthTokenTTL = time.Hour * 24 * 7
const MagicLinkTokenTTL = time.Minute * 5
const TokenLength = 43

func (m *SessionModel) Insert(familyId, userId int, approved bool, expires time.Time) (*Session, error) {

	session := Session{FamilyId: familyId, UserId: userId, Approved: approved, ExpiresAt: expires}

	hash, plaintext, err := session.GenerateToken()

	if err != nil {
		return nil, err
	}

	session.Token = hash
	session.PlainText = plaintext

	query := `INSERT INTO sessions (family_id, user_id, token, approved, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err = m.DB.QueryRowContext(ctx, query, session.FamilyId, session.UserId, session.Token, session.Approved, session.ExpiresAt).Scan(&session.Id, &session.CreatedAt)

	if err != nil {
		return nil, err
	}

	return &session, nil

}

func (m *SessionModel) RevokeWithToken(plaintext string) error {

	token := sha256.Sum256([]byte(plaintext))
	query := `DELETE FROM sessions WHERE token = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, token[:])
	return err
}

func (m *SessionModel) RevokeForUser(userId int, familyId int) error {

	query := `DELETE FROM sessions WHERE user_id = $1 AND family_id = $2`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, userId, familyId)
	return err
}

func (m *SessionModel) ApproveForUser(userId, familyId int) error {

	query := `UPDATE sessions SET approved = true WHERE user_id = $1 AND family_id = $2 AND approved = false`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, userId, familyId)
	return err

}

func (s *Session) GenerateToken() ([]byte, string, error) {

	randomBytes := make([]byte, 32)
	_, err := rand.Read(randomBytes)

	if err != nil {
		return nil, "", err
	}

	plaintext := base64.RawURLEncoding.EncodeToString(randomBytes)
	hash := sha256.Sum256([]byte(plaintext))
	return hash[:], plaintext, nil
}

func (m *SessionModel) Cleanup(ctx context.Context) {

	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {

		select {

		case <-ctx.Done():
			return

		case <-ticker.C:
			cleanupCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			query := `DELETE FROM sessions WHERE expires_at < NOW()`
			_, err := m.DB.ExecContext(cleanupCtx, query)
			cancel()

			if err != nil {
				log.Println("session cleanup failed: ", err)
			}
		}

	}
}
