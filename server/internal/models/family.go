package models

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"strings"
	"time"

	"github.com/ishowdarkside/family-manager/internal/common"
)

type FamilyModel struct {
	DB QueryAble
}

type InviteTokenType string

func (i *InviteTokenType) ValidateInviteToken(v *common.Validator) {
	v.Check(len(*i) != 8, "invite_token", "invalid_invite_token")
}

type Family struct {
	Id          int             `json:"id"`
	Name        string          `json:"name"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"-"`
	Version     int             `json:"version"`
	InviteToken InviteTokenType `json:"invite_token"`
}

func (m *FamilyModel) Insert(family *Family) error {

	query := `INSERT INTO family (name, invite_token) VALUES ($1, $2) RETURNING id, created_at, version`
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	inviteToken, err := family.GenerateToken()
	if err != nil {
		return err
	}

	err = m.DB.QueryRowContext(ctx, query, family.Name, inviteToken).Scan(&family.Id, &family.CreatedAt, &family.Version)
	return err
}

func (m *FamilyModel) GetForId(id int) (*Family, error) {

	query := "SELECT id, name, created_at, updated_at, version, invite_token FROM family WHERE id = $1"
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var family Family
	err := m.DB.QueryRowContext(ctx, query, id).Scan(&family.Id, &family.Name, &family.CreatedAt, &family.UpdatedAt, &family.Version, &family.InviteToken)
	if err != nil {
		return nil, err
	}

	return &family, nil

}

func (m *FamilyModel) Update(f *Family) error {

	query := `UPDATE family SET 
                  name = $1,
				  version = version + 1,
				  invite_token = $2,
				  updated_at = NOW()
				WHERE id = $3 RETURNING updated_at
`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, f.Name, f.InviteToken, f.Id).Scan(&f.UpdatedAt)
	return err

}

func (m *FamilyModel) GetForInviteToken(token InviteTokenType) (*Family, error) {

	var family Family
	query := "SELECT id, name, created_at, updated_at, version, invite_token FROM family WHERE invite_token = $1"
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, token).Scan(&family.Id, &family.Name, &family.CreatedAt, &family.UpdatedAt, &family.Version, &family.InviteToken)
	if err != nil {
		return nil, err
	}

	return &family, nil
}

func (f *Family) GenerateToken() (InviteTokenType, error) {

	randomBytes := make([]byte, 4)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", err
	}

	plaintext := strings.ToUpper(hex.EncodeToString(randomBytes))
	return InviteTokenType(plaintext), nil

}

func (f *Family) Validate(v *common.Validator) {

	v.Check(f.Name == "", "family_name", "family_name_must_be_provided")
	v.Check(len(f.Name) < 5, "family_name", "family_name_insufficient_length")

}
