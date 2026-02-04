package common

import (
	"net/mail"
	"slices"

	"github.com/nyaruka/phonenumbers"
)

type Validator struct {
	Valid  bool
	Errors map[string]string
}

func (v *Validator) Add(key, value string) {

	v.Valid = false

	_, ok := v.Errors[key]

	if !ok {
		v.Errors[key] = value
	}
}

func PermittedValue[T comparable](value T, values ...T) bool {

	return slices.Contains(values, value)
}

func (v *Validator) Check(condition bool, key string, value string) {

	if condition {
		v.Add(key, value)
	}

}

func InitializeValidator() *Validator {
	return &Validator{Valid: true, Errors: map[string]string{}}
}

func (v *Validator) ValidateEmail(email string) bool {

	_, err := mail.ParseAddress(email)

	if err != nil {
		return false
	}
	return true
}

func (v *Validator) ValidatePhoneNum(number string, region string) bool {

	num, err := phonenumbers.Parse(number, region)

	if err != nil {
		return false
	}

	if !phonenumbers.IsValidNumberForRegion(num, region) {
		return false
	}

	return true

}
