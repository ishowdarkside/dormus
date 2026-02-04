package models

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"errors"
	"slices"
	"strings"
	"time"

	"github.com/ishowdarkside/family-manager/internal/common"
	"github.com/lib/pq"
	"github.com/nyaruka/phonenumbers"
)

var (
	ErrUserNotFound        = errors.New("user_not_found")
	ErrUserEmailAlreadyUse = errors.New("email_already_in_use")
	ErrUserPhoneAlreadyUse = errors.New("phone_number_already_in_use")
)

type IdentifierType string

var (
	IdentifierEmail IdentifierType = "email"
	IdentifierPhone IdentifierType = "phone"
)

type UserRole string

var (
	UserGenderMale   = "male"
	UserGenderFemale = "female"
)

var (
	UserRoleParent UserRole = "parent"
	UserRoleChild  UserRole = "child"
)

type UserModel struct {
	DB QueryAble
}

func (m *UserModel) Insert(familyId int, u *User) error {

	query := `INSERT INTO users
	(family_id, role, age, gender, name, region, phone_number, email, date_joined)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	RETURNING id, created_at, family_id`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, familyId, u.Role, u.Age, u.Gender, u.Name, u.Region, u.PhoneNumber, u.Email, u.DateJoined).Scan(&u.Id, &u.CreatedAt, &u.FamilyId)

	if err != nil {

		var pqErr *pq.Error
		if errors.As(err, &pqErr) {
			if pqErr.Constraint == "users_email_key" {
				return ErrUserEmailAlreadyUse
			}

			if pqErr.Constraint == "users_phone_number_key" {
				return ErrUserPhoneAlreadyUse
			}
		}

		return err

	}
	return err

}

func (m *UserModel) GetForToken(tokenPlainText string) (*User, error) {

	query := `SELECT users.id, users.family_id, users.created_at, users.updated_at, users.version, users.role, users.age, users.gender, users.name
	 FROM users INNER JOIN sessions ON sessions.user_id = users.id WHERE sessions.token = $1 AND sessions.approved = true AND sessions.expires_at > NOW();`

	hash := sha256.Sum256([]byte(tokenPlainText))

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()

	user := User{}
	err := m.DB.QueryRowContext(ctx, query, hash[:]).Scan(&user.Id, &user.FamilyId, &user.CreatedAt, &user.UpdatedAt, &user.Version, &user.Role, &user.Age, &user.Gender, &user.Name)

	if err != nil {

		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}

		return nil, err
	}

	return &user, nil

}

func (m *UserModel) GetForIdentifier(input string, identifier IdentifierType) (*User, error) {

	var user User

	emailQuery := `SELECT id, email, name, family_id FROM users WHERE email = $1 AND date_joined IS NOT NULL`
	phoneQuery := `SELECT id, email, name, family_id FROM users WHERE phone_number = $1 AND date_joined IS NOT NULL`

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()

	var err error
	if identifier == IdentifierPhone {
		err = m.DB.QueryRowContext(ctx, phoneQuery, input).Scan(&user.Id, &user.Email, &user.Name, &user.FamilyId)
	} else {
		err = m.DB.QueryRowContext(ctx, emailQuery, input).Scan(&user.Id, &user.Email, &user.Name, &user.FamilyId)
	}

	if err != nil {
		return nil, err
	}

	return &user, nil

}

func (m *UserModel) GetById(id int) (*User, error) {

	var user User
	query := `SELECT 
				id, family_id, created_at, updated_at, date_joined,
				version, role, age, gender, name,
				phone_number, region, email FROM users WHERE id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&user.Id,
		&user.FamilyId,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.DateJoined,
		&user.Version,
		&user.Role,
		&user.Age,
		&user.Gender,
		&user.Name,
		&user.PhoneNumber,
		&user.Region,
		&user.Email)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (m *UserModel) Delete(userId, familyId int) error {

	query := `DELETE FROM users WHERE id = $1 AND family_id = $2`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, userId, familyId)
	return err
}

func (m *UserModel) Update(u *User) error {

	query := `UPDATE  users SET 
                      version = version + 1,
                      updated_at = NOW(),
                      role = $1,
                      age = $2,
                      gender = $3,
                      name = $4,
                      email = $5,
                      phone_number = $6,
                      date_joined = $7,
                      last_seen = $8 WHERE id = $9
                      RETURNING  version,updated_at`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, u.Role, u.Age, u.Gender, u.Name, u.Email, u.PhoneNumber, u.DateJoined, u.LastSeen, u.Id).Scan(&u.Version, &u.UpdatedAt)
	return err
}

func (m *UserModel) GetForFamily(familyId int) ([]*User, error) {

	query := `SELECT 
				id, family_id, created_at, updated_at, date_joined,
				version, role, age, gender, name,
				phone_number, region, email FROM users WHERE family_id = $1 ORDER BY id`
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, familyId)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var users []*User

	for rows.Next() {

		var user User
		err := rows.Scan(
			&user.Id,
			&user.FamilyId,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.DateJoined,
			&user.Version,
			&user.Role,
			&user.Age,
			&user.Gender,
			&user.Name,
			&user.PhoneNumber,
			&user.Region,
			&user.Email)

		if err != nil {
			return nil, err
		}

		users = append(users, &user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

type User struct {
	Id        int       `json:"id"`
	FamilyId  int       `json:"family_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at,omitzero"`
	Version   int       `json:"version"`
	Role      UserRole  `json:"role"`
	// Status    string    `json:"status"`
	// AvatarId  int       `json:"avatar_id"`
	PhoneNumber string     `json:"phone_number"`
	Email       string     `json:"email"`
	Age         int        `json:"age"`
	Gender      string     `json:"gender"`
	Name        string     `json:"name"`
	Region      string     `json:"region"`
	LastSeen    time.Time  `json:"last_seen,omitzero"`
	DateJoined  *time.Time `json:"date_joined"`
}

func (u *User) Validate(v *common.Validator) {

	v.Check(u.Age <= 0, "age", "input_positive_number")
	v.Check(u.Age > 100, "age", "age_must_be_realistic")
	v.Check(u.Age < 18 && u.Role == UserRoleParent, "age", "must_be_legally_authorized")

	v.Check(u.Role == "", "role", "must_be_provided")
	v.Check(!slices.Contains([]UserRole{UserRoleChild, UserRoleParent}, u.Role), "role", "must_be_valid_role")

	v.Check(u.Gender == "", "gender", "must_be_provided")
	v.Check(!slices.Contains([]string{UserGenderMale, UserGenderFemale}, u.Gender), "gender", "must_provide_valid_gender")

	v.Check(u.Name == "", "name", "must_be_provided")
	v.Check(len(strings.Split(u.Name, " ")) == 1, "name", "name_provide_full")
	v.Check(u.Email == "", "email", "must_be_provided")
	v.Check(!v.ValidateEmail(u.Email), "email", "must_be_valid")

	v.Check(u.PhoneNumber == "", "phone_number", "must_be_provided")

	isValidPhoneNum := v.ValidatePhoneNum(u.PhoneNumber, u.Region)
	v.Check(!isValidPhoneNum, "phone_number", "invalid_as_per_region")

	v.Check(u.Region == "", "region", "must_be_provided")

	if u.Region != "" {

		supportedRegions := phonenumbers.GetSupportedRegions()
		_, ok := supportedRegions[u.Region]

		if !ok {
			v.Add("region", "must_be_valid")
		}
	}

}
